const express = require('express');
const router = express.Router();
const User = require('../models/user.model'); // Import the User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth.middleware');

// --- REGISTRATION ROUTE ---
// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Check for missing fields
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 3. Create a new user instance
    const newUser = new User({
      username,
      email,
      password,
    });

    // 4. Save the new user (password will be hashed by the pre-save hook)
    const savedUser = await newUser.save();

    // 5. Respond with success message and user data (excluding password)
    res.status(201).json({
      message: 'Hunter registered successfully!',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
});

// --- LOGIN ROUTE ---
// @route   POST /api/users/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check for missing fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter all fields' });
    }

    // 2. Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 3. Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 4. If credentials are correct, create the JWT payload
    const payload = {
      user: {
        id: user.id,
      },
    };

    // 5. Sign the token with your secret key
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // 6. Send the token back to the user
        res.json({
          message: 'Login successful!',
          token,
          user: {
            id: user.id,
            username: user.username,
          },
        });
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});
// --- GET LOGGED-IN USER'S PROFILE ---
// @route   GET /api/users/me
// @desc    Get current user's data (protected)
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // The user's ID is attached to the request object by the auth middleware
    // We find the user but exclude the password field from the response
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});
module.exports = router;