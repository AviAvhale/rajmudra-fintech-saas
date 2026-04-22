const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    phone: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    batch: { type: String, default: 'Batch A - Jan 2026' },
    role: {
      type: String,
      enum: ['superadmin', 'admin', 'user'],
      default: 'user',
    },
    hasPaid: { type: Boolean, default: false },
    avatar: { type: String, default: '' },
    // Session tracking — max 3 concurrent sessions
    activeSessions: [
      {
        sessionId: String,
        userAgent: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    // Brute-force protection
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Generate avatar initials from name
userSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.avatar) {
    const parts = this.name.split(' ');
    this.avatar = parts.map((p) => p[0]).join('').toUpperCase().slice(0, 3);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
