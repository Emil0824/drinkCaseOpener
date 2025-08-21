import express from 'express';
import DrinkService from '../services/drinkService.js';

const router = express.Router();
const drinkService = new DrinkService();

// Get all drinks
router.get('/', async (req, res) => {
  try {
    const drinks = await drinkService.getAllDrinks();
    res.json({ success: true, data: drinks });
  } catch (error) {
    console.error('Error fetching drinks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drinks' });
  }
});

// Get drinks statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await drinkService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching drink stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drink statistics' });
  }
});

// Get available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await drinkService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Get random drink
router.get('/random', async (req, res) => {
  try {
    const drink = await drinkService.getRandomDrink();
    if (!drink) {
      return res.status(404).json({ success: false, message: 'No drinks available' });
    }
    res.json({ success: true, data: drink });
  } catch (error) {
    console.error('Error fetching random drink:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch random drink' });
  }
});

// Get multiple random drinks
router.get('/random/:count', async (req, res) => {
  try {
    const count = parseInt(req.params.count) || 5;
    const drinks = await drinkService.getRandomDrinks(count);
    res.json({ success: true, data: drinks });
  } catch (error) {
    console.error('Error fetching random drinks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch random drinks' });
  }
});

// Search drinks
router.get('/search/:query', async (req, res) => {
  try {
    const drinks = await drinkService.searchDrinks(req.params.query);
    res.json({ success: true, data: drinks });
  } catch (error) {
    console.error('Error searching drinks:', error);
    res.status(500).json({ success: false, message: 'Failed to search drinks' });
  }
});

// Get drink by slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const drink = await drinkService.getDrinkBySlug(req.params.slug);
    
    if (!drink) {
      return res.status(404).json({ success: false, message: 'Drink not found' });
    }
    
    res.json({ success: true, data: drink });
  } catch (error) {
    console.error('Error fetching drink:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drink' });
  }
});

// Get drinks by category
router.get('/category/:category', async (req, res) => {
  try {
    const drinks = await drinkService.getDrinksByCategory(req.params.category);
    res.json({ success: true, data: drinks });
  } catch (error) {
    console.error('Error fetching drinks by category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drinks by category' });
  }
});

// Get random drinks from a specific category for case opening (default count)
router.get('/category/:category/random', async (req, res) => {
  try {
    const category = req.params.category;
    const count = 20; // Default count
    
    const categoryDrinks = await drinkService.getDrinksByCategory(category);
    
    if (categoryDrinks.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: `No drinks found for category: ${category}` 
      });
    }

    res.json({ success: true, data: categoryDrinks });
  } catch (error) {
    console.error('Error fetching random drinks by category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch random drinks by category' });
  }
});

export default router;
