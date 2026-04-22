const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const PlatformSettings = require('../models/PlatformSettings');
const Announcement = require('../models/Announcement');

// ─── GET settings ────────────────────────────────────────────────────────────
router.get('/', protect, requireRole('superadmin'), async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne({ key: 'main' });
    if (!settings) {
      settings = await PlatformSettings.create({ key: 'main' });
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── PUT save settings ───────────────────────────────────────────────────────
router.put('/', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const { platformName, supportEmail, batchSizeLimit, cashfreeEnv, cashfreeAppId, cashfreeSecret } = req.body;

    let settings = await PlatformSettings.findOne({ key: 'main' });
    if (!settings) settings = new PlatformSettings({ key: 'main' });

    if (platformName !== undefined) settings.platformName = platformName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (batchSizeLimit !== undefined) settings.batchSizeLimit = batchSizeLimit;
    if (cashfreeEnv !== undefined) settings.cashfreeEnv = cashfreeEnv;
    if (cashfreeAppId !== undefined) settings.cashfreeAppId = cashfreeAppId;
    if (cashfreeSecret !== undefined) settings.cashfreeSecret = cashfreeSecret;

    await settings.save();
    res.json({ success: true, settings, message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── POST send push notification (creates announcement) ─────────────────────
router.post('/push', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });

    // Create as a high-priority announcement (acts as push notification)
    const announcement = await Announcement.create({
      title: title.trim(),
      body: body || '',
      priority: 'high',
      postedBy: req.user._id,
    });

    res.json({ success: true, announcement, message: `Push notification "${title}" sent to all users` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
