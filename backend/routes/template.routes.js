// backend/routes/template.routes.js

const router = require('express').Router();
const Template = require('../models/template.model');
const auth = require('../middleware/auth.middleware');

router.post('/', auth, async (req, res) => {
    try {
        const { templateName, workoutType, notes, exercises } = req.body;

        const existingTemplate = await Template.findOne({ user: req.user.id, templateName });
        if (existingTemplate) {
            return res.status(400).json({ msg: 'A template with this name already exists.' });
        }

        // --- CORRECTED CONSTRUCTOR ---
        // This now includes all the data from the request body.
        const newTemplate = new Template({
            user: req.user.id,
            templateName,
            workoutType,
            notes,
            exercises
        });

        const savedTemplate = await newTemplate.save();
        res.status(201).json(savedTemplate);

    } catch (err) {
        console.error("Template Creation Error:", err.message);
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'A template with this name already exists.' });
        }
        res.status(500).json({ msg: 'Server Error' }); 
    }
});

// @route   GET /api/templates
// @desc    Get all templates for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const templates = await Template.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;