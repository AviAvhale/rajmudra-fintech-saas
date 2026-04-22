const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/announcements ───────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const userRole = req.user.role;
    // Show announcements visible to user's role or 'all'
    const announcements = await Announcement.find({
      visibleTo: { $in: [userRole, 'all'] },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('postedBy', 'name avatar role');

    res.json({ success: true, announcements });
  } catch (err) {
    console.error('Get announcements error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch announcements.' });
  }
});

// ─── POST /api/announcements — Create (admin/superadmin) ─────────────────────
router.post(
  '/',
  requireRole('admin', 'superadmin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
    body('body').trim().notEmpty().withMessage('Body is required').isLength({ max: 2000 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('visibleTo').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const announcement = await Announcement.create({
        title: req.body.title,
        body: req.body.body,
        priority: req.body.priority || 'medium',
        visibleTo: req.body.visibleTo || ['all'],
        postedBy: req.user._id,
      });

      const populated = await announcement.populate('postedBy', 'name avatar role');
      res.status(201).json({ success: true, announcement: populated });
    } catch (err) {
      console.error('Create announcement error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to create announcement.' });
    }
  }
);

// ─── DELETE /api/announcements/:id ───────────────────────────────────────────
router.delete('/:id', requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    res.json({ success: true, message: 'Announcement deleted.' });
  } catch (err) {
    console.error('Delete announcement error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete announcement.' });
  }
});

module.exports = router;
