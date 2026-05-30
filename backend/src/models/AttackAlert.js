const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  alertId:     { type: String, required: true, unique: true },
  type:        { type: String, required: true, enum: ['BRUTE_FORCE','DDOS_ATTEMPT','SUSPICIOUS_IP','RATE_LIMIT','INJECTION_ATTEMPT','UNAUTHORIZED_ACCESS'] },
  severity:    { type: String, enum: ['LOW','MEDIUM','HIGH','CRITICAL'], required: true },
  status:      { type: String, enum: ['ACTIVE','RESOLVED','FALSE_POSITIVE'], default: 'ACTIVE' },
  ipAddress:   { type: String, required: true },
  username:    { type: String, default: 'unknown' },
  endpoint:    String,
  description: { type: String, required: true },
  requestCount:{ type: Number, default: 1 },
  resolvedAt:  Date,
  resolvedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp:   { type: Date, default: Date.now, index: true }
}, { timestamps: true });

module.exports = mongoose.model('AttackAlert', schema);
