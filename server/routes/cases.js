import express from 'express';
import DrinkService from '../services/drinkService.js';

const router = express.Router();
const drinkService = new DrinkService();

// Open a case - returns a random drink with animation data
router.post('/open', async (req, res) => {
  try {
    const { caseType = 'random', winningPosition } = req.body;
    
    console.log(`🎲 Opening case of type: ${caseType}`);
    
    // Generate case opening data using the drink service
    const caseData = await drinkService.generateCaseOpening(caseType, winningPosition);
    
    // Ensure all drinks in the animation are from the same category
    console.log(`📊 Case opened with ${caseData.drinks.length} items from category: ${caseType}`);

    res.json({
      success: true,
      data: {
        winningDrink: caseData.winningDrink,
        animationItems: caseData.drinks,
        winningIndex: caseData.winningIndex,
        caseType: caseData.caseType,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error opening case:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to open case' });
  }
});

// Get available case types
router.get('/cases', async (req, res) => {
  try {
    const categories = await drinkService.getCategories();
    const stats = await drinkService.getStats();
    
    // Create case types based on available categories
    const caseTypes = [
      { 
        id: 'random', 
        name: 'Mixed Case', 
        description: 'Contains all types of drinks',
        drinkCount: stats.totalDrinks,
        rating: stats.avgRating || 3.0
      }
    ];

    // Add category-based cases
    for (const category of categories) {
      const categoryDrinks = await drinkService.getDrinksByCategory(category);
      
      if (categoryDrinks.length >= 3) { // Only add categories with enough drinks
        let description = `Contains only ${category.toLowerCase()}`;
        
        // Calculate average rating for this category
        const ratingsExist = categoryDrinks.filter(d => d.rating !== null && d.rating !== undefined);
        let avgRating = 3.0; // Default rating
        if (ratingsExist.length > 0) {
          avgRating = ratingsExist.reduce((sum, d) => sum + d.rating, 0) / ratingsExist.length;
          avgRating = Math.round(avgRating * 10) / 10;
        }
        
        // Special descriptions for certain categories
        if (category.toLowerCase().includes('shot') || category.toLowerCase().includes('cocktail')) {
          description = `Premium ${category.toLowerCase()} selection`;
        }
        
        caseTypes.push({
          id: category, // Use original category name as ID
          name: `${category} Case`,
          description,
          drinkCount: categoryDrinks.length,
          rating: avgRating,
          category
        });
      }
    }
    
    res.json({
      success: true,
      data: caseTypes
    });
  } catch (error) {
    console.error('Error fetching case types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch case types' });
  }
});

export default router;
