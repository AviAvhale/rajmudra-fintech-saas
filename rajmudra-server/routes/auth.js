const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const { protect } = require('../middleware/auth');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ─── Helper: Send JWT as HTTP-only cookie ─────────────────────────────────────
const sendTokenCookie = (res, token) => {
  res.cookie('rm_token', token, {
    httpOnly: true,       // JS cannot read this cookie — XSS protection
    secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
    sameSite: 'lax',      // Works for same-site; Bearer header handles LAN/cross-port
    maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
  });
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post(
  '/register',
  registerLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').optional().trim(),
    body('city').optional().trim(),
    body('batch').optional().trim(),
  ],
  async (req, res) => {
    // Validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, phone, city, batch } = req.body;

      // Check duplicate email
      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }

      // Create user (password hashed by pre-save hook)
      // For demo purposes, auto-approve "Demo - Free Plan" users
      const hasPaid = batch === 'Demo - Free Plan' ? true : false;
      const user = await User.create({ name, email, password, phone, city, batch, hasPaid });

      // Generate JWT
      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      sendTokenCookie(res, token);

      // Never send password in response
      const safeUser = { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, hasPaid: user.hasPaid };

      res.status(201).json({ success: true, message: 'Account created successfully.', user: safeUser, token });
    } catch (err) {
      console.error('Register error:', err.message);
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post(
  '/login',
  loginLimiter,
  [
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Check if account is locked
      if (user.isLocked()) {
        const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
        return res.status(423).json({
          success: false,
          message: `Account locked. Try again in ${minutesLeft} minute(s).`,
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        // Increment failed attempts
        user.loginAttempts += 1;
        if (user.loginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // lock 15 min
          user.loginAttempts = 0;
        }
        await user.save({ validateBeforeSave: false });
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      // Reset failed attempts on success
      user.loginAttempts = 0;
      user.lockUntil = null;

      // Session limit: max 3 concurrent sessions
      const MAX_SESSIONS = 3;
      if (user.activeSessions.length >= MAX_SESSIONS) {
        // Remove oldest session
        user.activeSessions.sort((a, b) => a.createdAt - b.createdAt);
        user.activeSessions.shift();
      }

      // Add new session
      const sessionId = crypto.randomUUID();
      user.activeSessions.push({
        sessionId,
        userAgent: req.headers['user-agent'] || 'Unknown',
        createdAt: new Date(),
      });

      await user.save({ validateBeforeSave: false });

      // Generate JWT
      const token = jwt.sign(
        { id: user._id, role: user.role, sessionId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      sendTokenCookie(res, token);

      const safeUser = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        hasPaid: user.hasPaid,
        batch: user.batch,
      };

      res.json({ success: true, message: 'Login successful.', user: safeUser, token });
    } catch (err) {
      console.error('Login error:', err.message);
      res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
  }
);

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
router.post('/logout', protect, async (req, res) => {
  try {
    const token = req.token;

    // Decode to get expiry for TTL
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    // Blacklist the token
    await BlacklistedToken.create({ token, expiresAt });

    // Remove session from user record
    if (decoded.sessionId) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { activeSessions: { sessionId: decoded.sessionId } },
      });
    }

    // Clear cookie
    res.clearCookie('rm_token', { httpOnly: true, sameSite: 'lax' });
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during logout.' });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  const u = req.user;
  res.json({
    success: true,
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      hasPaid: u.hasPaid,
      batch: u.batch,
      phone: u.phone,
      city: u.city,
      createdAt: u.createdAt,
    },
  });
});

module.exports = router;
