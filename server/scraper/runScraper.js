#!/usr/bin/env node

/**
 * CLI tool for running the Drinkoteket scraper
 * Usage: node scraper/runScraper.js [command] [options]
 */

import DrinkoteketScraper from './drinkoteketScraper.js';

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';

const scraper = new DrinkoteketScraper();

/**
 * Display help information
 */
function showHelp() {
  console.log(`
🍹 Drinkoteket Scraper CLI

Usage: node scraper/runScraper.js [command] [options]

Commands:
  scrape [limit]    Scrape all drinks (optionally limit number)
  update           Update existing database with new drinks
  test             Scrape just 5 drinks for testing
  help             Show this help message

Examples:
  node scraper/runScraper.js scrape        # Scrape all drinks
  node scraper/runScraper.js scrape 50     # Scrape first 50 drinks
  node scraper/runScraper.js update        # Update with new drinks only
  node scraper/runScraper.js test          # Test scrape 5 drinks

Note: The scraper is respectful and includes delays between requests.
Full scraping may take several hours depending on the number of drinks.
`);
}

/**
 * Main CLI handler
 */
async function main() {
  try {
    switch (command) {
      case 'scrape':
        const limit = args[1] ? parseInt(args[1]) : null;
        if (limit && isNaN(limit)) {
          console.error('❌ Limit must be a number');
          process.exit(1);
        }
        
        console.log(limit ? `🎯 Scraping ${limit} drinks...` : '🌍 Scraping all drinks...');
        await scraper.scrapeAll(limit);
        break;

      case 'update':
        console.log('🔄 Updating drinks database...');
        await scraper.updateDrinks();
        break;

      case 'test':
        console.log('🧪 Test scraping 5 drinks...');
        await scraper.scrapeAll(5);
        break;

      case 'help':
      case '--help':
      case '-h':
        showHelp();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('Use "node scraper/runScraper.js help" for usage information');
        process.exit(1);
    }

    console.log('🎉 Operation completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('💥 Operation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the CLI
main();
