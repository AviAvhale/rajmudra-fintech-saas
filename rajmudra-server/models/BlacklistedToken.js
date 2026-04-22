const mongoose = require('mongoose');

// Stores logged-out JWTs until their natural expiry so they cannot be reused
const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // MongoDB TTL index — auto-deletes expired docs
  },
});

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema);
