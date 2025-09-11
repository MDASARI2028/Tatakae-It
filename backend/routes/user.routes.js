// backend/routes/user.routes.js
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
        const { username, email, password, password2 } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ msg: 'Please enter all fields.' });
        }
        if (password !== password2) {
            return res.status(400).json({ msg: 'Passwords do not match.' });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists.' });
        }

        // Create new user (password will be hashed automatically by the model's pre-save hook)
        user = new User({ username, email, password });
        await user.save();

        res.status(201).json({ msg: 'Registration successful!' });

    } catch (err) {
        console.error("Registration Error:", err.message);
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

        // Create JWT payload consistent with the rest of the app
        const payload = { id: user.id, username: user.username };
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch (err) {
        console.error("Login Error:", err.message);
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
        console.error("Get User Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;