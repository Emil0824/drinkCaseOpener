import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Get all drinks
router.get('/', async (req, res) => {
  try {
    const drinksPath = path.join(__dirname, '..', 'data', 'drinks.json');
    const drinksData = await fs.readFile(drinksPath, 'utf8');
    const drinks = JSON.parse(drinksData);
    
    res.json({ success: true, data: drinks });
  } catch (error) {
    console.error('Error fetching drinks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drinks' });
  }
});

// Get drink by ID
router.get('/:id', async (req, res) => {
  try {
    const drinksPath = path.join(__dirname, '..', 'data', 'drinks.json');
    const drinksData = await fs.readFile(drinksPath, 'utf8');
    const drinks = JSON.parse(drinksData);
    
    const drink = drinks.find(d => d.id === parseInt(req.params.id));
    
    if (!drink) {
      return res.status(404).json({ success: false, message: 'Drink not found' });
    }
    
    res.json({ success: true, data: drink });
  } catch (error) {
    console.error('Error fetching drink:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drink' });
  }
});

// Get drinks by type
router.get('/type/:type', async (req, res) => {
  try {
    const drinksPath = path.join(__dirname, '..', 'data', 'drinks.json');
    const drinksData = await fs.readFile(drinksPath, 'utf8');
    const drinks = JSON.parse(drinksData);
    
    const filteredDrinks = drinks.filter(d => d.type === req.params.type);
    
    res.json({ success: true, data: filteredDrinks });
  } catch (error) {
    console.error('Error fetching drinks by type:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch drinks by type' });
  }
});

export default router;
