const express = require('express');
const { body, validationResult } = require('express-validator');
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// ─── GET /api/messages/conversations — List all conversation partners ────────
router.get('/conversations', async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all unique users this person has exchanged messages with
    const sent = await Message.distinct('receiver', { sender: userId });
    const received = await Message.distinct('sender', { receiver: userId });

    // Merge unique partner IDs
    const partnerSet = new Set([
      ...sent.map(id => id.toString()),
      ...received.map(id => id.toString()),
    ]);

    // If user role is 'user' and has no conversations yet, show all admins
    if (partnerSet.size === 0 && req.user.role === 'user') {
      const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } })
        .select('name email avatar role')
        .limit(10);
      return res.json({
        success: true,
        conversations: admins.map(a => ({
          partner: a,
          lastMessage: null,
          unread: 0,
        })),
      });
    }

    // For admins with no conversations, show all students
    if (partnerSet.size === 0 && (req.user.role === 'admin' || req.user.role === 'superadmin')) {
      const students = await User.find({ role: 'user' })
        .select('name email avatar role')
        .sort({ createdAt: -1 })
        .limit(20);
      return res.json({
        success: true,
        conversations: students.map(s => ({
          partner: s,
          lastMessage: null,
          unread: 0,
        })),
      });
    }

    const partnerIds = [...partnerSet];

    // Get partner user info
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select('name email avatar role');

    // Build conversation list with last message + unread count
    const conversations = await Promise.all(
      partners.map(async (partner) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: partner._id },
            { sender: partner._id, receiver: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .select('text sender createdAt');

        const unread = await Message.countDocuments({
          sender: partner._id,
          receiver: userId,
          read: false,
        });

        return { partner, lastMessage, unread };
      })
    );

    // Sort by most recent message
    conversations.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || 0;
      const bTime = b.lastMessage?.createdAt || 0;
      return new Date(bTime) - new Date(aTime);
    });

    res.json({ success: true, conversations });
  } catch (err) {
    console.error('Get conversations error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations.' });
  }
});

// ─── GET /api/messages/:userId — Get message thread with a user ──────────────
router.get('/:userId', async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate('sender', 'name avatar role');

    // Mark incoming messages as read
    await Message.updateMany(
      { sender: otherId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    res.json({ success: true, messages });
  } catch (err) {
    console.error('Get messages error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch messages.' });
  }
});

// ─── POST /api/messages/:userId — Send a message ────────────────────────────
router.post(
  '/:userId',
  [body('text').trim().notEmpty().withMessage('Message text is required').isLength({ max: 2000 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const message = await Message.create({
        sender: req.user._id,
        receiver: req.params.userId,
        text: req.body.text,
      });

      const populated = await message.populate('sender', 'name avatar role');
      res.status(201).json({ success: true, message: populated });
    } catch (err) {
      console.error('Send message error:', err.message);
      res.status(500).json({ success: false, message: 'Failed to send message.' });
    }
  }
);

// ─── PATCH /api/messages/read/:userId — Mark messages from user as read ──────
router.patch('/read/:userId', async (req, res) => {
  try {
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Mark read error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to mark messages as read.' });
  }
});

module.exports = router;
