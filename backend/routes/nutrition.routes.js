const router = require('express').Router();
const auth = require('../middleware/auth.middleware');
const Nutrition = require('../models/nutrition.model');
const mongoose = require('mongoose');
// @route   POST /api/nutrition
router.post('/', auth, async (req, res) => {
    try {
        // Your POST route logic from before was missing mealName
        const { date, mealType, mealName, items, notes } = req.body;
        if (!date || !mealType || !items) {
            return res.status(400).json({ msg: 'Please enter all required fields.' });
        }
        const newNutritionLog = new Nutrition({
            user: req.user.id,
            date,
            mealType,
            mealName,
            items,
            notes
        });
        const savedLog = await newNutritionLog.save();
        res.status(201).json(savedLog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/nutrition/date/:date
// ✅ THIS IS THE CORRECTED ROUTE
router.get('/date/:date', auth, async (req, res) => {
    try {
        const dateStr = req.params.date;
        const meals = await Nutrition.find({
            user: req.user.id,
            date: dateStr
        }).sort({ createdAt: 'asc' });
        res.json(meals);
    } catch (err) {
        console.error("FETCH MEALS ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// @route   DELETE /api/nutrition/:id
router.delete('/:id', auth, async (req, res) => {
    try {
        const log = await Nutrition.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ msg: 'Log not found.' });
        }
        if (log.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized.' });
        }
        await log.deleteOne();
        res.json({ msg: 'Log deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/nutrition/:id
router.put('/:id', auth, async (req, res) => {
    try {
        const log = await Nutrition.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ msg: 'Log not found.' });
        }
        if (log.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized.' });
        }
        const { mealName, mealType, items, notes } = req.body;
        log.mealName = mealName;
        log.mealType = mealType;
        log.items = items;
        log.notes = notes;
        const updatedLog = await log.save();
        res.json(updatedLog);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// @route   GET /api/nutrition/progress
// @desc    Get aggregated nutrition data for a user
// @access  Private
router.get('/progress', auth, async (req, res) => {
    try {
        const period = parseInt(req.query.period) || 30; // Default to 30 days
        
        // ✅ NEW LOGIC: Generate an array of date strings for the period
        const dateStrings = [];
        for (let i = 0; i < period; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dateStrings.push(d.toISOString().split('T')[0]);
        }

        const dailyData = await Nutrition.aggregate([
            // ✅ Stage 1: A more robust match stage
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    date: { $in: dateStrings } // Find all logs where the date is in our generated list
                }
            },
            // Stage 2: Deconstruct the items array
            { $unwind: "$items" },
            // Stage 3: Group by date and calculate totals
            {
                $group: {
                    _id: "$date",
                    totalCalories: { $sum: "$items.calories" },
                    totalProtein: { $sum: "$items.protein" },
                    totalCarbs: { $sum: "$items.carbohydrates" },
                    totalFat: { $sum: "$items.fat" },
                }
            },
            // Stage 4: Rename _id field to date
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalCalories: 1,
                    totalProtein: 1,
                    totalCarbs: 1,
                    totalFat: 1
                }
            },
            // Stage 5: Sort by date
            { $sort: { date: 1 } }
        ]);

        res.json(dailyData);

    } catch (err) {
        console.error("Progress Aggregation Error:", err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;