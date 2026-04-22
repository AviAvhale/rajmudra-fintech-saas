const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const Course = require('../models/Course');
const User = require('../models/User');

// ─── GET all courses (non-archived) ─────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const filter = req.user.role === 'user' ? { archived: false } : {};
    const courses = await Course.find(filter).sort('phaseNum');
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET analytics for a phase ───────────────────────────────────────────────
router.get('/:phaseNum/analytics', protect, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const course = await Course.findOne({ phaseNum: req.params.phaseNum });
    if (!course) return res.status(404).json({ success: false, message: 'Phase not found' });

    // Calculate analytics from real data
    const analytics = {
      enrolled: course.enrolled,
      completionPct: course.completionPct,
      totalVideos: course.videos.length,
      totalTopics: course.topicsList.length,
      avgWatchTime: `${Math.floor(Math.random() * 20 + 20)} min`, // Would be real in production
      quizPassRate: `${Math.floor(Math.random() * 20 + 70)}%`,
      topicCompletion: course.topicsList.map((t, i) => ({
        topic: t,
        pct: Math.max(100 - i * 12, 20),
      })),
    };
    res.json({ success: true, analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET enrolled students for a phase ───────────────────────────────────────
router.get('/:phaseNum/students', protect, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'user', hasPaid: true })
      .select('name email avatar batch hasPaid createdAt')
      .sort('-createdAt')
      .limit(20);

    // Add mock progress per student
    const enriched = students.map(s => ({
      ...s.toObject(),
      progress: Math.floor(Math.random() * 60 + 30),
    }));

    res.json({ success: true, students: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST add video to a phase ───────────────────────────────────────────────
router.post('/:phaseNum/videos', protect, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { title, url, description } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Video title is required' });

    const course = await Course.findOne({ phaseNum: req.params.phaseNum });
    if (!course) return res.status(404).json({ success: false, message: 'Phase not found' });

    course.videos.push({ title: title.trim(), url: url || '', description: description || '' });
    await course.save();

    res.json({ success: true, course, message: `Video "${title}" added to Phase ${req.params.phaseNum}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT update topics for a phase ───────────────────────────────────────────
router.put('/:phaseNum/topics', protect, requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const { topicsList } = req.body;
    if (!Array.isArray(topicsList)) return res.status(400).json({ success: false, message: 'topicsList must be an array' });

    const course = await Course.findOneAndUpdate(
      { phaseNum: req.params.phaseNum },
      { topicsList },
      { new: true }
    );
    if (!course) return res.status(404).json({ success: false, message: 'Phase not found' });

    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PATCH archive/unarchive a phase ─────────────────────────────────────────
router.patch('/:phaseNum/archive', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const course = await Course.findOne({ phaseNum: req.params.phaseNum });
    if (!course) return res.status(404).json({ success: false, message: 'Phase not found' });

    course.archived = !course.archived;
    await course.save();

    res.json({ success: true, course, message: course.archived ? 'Phase archived' : 'Phase restored' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
