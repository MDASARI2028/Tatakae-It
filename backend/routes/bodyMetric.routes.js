// backend/routes/bodyMetric.routes.js

const router = require('express').Router();
const BodyMetric = require('../models/bodyMetric.model');
const auth = require('../middleware/auth.middleware');

// @route   POST /api/metrics
// @desc    Log a new body metric entry
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { date, weight, height, bodyFatPercentage, waist, chest, hips } = req.body;

        // --- Validation ---
        if (!weight) {
            return res.status(400).json({ msg: 'Weight is a mandatory field.' });
        }

        const newMetric = new BodyMetric({
            user: req.user.id, // User ID from the auth token
            date,
            weight,
            height,
            bodyFatPercentage,
            waist,
            chest,
            hips
        });

        const savedMetric = await newMetric.save();
        res.status(201).json(savedMetric);

    } catch (err) {
        console.error("Body Metric Logging Error:", err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/metrics
// @desc    Get all body metric entries for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        // Find metrics for the logged-in user and sort by most recent date
        const metrics = await BodyMetric.find({ user: req.user.id }).sort({ date: -1 });
        res.json(metrics);
    } catch (err) {
        console.error("Fetch Body Metrics Error:", err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;