const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.middleware');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body; // Removed password2 as it's not in the model

        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists.' });
        }

        user = new User({ username, email, password });
        await user.save();
        res.status(201).json({ msg: 'Registration successful!' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   POST /api/users/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials.' });
        }

        const payload = { id: user.id, username: user.username };
        
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        // ✅ THE FIX: Send the token AND the full user object
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                nutritionGoals: user.nutritionGoals
            }
        });

    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// @route   GET /api/users/me
// @desc    Get current user's data
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   PUT /api/users/goals
// @desc    Update nutrition goals for the logged in user
// @access  Private
router.put('/goals', auth, async (req, res) => {
    try {
        const { calorieGoal, proteinGoal, carbGoal, fatGoal } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.nutritionGoals = { calorieGoal, proteinGoal, carbGoal, fatGoal };
        await user.save();
        res.json({ msg: 'Goals updated successfully', nutritionGoals: user.nutritionGoals });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});
// @route   PUT /api/users/reset-streak
// @desc    Resets the user's streak start date to today
// @access  Private
router.put('/reset-streak', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.streakStartDate = new Date(); // Set to today
        await user.save();
        
        // Return the updated user object to sync the frontend
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});
module.exports = router;