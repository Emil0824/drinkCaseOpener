import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

/**
 * Drinkoteket.se Scraper
 * Scrapes drink recipes from drinkoteket.se and stores them locally
 */
class DrinkoteketScraper {
  constructor() {
    this.baseUrl = 'https://drinkoteket.se';
    this.allDrinksUrl = `${this.baseUrl}/alla-drinkar/`;
    this.dataDir = path.join(process.cwd(), '..', 'data-immutable');
    this.drinksFile = path.join(this.dataDir, 'drinks.json');
    this.categoriesFile = path.join(this.dataDir, 'categories.json');
    this.ingredientsFile = path.join(this.dataDir, 'ingredients.json');
    this.requestDelay = 500;

    // User agent to identify ourselves properly
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    
    // Global data collections to avoid race conditions
    this.allIngredients = new Set();
    this.allCategories = {};
    this.allDrinks = [];
  }

  /**
   * Initialize scraper and create necessary directories
   */
  async initDirs() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      console.log('📁 Data directory initialized');
    } catch (error) {
      console.error('❌ Error creating data directory:', error.message);
    }
  }

  /**
   * Add delay between requests to be respectful to the server
   */
  async delay(ms = this.requestDelay) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Make HTTP request with proper headers and error handling
   */
  async makeRequest(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        },
        timeout: 10000, // 10 seconds timeout
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error fetching ${url}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all drink URLs from the main drinks page and pagination
   */
  async getAllDrinkUrls() {
    console.log('🔍 Fetching all drink URLs...');
    const allUrls = new Set(); // Use Set to avoid duplicates
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      try {
        const pageUrl = currentPage === 1 ? this.allDrinksUrl : `${this.allDrinksUrl}page/${currentPage}/`;
        console.log(`📄 Fetching page ${currentPage}...`);
        
        const html = await this.makeRequest(pageUrl);
        const $ = cheerio.load(html);

        // Find all drink links - they appear as h3 > a elements
        const drinkLinks = $('h3 > a[href*="/recept/"]');
        
        if (drinkLinks.length === 0) {
          hasMorePages = false;
          break;
        }

        drinkLinks.each((index, element) => {
          const href = $(element).attr('href');
          if (href && href.includes('/recept/')) {
            // Convert relative URLs to absolute
            const fullUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
            allUrls.add(fullUrl);
          }
        });

        console.log(`   Found ${drinkLinks.length} drinks on page ${currentPage}`);
        
        // Check if there's a next page
        const nextPageLink = $('a[href*="/alla-drinkar/page/"]').filter((i, el) => 
          $(el).text().includes('»') || $(el).text() == (currentPage + 1).toString()
        );

        if (nextPageLink.length === 0) {
          hasMorePages = false;
        } else {
          currentPage++;
          await this.delay(); // Be respectful with delays
        }

      } catch (error) {
        console.error(`❌ Error fetching page ${currentPage}:`, error.message);
        hasMorePages = false;
      }
    }

    console.log(`✅ Found ${allUrls.size} unique drink URLs across ${currentPage} pages`);
    return Array.from(allUrls);
  }

  /**
   * Extract drink data from individual recipe page
   */
  async scrapeDrinkDetails(url) {
    try {
      console.log(`🍹 Scraping: ${url}`);
      const html = await this.makeRequest(url);
      const $ = cheerio.load(html);

      // Extract drink name from title or h1
      const name = $('h1').first().text().trim() || 
                  $('title').text().replace(' - Drinkoteket', '').trim();

      // Extract image URL - look for the main recipe image with itemprop="image"
      let image = '';
      const mainImageElement = $('img[itemprop="image"]').first();
      if (mainImageElement.length) {
        image = mainImageElement.attr('src') || mainImageElement.attr('data-rstmb') || '';
      }

      // Extract ingredients - look for the ingredients section more precisely
      const ingredients = [];
      const standaloneIngredients = [];
      
      // Look for ingredients in ul.ingredients
      $('ul.ingredients li').each((index, li) => {
        const spans = $(li).find('span');
        if (spans.length >= 2) {
          // First span contains the amount, second span contains the ingredient name
          const ingredient = $(spans[0]).text().trim();
          const standaloneIngredient = $(spans[1]).text().trim();
          if (standaloneIngredient && ingredient) {
            ingredients.push(ingredient);
            standaloneIngredients.push(standaloneIngredient);
            this.addIngredientToGlobal(standaloneIngredient);
          }
        }
      });
      
      // Extract rating if available - look for rating patterns
      let rating = null;
      const allText = $.text();
      const ratingPatterns = [
        /Betyg:\s*(\d+(?:\.\d+)?)\/5/i,
        /(\d+(?:\.\d+)?)\/5\s*\(\d+\s*recensioner?\)/i,
        /Rating:\s*(\d+(?:\.\d+)?)/i
      ];

      for (const pattern of ratingPatterns) {
        const match = allText.match(pattern);
        if (match) {
          rating = parseFloat(match[1]);
          break;
        }
      }

      // Extract preparation time - look for time patterns
      let prepTime = null;
      const timePatterns = [
        /Förberedelsetid:\s*(\d+)\s*minuter?/i,
        /Tillredningstid:\s*(\d+)\s*minuter?/i,
        /Prep time:\s*(\d+)\s*min/i
      ];
      
      for (const pattern of timePatterns) {
        const match = allText.match(pattern);
        if (match) {
          prepTime = parseInt(match[1]);
          break;
        }
      }

      // Create drink object
      const drinkSlug = this.extractSlugFromUrl(url);
      const drink = {
        name,
        slug: drinkSlug,
        url,
        image,
        ingredients: ingredients.filter(ing => ing.length > 0),
        ingredientSlug: standaloneIngredients.filter(ing => ing.length > 0),
        rating,
        prepTime,
        scrapedAt: new Date().toISOString()
      };

      // Validate that we got essential data
      if (!drink.name || drink.ingredients.length === 0) {
        console.warn(`⚠️  Incomplete data for ${url}`);
        return null;
      }

      // Extract categories
      let drinkCategories = [];
      $('.display-recipe-terms a.related-terms').each((index, element) => {
        const categoryText = $(element).text().trim();
        if (categoryText) {
          drinkCategories.push(categoryText);
        }
      });

      this.addDrinkToGlobalCategories(drinkCategories, drink.slug);

      console.log(`✅ Successfully scraped: ${drink.name}`);
      return drink;

    } catch (error) {
      console.error(`❌ Error scraping ${url}:`, error.message);
      return null;
    }
  }

  /**
   * Extract slug from URL
   */
  extractSlugFromUrl(url) {
    const match = url.match(/\/recept\/([^\/]+)\/?$/);
    return match ? match[1] : '';
  }

  /**
   * Load existing categories data
   */
  async loadExistingCategories() {
    try {
      const data = await fs.readFile(this.categoriesFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📄 No existing categories file found, starting fresh');
        return {};
      }
      throw error;
    }
  }

  /**
   * Save categories data to JSON file
   */
  async saveCategories(categories) {
    try {
      await fs.writeFile(this.categoriesFile, JSON.stringify(categories, null, 2), 'utf8');
      console.log(`💾 Saved categories to ${this.categoriesFile}`);
    } catch (error) {
      console.error('❌ Error saving categories:', error.message);
      throw error;
    }
  }

  /**
   * Add drink to categories
   */
  addDrinkToGlobalCategories(drinkCategories, drinkSlug) {
    for (const categoryName of drinkCategories) {
      if (!this.allCategories[categoryName]) {
        this.allCategories[categoryName] = [];
        console.log(`🆕 Created new category: ${categoryName}`);
      }

      // Add drink to category if not already present
      if (!this.allCategories[categoryName].includes(drinkSlug)) {
        this.allCategories[categoryName].push(drinkSlug);
        console.log(`📂 Added ${drinkSlug} to category: ${categoryName}`);
      }
    }
  }

  /**
   * Save drinks data to JSON file
   */
  async saveDrinks(drinks) {
    try {
      const validDrinks = drinks.filter(drink => drink !== null);
      await fs.writeFile(this.drinksFile, JSON.stringify(validDrinks, null, 2), 'utf8');
      console.log(`💾 Saved ${validDrinks.length} drinks to ${this.drinksFile}`);
    } catch (error) {
      console.error('❌ Error saving drinks:', error.message);
      throw error;
    }
  }

  /**
   * Load existing ingredients data
   */
  async loadExistingIngredients() {
    try {
      const data = await fs.readFile(this.ingredientsFile, 'utf8');
      const ingredientsData = JSON.parse(data);
      return new Set(ingredientsData.ingredients || []);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📄 No existing ingredients file found, starting fresh');
        return new Set();
      }
      throw error;
    }
  }

  /**
   * Save ingredients data to JSON file
   */
  async saveIngredients(ingredientsSet) {
    try {
      const ingredientsArray = Array.from(ingredientsSet).sort();
      const ingredientsData = {
        ingredients: ingredientsArray,
        count: ingredientsArray.length,
        lastUpdated: new Date().toISOString()
      };
      await fs.writeFile(this.ingredientsFile, JSON.stringify(ingredientsData, null, 2), 'utf8');
      console.log(`🥗 Saved ${ingredientsArray.length} unique ingredients to ${this.ingredientsFile}`);
    } catch (error) {
      console.error('❌ Error saving ingredients:', error.message);
      throw error;
    }
  }

  /**
   * Add a standalone ingredient to the ingredients collection
   */
  addIngredientToGlobal(ingredientName) {
    if (!ingredientName || typeof ingredientName !== 'string') {
      return;
    }

    if (!this.allIngredients.has(ingredientName)) {
      this.allIngredients.add(ingredientName);
      console.log(`🆕 Added new ingredient: ${ingredientName}`);
    }
  }

  /**
   * Initialize global collections with existing data
   */
  async initializeGlobalCollections() {
    this.allIngredients = new Set();
    this.allCategories = {};
    this.allDrinks = [];
  }

  /**
   * Save all global collections to JSON files
   */
  async saveAllCollections() {
    try {
      console.log('\n💾 Saving all data to JSON files...');
      await this.saveIngredients(this.allIngredients);
      await this.saveCategories(this.allCategories);
      await this.saveDrinks(this.allDrinks);
    } catch (error) {
      console.error('❌ Error saving collections:', error.message);
      throw error;
    }
  }

  /**
   * Main scraping method
   */
  async scrapeAll(maxDrinks = null) {
    console.log('🚀 Starting Drinkoteket scraper...');
    
    await this.initDirs();
    await this.initializeGlobalCollections();

    try {
      // Get all drink URLs
      const drinkUrls = await this.getAllDrinkUrls();
      
      if (drinkUrls.length === 0) {
        console.log('❌ No drink URLs found');
        return;
      }

      // Limit drinks if specified
      const urlsToScrape = maxDrinks ? drinkUrls.slice(0, maxDrinks) : drinkUrls;
      console.log(`🎯 Scraping ${urlsToScrape.length} drinks...`);

      let successCount = 0;
      let errorCount = 0;

      // Scrape each drink with progress tracking
      for (let i = 0; i < urlsToScrape.length; i++) {
        const url = urlsToScrape[i];
        
        try {
          const drink = await this.scrapeDrinkDetails(url);
          
          if (drink) {
            this.allDrinks.push(drink);
            successCount++;
          } else {
            errorCount++;
          }

          // Progress update every 10 drinks
          if ((i + 1) % 10 === 0) {
            console.log(`📊 Progress: ${i + 1}/${urlsToScrape.length} (${successCount} successful, ${errorCount} failed)`);
          }

          // Respectful delay between requests
          await this.delay();

        } catch (error) {
          console.error(`❌ Failed to scrape ${url}:`, error.message);
          errorCount++;
        }
      }

      // Save all collected data at the end
      await this.saveAllCollections();
      
      console.log('\n🎉 Scraping completed!');
      console.log(`✅ Successfully scraped: ${successCount} drinks`);
      console.log(`❌ Failed to scrape: ${errorCount} drinks`);
      console.log(`🥗 Total unique ingredients: ${this.allIngredients.size}`);
      console.log(`📂 Total categories: ${Object.keys(this.allCategories).length}`);

      return this.allDrinks;

    } catch (error) {
      console.error('💥 Scraping failed:', error.message);
      throw error;
    }
  }
}

export default DrinkoteketScraper;
