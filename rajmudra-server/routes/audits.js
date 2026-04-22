const express = require('express');
const { body, validationResult } = require('express-validator');
const TradeAudit = require('../models/TradeAudit');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/audits — List audits (users see own, admins see all) ───────────
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.user.role === 'user') {
      query.user = req.user._id;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const audits = await TradeAudit.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 50)
      .populate('user', 'name email avatar')
      .populate('reviewer', 'name avatar');

    const total = await TradeAudit.countDocuments(query);

    // Status counts for admin views
    let statusCounts = {};
    if (req.user.role !== 'user') {
      const [pending, inReview, approved, needsWork] = await Promise.all([
        TradeAudit.countDocuments({ status: 'Pending' }),
        TradeAudit.countDocuments({ status: 'In Review' }),
        TradeAudit.countDocuments({ status: 'Approved' }),
        TradeAudit.countDocuments({ status: 'Needs Improvement' }),
      ]);
      statusCounts = { pending, inReview, approved, needsWork };
    }

    res.json({ success: true, audits, total, statusCounts });
  } catch (err) {
    console.error('Get audits error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch audits.' });
  }
});

// ─── POST /api/audits — Submit trade for audit (users) ──────────────────────
router.post(
  '/',
  [
    body('pair').trim().notEmpty().isLength({ max: 20 }),
    body('direction').isIn(['Buy', 'Sell']),
    body('entryPrice').trim().notEmpty(),
    body('stopLoss').optional().trim(),
    body('takeProfit').optional().trim(),
    body('result').optional().trim(),
    body('analysis').optional().trim().isLength({ max: 5000 }),
    body('screenshot').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const audit = await TradeAudit.create({
        user: req.user._id,
        pair: req.body.pair,
        direction: req.body.direction,
        entryPrice: req.body.entryPrice,
        stopLoss: req.body.stopLoss || '',
        takeProfit: req.body.takeProfit || '',
        result: req.body.result || '',
        analysis: req.body.analysis || '',
        screenshot: req.body.screenshot || '',
      });

      const populated = await audit.populate('user', 'name email avatar');
      res.status(201).json({ success: true, audit: populated });
    } catch (err) {
      console.error('Submit audit error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to submit audit.' });
    }
  }
);

// ─── PATCH /api/audits/:id — Review audit (admin/superadmin) ────────────────
router.patch(
  '/:id',
  requireRole('admin', 'superadmin'),
  [
    body('status').isIn(['In Review', 'Approved', 'Needs Improvement']),
    body('feedback').optional().trim().isLength({ max: 5000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const updates = {
        status: req.body.status,
        reviewer: req.user._id,
        reviewedAt: new Date(),
      };
      if (req.body.feedback) updates.feedback = req.body.feedback;

      const audit = await TradeAudit.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      })
        .populate('user', 'name email avatar')
        .populate('reviewer', 'name avatar');

      if (!audit) {
        return res.status(404).json({ success: false, message: 'Audit not found.' });
      }

      res.json({ success: true, audit });
    } catch (err) {
      console.error('Review audit error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to update audit.' });
    }
  }
);

module.exports = router;
