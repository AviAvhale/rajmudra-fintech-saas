const express = require('express');
const { body, validationResult } = require('express-validator');
const TradeEntry = require('../models/TradeEntry');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/journal — List user's own trade entries ────────────────────────
router.get('/', async (req, res) => {
  try {
    const entries = await TradeEntry.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 50);

    const total = await TradeEntry.countDocuments({ user: req.user._id });

    res.json({ success: true, entries, total });
  } catch (err) {
    console.error('Get journal error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch trade journal.' });
  }
});

// ─── POST /api/journal — Create a trade entry ───────────────────────────────
router.post(
  '/',
  [
    body('pair').trim().notEmpty().isLength({ max: 20 }),
    body('direction').isIn(['Buy', 'Sell']),
    body('entryPrice').trim().notEmpty(),
    body('stopLoss').optional().trim(),
    body('takeProfit').optional().trim(),
    body('lotSize').optional().trim(),
    body('result').optional().trim(),
    body('pnl').optional().trim(),
    body('note').optional().trim().isLength({ max: 2000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const entry = await TradeEntry.create({
        user: req.user._id,
        pair: req.body.pair,
        direction: req.body.direction,
        entryPrice: req.body.entryPrice,
        stopLoss: req.body.stopLoss || '',
        takeProfit: req.body.takeProfit || '',
        lotSize: req.body.lotSize || '',
        result: req.body.result || '',
        pnl: req.body.pnl || '',
        note: req.body.note || '',
      });

      res.status(201).json({ success: true, entry });
    } catch (err) {
      console.error('Create journal entry error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to create trade entry.' });
    }
  }
);

// ─── DELETE /api/journal/:id — Delete a trade entry ─────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const entry = await TradeEntry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id, // Only allow deleting own entries
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Trade entry not found.' });
    }

    res.json({ success: true, message: 'Trade entry deleted.' });
  } catch (err) {
    console.error('Delete journal entry error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete trade entry.' });
  }
});

module.exports = router;
