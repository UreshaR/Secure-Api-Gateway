const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role:     { type: String, enum: ['admin','developer','user'], default: 'user' },
  isActive: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  lockUntil: Date,
  failedLogins: { type: Number, default: 0 },
  lastLogin: Date,
  lastLoginIP: String
}, { timestamps: true });

// Hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.isAccountLocked = function() {
  return this.isLocked && this.lockUntil && this.lockUntil > Date.now();
};

userSchema.methods.incrementFailed = async function() {
  this.failedLogins += 1;
  const threshold = parseInt(process.env.BRUTE_FORCE_THRESHOLD) || 5;
  if (this.failedLogins >= threshold) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + (parseInt(process.env.BRUTE_FORCE_WINDOW_MINUTES)||15) * 60000);
  }
  await this.save();
};

userSchema.methods.resetFailed = async function() {
  this.failedLogins = 0; this.isLocked = false; this.lockUntil = null;
  await this.save();
};

userSchema.methods.getPermissions = function() {
  const map = {
    admin:     ['read','write','delete','manage_users','view_logs','view_dashboard'],
    developer: ['read','write','view_logs','view_dashboard'],
    user:      ['read']
  };
  return map[this.role] || [];
};

module.exports = mongoose.model('User', userSchema);
