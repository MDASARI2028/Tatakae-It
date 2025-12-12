const router = require('express').Router();
const axios = require('axios');
const auth = require('../middleware/auth.middleware');

// @route   GET /api/food-search
// @desc    Search for foods - using mock data for now
// @access  Private

// Mock food database
const foodDatabase = [
    { id: 1, name: 'Apple', calories: 95, protein: 0.5, fat: 0.3, carbs: 25 },
    { id: 2, name: 'Banana', calories: 105, protein: 1.3, fat: 0.3, carbs: 27 },
    { id: 3, name: 'Orange', calories: 62, protein: 1.2, fat: 0.3, carbs: 15 },
    { id: 4, name: 'Chicken Breast', calories: 165, protein: 31, fat: 3.6, carbs: 0 },
    { id: 5, name: 'Rice (cooked)', calories: 206, protein: 4.3, fat: 0.3, carbs: 45 },
    { id: 6, name: 'Broccoli', calories: 55, protein: 3.7, fat: 0.6, carbs: 11 },
    { id: 7, name: 'Salmon', calories: 280, protein: 25, fat: 20, carbs: 0 },
    { id: 8, name: 'Eggs', calories: 155, protein: 13, fat: 11, carbs: 1.1 },
    { id: 9, name: 'Milk', calories: 61, protein: 3.2, fat: 3.3, carbs: 4.8 },
    { id: 10, name: 'Bread', calories: 265, protein: 9, fat: 3.3, carbs: 49 },
    { id: 11, name: 'Olive Oil', calories: 884, protein: 0, fat: 100, carbs: 0 },
    { id: 12, name: 'Almonds', calories: 579, protein: 21, fat: 50, carbs: 22 },
    { id: 13, name: 'Yogurt', calories: 59, protein: 10, fat: 0.4, carbs: 3.6 },
    { id: 14, name: 'Sweet Potato', calories: 86, protein: 1.6, fat: 0.1, carbs: 20 },
    { id: 15, name: 'Beef', calories: 250, protein: 26, fat: 17, carbs: 0 },
];

router.get('/', auth, async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ msg: 'Search query is required.' });
    }

    try {
        console.log(`[FOOD SEARCH] Searching for: "${query}"`);
        
        // Search the mock database
        const results = foodDatabase.filter(food =>
            food.name.toLowerCase().includes(query.toLowerCase())
        );
        
        console.log(`[FOOD SEARCH] Found ${results.length} results`);
        
        // Format results
        const formattedResults = results.map(food => ({
            foodId: food.id,
            label: food.name,
            calories: food.calories,
            protein: food.protein,
            fat: food.fat,
            carbs: food.carbs,
        }));
        
        res.json(formattedResults);

    } catch (error) {
        console.error('[FOOD SEARCH ERROR]', error.message);
        res.status(500).json({ 
            msg: 'Error searching foods.',
            error: error.message
        });
    }
});

module.exports = router;