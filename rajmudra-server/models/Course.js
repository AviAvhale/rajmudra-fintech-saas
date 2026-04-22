const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  url: { type: String, default: '' },
  description: { type: String, default: '' },
}, { timestamps: true });

const courseSchema = new mongoose.Schema(
  {
    phaseNum: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    topicsList: [{ type: String }],
    videos: [videoSchema],
    enrolled: { type: Number, default: 0 },
    completionPct: { type: String, default: '0%' },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
