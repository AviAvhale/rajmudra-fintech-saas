const express = require('express');
const { body, validationResult } = require('express-validator');
const SupportTicket = require('../models/SupportTicket');
const { protect, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/tickets — List tickets (users see own, admins see all) ─────────
router.get('/', async (req, res) => {
  try {
    const query = {};
    // Regular users only see their own tickets
    if (req.user.role === 'user') {
      query.user = req.user._id;
    }
    // Optional status filter
    if (req.query.status) {
      query.status = req.query.status;
    }

    const tickets = await SupportTicket.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(req.query.limit) || 50)
      .populate('user', 'name email avatar')
      .populate('resolvedBy', 'name avatar');

    const total = await SupportTicket.countDocuments(query);

    // Count by status for admin stats
    let statusCounts = {};
    if (req.user.role !== 'user') {
      const [open, inProgress, resolved] = await Promise.all([
        SupportTicket.countDocuments({ status: 'Open' }),
        SupportTicket.countDocuments({ status: 'In Progress' }),
        SupportTicket.countDocuments({ status: { $in: ['Resolved', 'Closed'] } }),
      ]);
      statusCounts = { open, inProgress, resolved };
    }

    res.json({ success: true, tickets, total, statusCounts });
  } catch (err) {
    console.error('Get tickets error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
  }
});

// ─── POST /api/tickets — Create ticket (any authenticated user) ─────────────
router.post(
  '/',
  [
    body('category').trim().isIn(['Technical', 'Software', 'Payment', 'Content', 'Other']),
    body('subject').trim().notEmpty().isLength({ max: 200 }),
    body('description').trim().notEmpty().isLength({ max: 5000 }),
    body('priority').optional().isIn(['Low', 'Medium', 'High']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const ticket = await SupportTicket.create({
        user: req.user._id,
        category: req.body.category,
        subject: req.body.subject,
        description: req.body.description,
        priority: req.body.priority || 'Medium',
      });

      const populated = await ticket.populate('user', 'name email avatar');
      res.status(201).json({ success: true, ticket: populated });
    } catch (err) {
      console.error('Create ticket error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to create ticket.' });
    }
  }
);

// ─── PATCH /api/tickets/:id — Update ticket status (admin/superadmin) ────────
router.patch(
  '/:id',
  requireRole('admin', 'superadmin'),
  [
    body('status').optional().isIn(['Open', 'In Progress', 'Resolved', 'Closed']),
    body('resolution').optional().trim().isLength({ max: 5000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const updates = {};
      if (req.body.status) updates.status = req.body.status;
      if (req.body.resolution) updates.resolution = req.body.resolution;
      if (req.body.status === 'Resolved' || req.body.status === 'Closed') {
        updates.resolvedBy = req.user._id;
      }

      const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, updates, {
        new: true,
        runValidators: true,
      })
        .populate('user', 'name email avatar')
        .populate('resolvedBy', 'name avatar');

      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found.' });
      }

      res.json({ success: true, ticket });
    } catch (err) {
      console.error('Update ticket error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to update ticket.' });
    }
  }
);

module.exports = router;
