import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/users_model.mjs';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// POST /signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await User.create({ username, passwordHash, role: 'user' });

    return res.status(201).json({ id: user._id, username: user.username, role: user.role });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set token expiration based on remember me option
    const tokenExpiration = rememberMe ? '30d' : '7d';

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: tokenExpiration }
    );

    return res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;


// Authenticated profile route (example)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username role createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.status(200).json({ id: user._id, username: user.username, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin-only settings route (example)
router.get('/admin/settings', authMiddleware, adminMiddleware, (req, res) => {
  return res.status(200).json({ message: 'Admin settings accessible', at: new Date().toISOString() });
});


