import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Rarity weights for random selection
const RARITY_WEIGHTS = {
  common: 50,
  uncommon: 30,
  rare: 15,
  legendary: 5
};

// Open a case - returns a random drink with animation data
router.post('/open', async (req, res) => {
  try {
    const { caseType = 'all' } = req.body;
    
    const drinksPath = path.join(__dirname, '..', 'data', 'drinks.json');
    const drinksData = await fs.readFile(drinksPath, 'utf8');
    let drinks = JSON.parse(drinksData);
    
    // Filter drinks by case type if specified
    if (caseType !== 'all') {
      drinks = drinks.filter(d => d.type === caseType);
    }
    
    // Select random drink based on rarity weights
    const selectedDrink = selectRandomDrink(drinks);
    
    // Create animation sequence (for the CS:GO-style roulette)
    const animationDrinks = generateAnimationSequence(drinks, selectedDrink);
    
    res.json({
      success: true,
      data: {
        winningDrink: selectedDrink,
        animationSequence: animationDrinks,
        winningPosition: Math.floor(animationDrinks.length * 0.7) // Position in the sequence where the winning drink appears
      }
    });
  } catch (error) {
    console.error('Error opening case:', error);
    res.status(500).json({ success: false, message: 'Failed to open case' });
  }
});

// Get available case types
router.get('/types', async (req, res) => {
  try {
    const drinksPath = path.join(__dirname, '..', 'data', 'drinks.json');
    const drinksData = await fs.readFile(drinksPath, 'utf8');
    const drinks = JSON.parse(drinksData);
    
    const types = [...new Set(drinks.map(d => d.type))];
    
    res.json({
      success: true,
      data: [
        { id: 'all', name: 'Mixed Case', description: 'Contains all types of drinks' },
        ...types.map(type => ({
          id: type,
          name: type.charAt(0).toUpperCase() + type.slice(1) + ' Case',
          description: `Contains only ${type}s`
        }))
      ]
    });
  } catch (error) {
    console.error('Error fetching case types:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch case types' });
  }
});

// Helper function to select random drink based on rarity
function selectRandomDrink(drinks) {
  const totalWeight = drinks.reduce((sum, drink) => {
    return sum + (RARITY_WEIGHTS[drink.rarity] || 10);
  }, 0);
  
  let random = Math.random() * totalWeight;
  
  for (const drink of drinks) {
    const weight = RARITY_WEIGHTS[drink.rarity] || 10;
    if (random <= weight) {
      return drink;
    }
    random -= weight;
  }
  
  // Fallback to first drink if something goes wrong
  return drinks[0];
}

// Helper function to generate animation sequence
function generateAnimationSequence(drinks, winningDrink) {
  const sequence = [];
  const sequenceLength = 20;
  
  // Fill most of the sequence with random drinks
  for (let i = 0; i < sequenceLength - 1; i++) {
    const randomDrink = drinks[Math.floor(Math.random() * drinks.length)];
    sequence.push(randomDrink);
  }
  
  // Insert the winning drink at the end (it will be positioned correctly by winningPosition)
  sequence.push(winningDrink);
  
  return sequence;
}

export default router;
