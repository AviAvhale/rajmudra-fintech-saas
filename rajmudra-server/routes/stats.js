const express = require('express');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// ─── GET /api/stats/superadmin ────────────────────────────────────────────────
router.get('/superadmin', requireRole('superadmin'), async (req, res) => {
  try {
    const [totalUsers, totalAdmins, paidUsers, recentUsers] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ role: 'user', hasPaid: true }),
      User.find({ role: 'user' })
        .select('name email batch hasPaid createdAt avatar')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const revenue = paidUsers * 4999; // ₹4,999 per paid plan

    // Users registered per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = await User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        paidUsers,
        revenue,
        conversionRate: totalUsers > 0 ? ((paidUsers / totalUsers) * 100).toFixed(1) : '0',
        recentUsers,
        monthlyData,
      },
    });
  } catch (err) {
    console.error('Superadmin stats error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

// ─── GET /api/stats/admin ─────────────────────────────────────────────────────
router.get('/admin', requireRole('admin', 'superadmin'), async (req, res) => {
  try {
    const [totalUsers, paidUsers, batchBreakdown] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', hasPaid: true }),
      User.aggregate([
        { $match: { role: 'user' } },
        { $group: { _id: '$batch', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      success: true,
      stats: { totalUsers, paidUsers, batchBreakdown },
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

// ─── GET /api/stats/user ──────────────────────────────────────────────────────
router.get('/user', async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('-password -activeSessions -loginAttempts -lockUntil');

    // Get announcements visible to this user
    const announcements = await Announcement.find({
      visibleTo: { $in: [req.user.role, 'all'] },
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('postedBy', 'name avatar role');

    // Total users in same batch
    const batchmates = user.batch
      ? await User.countDocuments({ role: 'user', batch: user.batch })
      : 0;

    res.json({
      success: true,
      stats: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          city: user.city,
          batch: user.batch,
          role: user.role,
          hasPaid: user.hasPaid,
          avatar: user.avatar,
          createdAt: user.createdAt,
        },
        announcements,
        batchmates,
      },
    });
  } catch (err) {
    console.error('User stats error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch user stats.' });
  }
});

module.exports = router;
