const mongoose = require('mongoose');

const tradeAuditSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pair: {
      type: String,
      required: [true, 'Currency pair is required'],
      trim: true,
      maxlength: 20,
    },
    direction: {
      type: String,
      enum: ['Buy', 'Sell'],
      required: true,
    },
    entryPrice: {
      type: String,
      required: true,
      trim: true,
    },
    stopLoss: {
      type: String,
      trim: true,
      default: '',
    },
    takeProfit: {
      type: String,
      trim: true,
      default: '',
    },
    result: {
      type: String,
      trim: true,
      default: '',
    },
    analysis: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },
    screenshot: {
      type: String,
      trim: true,
      default: '',
    },
    // Audit review fields
    status: {
      type: String,
      enum: ['Pending', 'In Review', 'Approved', 'Needs Improvement'],
      default: 'Pending',
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    feedback: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TradeAudit', tradeAuditSchema);
