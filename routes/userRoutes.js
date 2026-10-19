const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// for the user to sign up on the page
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const user = new User({ username, email, password });
        await user.save();

        res.status(201).json({
            message: 'User created successfully',
            user_id: user._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// the login using username and password
router.post('/login', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const identifier = username || email;
        const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
        
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            jwt_token: token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;