const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { hashEmail } = require('../utils/emailHash');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this';

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many attempts, please try again later'
});

// register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });

    const emailHash = hashEmail(email);
    const existing = await User.findOne({ emailHash });
    if (existing) return res.status(400).json({ msg: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const name = displayName || `Anon${Math.floor(1000 + Math.random()*9000)}`;

    const user = await User.create({ emailHash, password: hashed, displayName: name });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, displayName: user.displayName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: 'Email and password required' });

    const emailHash = hashEmail(email);
    const user = await User.findOne({ emailHash });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, displayName: user.displayName } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user profile
router.get('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -emailHash');
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update user profile
router.put('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { displayName, bio } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (displayName) user.displayName = displayName;
    if (bio !== undefined) user.bio = bio;

    await user.save();
    res.json({ msg: 'Profile updated', user: { displayName: user.displayName, bio: user.bio } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
