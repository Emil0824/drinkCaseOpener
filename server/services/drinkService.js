import fs from 'fs/promises';
import path from 'path';

/**
 * Service for managing drink data
 * Handles loading, filtering, and serving scraped drink data
 */
class DrinkService {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.drinksFile = path.join(this.dataDir, 'drinks.json');
    this.categoriesFile = path.join(this.dataDir, 'categories.json');
    this.drinks = null;
    this.categories = null;
    this.lastLoaded = null;
    this.lastCategoriesLoaded = null;
  }

  /**
   * Load drinks from JSON file
   */
  async loadDrinks() {
    try {
      const stats = await fs.stat(this.drinksFile);
      
      // Only reload if file has been modified or not loaded yet
      if (!this.drinks || !this.lastLoaded || stats.mtime > this.lastLoaded) {
        console.log('📖 Loading drinks data...');
        const data = await fs.readFile(this.drinksFile, 'utf8');
        this.drinks = JSON.parse(data);
        this.lastLoaded = new Date();
        console.log(`✅ Loaded ${this.drinks.length} drinks`);
      }
      
      return this.drinks;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn('⚠️  No drinks data found. Please run the scraper first.');
        return [];
      }
      console.error('❌ Error loading drinks:', error.message);
      throw error;
    }
  }

  /**
   * Load categories from JSON file
   */
  async loadCategories() {
    try {
      const stats = await fs.stat(this.categoriesFile);
      
      // Only reload if file has been modified or not loaded yet
      if (!this.categories || !this.lastCategoriesLoaded || stats.mtime > this.lastCategoriesLoaded) {
        console.log('📖 Loading categories data...');
        const data = await fs.readFile(this.categoriesFile, 'utf8');
        this.categories = JSON.parse(data);
        this.lastCategoriesLoaded = new Date();
        console.log(`✅ Loaded ${Object.keys(this.categories).length} categories`);
      }
      
      return this.categories;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn('⚠️  No categories data found. Categories will be empty.');
        return {};
      }
      console.error('❌ Error loading categories:', error.message);
      throw error;
    }
  }

  /**
   * Get all drinks
   */
  async getAllDrinks() {
    await this.loadDrinks();
    return this.drinks || [];
  }

  /**
   * Get a random drink
   */
  async getRandomDrink() {
    const drinks = await this.getAllDrinks();
    if (drinks.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * drinks.length);
    return drinks[randomIndex];
  }

  /**
   * Get multiple random drinks
   */
  async getRandomDrinks(count = 5) {
    const drinks = await this.getAllDrinks();
    if (drinks.length === 0) return [];
    
    // Shuffle drinks array and take first 'count' items
    const shuffled = [...drinks].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, drinks.length));
  }

  /**
   * Get drinks by category
   */
  async getDrinksByCategory(categoryName) {
    const categories = await this.loadCategories();
    const drinks = await this.getAllDrinks();
    
    // Find the exact category or match by name (case insensitive)
    let drinkSlugs = [];
    
    // Try exact match first
    if (categories[categoryName]) {
      drinkSlugs = categories[categoryName];
    } else {
      // Try case-insensitive match
      const matchingCategory = Object.keys(categories).find(key => 
        key.toLowerCase() === categoryName.toLowerCase()
      );
      if (matchingCategory) {
        drinkSlugs = categories[matchingCategory];
      }
    }
    
    // Filter drinks by slugs found in the category
    return drinks.filter(drink => drinkSlugs.includes(drink.slug));
  }

  /**
   * Search drinks by name
   */
  async searchDrinks(query) {
    const drinks = await this.getAllDrinks();
    const lowerQuery = query.toLowerCase();
    
    return drinks.filter(drink =>
      drink.name.toLowerCase().includes(lowerQuery) ||
      drink.ingredients.some(ing => ing.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get drink by slug
   */
  async getDrinkBySlug(slug) {
    const drinks = await this.getAllDrinks();
    return drinks.find(drink => drink.slug === slug);
  }

  /**
   * Get available categories
   */
  async getCategories() {
    const categories = await this.loadCategories();
    return Object.keys(categories).sort();
  }

  /**
   * Get categories for a specific drink by slug
   */
  async getCategoriesForDrink(drinkSlug) {
    const categories = await this.loadCategories();
    const drinkCategories = [];
    
    for (const [categoryName, drinks] of Object.entries(categories)) {
      if (drinks.includes(drinkSlug)) {
        drinkCategories.push(categoryName);
      }
    }
    
    return drinkCategories;
  }

  /**
   * Get drinks statistics
   */
  async getStats() {
    const drinks = await this.getAllDrinks();
    const categories = await this.getCategories();
    const categoryData = await this.loadCategories();
    
    const stats = {
      totalDrinks: drinks.length,
      totalCategories: categories.length,
      categories: categories,
      avgRating: null,
      lastScraped: null,
      categoryStats: {}
    };

    // Add category statistics
    for (const categoryName of categories) {
      if (categoryData[categoryName]) {
        stats.categoryStats[categoryName] = categoryData[categoryName].length;
      }
    }

    // Calculate average rating
    const ratingsExist = drinks.filter(d => d.rating !== null && d.rating !== undefined);
    if (ratingsExist.length > 0) {
      const avgRating = ratingsExist.reduce((sum, d) => sum + d.rating, 0) / ratingsExist.length;
      stats.avgRating = Math.round(avgRating * 10) / 10;
    }

    // Find most recent scrape date
    if (drinks.length > 0) {
      const scrapeDates = drinks
        .map(d => d.scrapedAt)
        .filter(date => date)
        .sort()
        .reverse();
      
      if (scrapeDates.length > 0) {
        stats.lastScraped = scrapeDates[0];
      }
    }

    return stats;
  }

  /**
   * Generate case opening data
   * Returns a list of drinks with the winning drink in a specific position
   */
  async generateCaseOpening(caseType = 'random', winningPosition = null) {
    console.log(`🎲 Generating case opening for type: ${caseType}`);
    
    const drinks = await this.getAllDrinks();
    if (drinks.length === 0) {
      throw new Error('No drinks available for case opening');
    }

    // Filter drinks by case type if specified
    let availableDrinks = drinks;
    if (caseType !== 'random') {
      availableDrinks = await this.getDrinksByCategory(caseType);
      console.log(`🔍 Filtered drinks for category '${caseType}': ${availableDrinks.length}`);
      
      if (availableDrinks.length === 0) {
        // Fallback to all drinks if category is empty
        availableDrinks = drinks;
        console.log(`⚠️ No drinks found for category, using all drinks`);
      }
    }

    // Generate a list of random drinks for the case opening animation
    const caseSize = 30; // Number of drinks to show in the spinning animation
    const winningIndex = winningPosition || Math.floor(Math.random() * (caseSize - 10)) + 10; // Win between 10-20
    
    console.log(`🎯 Winning index will be: ${winningIndex}`);
    
    const caseDrinks = [];
    
    // Fill the case with random drinks
    for (let i = 0; i < caseSize; i++) {
      const randomDrink = availableDrinks[Math.floor(Math.random() * availableDrinks.length)];
      caseDrinks.push(randomDrink);
    }

    // Ensure we have a special winning drink at the winning position
    const winningDrink = availableDrinks[Math.floor(Math.random() * availableDrinks.length)];
    caseDrinks[winningIndex] = winningDrink;

    console.log(`🏆 Winning drink: ${winningDrink.name}`);
    console.log(`📦 Case drinks generated: ${caseDrinks.length} items`);

    return {
      drinks: caseDrinks,
      winningIndex: winningIndex,
      winningDrink: winningDrink,
      caseType: caseType
    };
  }


}

export default DrinkService;
