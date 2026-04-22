const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const LiveSession = require('../models/LiveSession');

// ─── GET all sessions (live + upcoming for users, all for admin) ────────────
router.get('/', protect, async (req, res) => {
  try {
    const live = await LiveSession.find({ status: 'live' }).sort('-createdAt');
    const upcoming = await LiveSession.find({ status: 'upcoming' }).sort('scheduledAt');
    const ended = await LiveSession.find({ status: 'ended' }).sort('-updatedAt').limit(10);
    res.json({ success: true, live, upcoming, ended });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST create session (admin only) ────────────────────────────────────────
router.post('/', protect, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { topic, phase, batch, scheduledAt } = req.body;
    if (!topic?.trim()) return res.status(400).json({ success: false, message: 'Topic required' });

    const session = await LiveSession.create({
      topic: topic.trim(),
      instructor: req.user.name,
      instructorAvatar: req.user.avatar || '',
      phase: phase || '',
      batch: batch || '',
      roomCode: `RM-${Math.floor(1000 + Math.random() * 9000)}`,
      status: scheduledAt ? 'upcoming' : 'live',
      scheduledAt: scheduledAt || new Date(),
      createdBy: req.user._id,
    });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH start session (set to live) ───────────────────────────────────────
router.patch('/:id/start', protect, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndUpdate(req.params.id, { status: 'live' }, { new: true });
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH end session ───────────────────────────────────────────────────────
router.patch('/:id/end', protect, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndUpdate(
      req.params.id,
      { status: 'ended', duration: req.body.duration || '' },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH update viewers ────────────────────────────────────────────────────
router.patch('/:id/viewers', protect, async (req, res) => {
  try {
    const session = await LiveSession.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewers: 1 } },
      { new: true }
    );
    res.json({ success: true, viewers: session?.viewers || 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
