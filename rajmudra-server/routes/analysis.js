const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const DailyAnalysis = require('../models/DailyAnalysis');

// ─── GET all analyses ────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const analyses = await DailyAnalysis.find().sort('-createdAt').limit(20);
    res.json({ success: true, analyses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST create analysis (admin only) ───────────────────────────────────────
router.post('/', protect, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { pair, title, body, images } = req.body;
    if (!pair?.trim() || !title?.trim() || !body?.trim())
      return res.status(400).json({ success: false, message: 'Pair, title, and body required' });

    const analysis = await DailyAnalysis.create({
      pair: pair.trim(),
      title: title.trim(),
      body: body.trim(),
      author: req.user.name,
      authorId: req.user._id,
      images: images || [],
    });
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH like/unlike ───────────────────────────────────────────────────────
router.patch('/:id/like', protect, async (req, res) => {
  try {
    const analysis = await DailyAnalysis.findById(req.params.id);
    if (!analysis) return res.status(404).json({ success: false, message: 'Not found' });

    const idx = analysis.likedBy.indexOf(req.user._id);
    if (idx > -1) {
      analysis.likedBy.splice(idx, 1);
      analysis.likes = Math.max(0, analysis.likes - 1);
    } else {
      analysis.likedBy.push(req.user._id);
      analysis.likes += 1;
    }
    await analysis.save();
    res.json({ success: true, liked: idx === -1, likes: analysis.likes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
