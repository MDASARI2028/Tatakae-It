const router = require('express').Router();
const axios = require('axios');
const auth = require('../middleware/auth.middleware');

const NUTRITIONIX_APP_ID = process.env.NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.NUTRITIONIX_API_KEY;

// @route   GET /api/food-search
// @desc    Search the Nutritionix food database using the Natural Language endpoint
// @access  Private
router.get('/', auth, async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ msg: 'Search query is required.' });
    }
    if (!NUTRITIONIX_APP_ID || !NUTRITIONIX_API_KEY) {
        console.error('Nutritionix API keys are not configured in .env file');
        return res.status(500).json({ msg: 'API key not configured on server.' });
    }

    const apiUrl = 'https://trackapi.nutritionix.com/v2/natural/nutrients';

    try {
        const response = await axios.post(apiUrl, {
            query: query,
        }, {
            headers: {
                'x-app-id': NUTRITIONIX_APP_ID,
                'x-app-key': NUTRITIONIX_API_KEY
            }
        });
        
        // Updated data formatting for the new response structure
        const formattedResults = response.data.foods.map(food => {
            return {
                foodId: food.tag_id, // Use tag_id as a unique key
                label: `${food.serving_qty} ${food.serving_unit} ${food.food_name}`,
                calories: food.nf_calories || 0,
                protein: food.nf_protein || 0,
                fat: food.nf_total_fat || 0,
                carbs: food.nf_total_carbohydrate || 0,
            };
        });
        
        res.json(formattedResults);

    } catch (error) {
        console.error('Nutritionix API Error:', error.response ? error.response.data : error.message);
        res.status(502).json({ msg: 'Food database service is unavailable.' });
    }
});

module.exports = router;