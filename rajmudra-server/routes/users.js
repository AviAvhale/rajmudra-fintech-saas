const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// ─── GET /api/users — List all users (superadmin only) ───────────────────────
router.get('/', requireRole('superadmin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -activeSessions -loginAttempts -lockUntil')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('Get users error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// ─── GET /api/users/me — Current user's own profile ──────────────────────────
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -activeSessions -loginAttempts -lockUntil');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
});

// ─── PATCH /api/users/me — Update own profile ────────────────────────────────
router.patch(
  '/me',
  [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('phone').optional().trim(),
    body('city').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const allowed = ['name', 'phone', 'city'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      const user = await User.findByIdAndUpdate(req.user._id, updates, {
        new: true,
        runValidators: true,
      }).select('-password -activeSessions -loginAttempts -lockUntil');

      res.json({ success: true, user });
    } catch (err) {
      console.error('Update own profile error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  }
);

// ─── GET /api/users/students — List students (admin/superadmin) ──────────────
router.get('/students', requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { search, limit = 50 } = req.query;
    const query = { role: 'user' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await User.find(query)
      .select('name email batch hasPaid avatar phone city createdAt')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.json({ success: true, students, total });
  } catch (err) {
    console.error('Get students error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
});

// ─── PATCH /api/users/:id — Update user role/plan (superadmin only) ──────────
router.patch(
  '/:id',
  requireRole('superadmin'),
  [
    body('role').optional().isIn(['superadmin', 'admin', 'user']),
    body('hasPaid').optional().isBoolean(),
    body('batch').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const allowed = ['role', 'hasPaid', 'batch', 'name', 'phone', 'city'];
      const updates = {};
      for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
      }

      const user = await User.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      }).select('-password -activeSessions -loginAttempts -lockUntil');

      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      res.json({ success: true, user });
    } catch (err) {
      console.error('Update user error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to update user.' });
    }
  }
);

// ─── DELETE /api/users/:id — Remove user (superadmin only) ───────────────────
router.delete('/:id', requireRole('superadmin'), async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('Delete user error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

module.exports = router;
