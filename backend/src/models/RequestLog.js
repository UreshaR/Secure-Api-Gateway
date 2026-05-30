const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  requestId:    { type: String, required: true, unique: true },
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  username:     { type: String, default: 'anonymous' },
  method:       { type: String, required: true },
  endpoint:     { type: String, required: true },
  statusCode:   Number,
  ipAddress:    { type: String, required: true },
  userAgent:    String,
  responseTime: Number,
  timestamp:    { type: Date, default: Date.now, index: true }
});

// Auto-delete after 90 days
schema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

module.exports = mongoose.model('RequestLog', schema);
