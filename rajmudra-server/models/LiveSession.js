const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, trim: true },
    instructor: { type: String, required: true, trim: true },
    instructorAvatar: { type: String, default: '' },
    phase: { type: String, default: '' },
    roomCode: { type: String, default: '' },
    status: { type: String, enum: ['live', 'upcoming', 'ended'], default: 'upcoming' },
    scheduledAt: { type: Date },
    duration: { type: String, default: '' },
    viewers: { type: Number, default: 0 },
    recordingUrl: { type: String, default: '' },
    batch: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LiveSession', liveSessionSchema);
