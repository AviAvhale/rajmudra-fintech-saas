const mongoose = require('mongoose');

const tradeEntrySchema = new mongoose.Schema(
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
    lotSize: {
      type: String,
      trim: true,
      default: '',
    },
    result: {
      type: String,
      trim: true,
      default: '',
    },
    pnl: {
      type: String,
      trim: true,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TradeEntry', tradeEntrySchema);
