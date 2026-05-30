const { v4: uuidv4 } = require('uuid');
const RequestLog = require('../models/RequestLog');

const getIP = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.ip || '0.0.0.0';

const requestLogger = (req, res, next) => {
  const requestId = uuidv4();
  const start = Date.now();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', async () => {
    try {
      await RequestLog.create({
        requestId,
        userId: req.user?._id || null,
        username: req.user?.username || 'anonymous',
        method: req.method,
        endpoint: req.originalUrl,
        statusCode: res.statusCode,
        ipAddress: getIP(req),
        userAgent: req.get('User-Agent') || 'unknown',
        responseTime: Date.now() - start,
        timestamp: new Date()
      });
    } catch (e) { /* silent fail – logging must not break requests */ }
  });

  next();
};

module.exports = { requestLogger, getIP };
