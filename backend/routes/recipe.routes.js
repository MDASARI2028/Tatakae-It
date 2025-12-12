// backend/routes/recipe.routes.js

const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const Recipe = require('../models/recipe.model');

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { name, items } = req.body;
        if (!name || !items || items.length === 0) {
            return res.status(400).json({ msg: 'Name and at least one item are required.' });
        }
        const newRecipe = new Recipe({
            user: req.user.id,
            name,
            items
        });
        const savedRecipe = await newRecipe.save();
        res.status(201).json(savedRecipe);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/recipes
// @desc    Get all recipes for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const recipes = await Recipe.find({ user: req.user.id }).sort({ name: 'asc' });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ msg: 'Recipe not found.' });
        if (recipe.user.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized.' });
        
        await recipe.deleteOne();
        res.json({ msg: 'Recipe deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Note: A PUT route for editing recipes could be added here later if needed.

module.exports = router;