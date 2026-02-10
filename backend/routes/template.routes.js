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
        const templates = await Template.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .lean();
        res.json(templates);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});


// @route   DELETE /api/templates/:id
// @desc    Delete a template
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);
        if (!template) return res.status(404).json({ msg: 'Template not found' });

        // Ensure user owns template
        if (template.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        await template.deleteOne();
        res.json({ msg: 'Template removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Template not found' });
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/templates/:id
// @desc    Update a template
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { templateName, workoutType, notes, exercises } = req.body;

        let template = await Template.findById(req.params.id);
        if (!template) return res.status(404).json({ msg: 'Template not found' });

        // Ensure user owns template
        if (template.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        template.templateName = templateName || template.templateName;
        template.workoutType = workoutType || template.workoutType;
        template.notes = notes !== undefined ? notes : template.notes;
        template.exercises = exercises || template.exercises;

        await template.save();
        res.json(template);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;