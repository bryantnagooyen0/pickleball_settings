import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/users_model.mjs';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const router = express.Router();

// POST /signup
router.post('/signup', authLimiter, async (req, res) => {
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
router.post('/login', authLimiter, async (req, res) => {
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

// POST /google — Google OAuth sign-in / sign-up
router.post('/google', authLimiter, async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Google credential is required' });
    }

    // Verify the ID token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Try to find an existing user by googleId first, then by email
    let user = await User.findOne({ googleId });
    if (!user && email) {
      user = await User.findOne({ email });
      if (user) {
        // Link the Google account to the existing email-matched user
        user.googleId = googleId;
        await user.save();
      }
    }

    // Create a new user if none found
    if (!user) {
      // Derive a username from the Google display name or email prefix
      const baseUsername = (name || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_')
        .slice(0, 20);

      let username = baseUsername;
      let suffix = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${suffix}`;
        suffix++;
      }

      user = await User.create({ username, email, googleId, role: 'user' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({ token, username: user.username });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(401).json({ message: 'Google authentication failed' });
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


