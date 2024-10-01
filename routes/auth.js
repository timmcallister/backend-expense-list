const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const {username, password } = req.body;
        const user = new User({ username, password});
        await user.save();
        res.json({success: true, message: 'Registration successful'});
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: 'Registration failed'});
    }
});

router.post('/login', async (req, res) => {
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if (!user) return res.status(400).json({success: false, message: 'Invalid credentials'});

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({success: false, message: 'Invalid credentials'});

        const token = jwt.sign({userId: user._id}, 'HMACSECRETKEY', { expiresIn: '1h'});
        res.json({success: true, token});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Login failed'});
    }
});

module.exports = router;