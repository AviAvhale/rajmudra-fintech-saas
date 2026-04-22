const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    platformName: { type: String, default: 'Rajmudra Fintech' },
    supportEmail: { type: String, default: 'support@rajmudrafintech.com' },
    batchSizeLimit: { type: Number, default: 30 },
    cashfreeEnv: { type: String, default: 'sandbox' },
    cashfreeAppId: { type: String, default: 'TEST12345CF' },
    cashfreeSecret: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PlatformSettings', settingsSchema);
