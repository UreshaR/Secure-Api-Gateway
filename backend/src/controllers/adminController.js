const User = require('../models/User');
const RequestLog = require('../models/RequestLog');
const AttackAlert = require('../models/AttackAlert');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const since24h = new Date(Date.now() - 86400000);
    const [totalUsers, totalReqs, failedReqs, activeAlerts, critAlerts, reqsPerHour, alertsByType, statusDist] = await Promise.all([
      User.countDocuments(),
      RequestLog.countDocuments({ timestamp: { $gte: since24h } }),
      RequestLog.countDocuments({ timestamp: { $gte: since24h }, statusCode: { $gte: 400 } }),
      AttackAlert.countDocuments({ status: 'ACTIVE' }),
      AttackAlert.countDocuments({ status: 'ACTIVE', severity: 'CRITICAL' }),
      RequestLog.aggregate([
        { $match: { timestamp: { $gte: since24h } } },
        { $group: { _id: { $hour: '$timestamp' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      AttackAlert.aggregate([
        { $match: { timestamp: { $gte: new Date(Date.now() - 7*86400000) } } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      RequestLog.aggregate([
        { $match: { timestamp: { $gte: since24h } } },
        { $group: { _id: { $floor: { $divide: ['$statusCode', 100] } }, count: { $sum: 1 } } }
      ])
    ]);

    res.json({ success: true, data: {
      overview: { totalUsers, totalReqs, failedReqs, activeAlerts, critAlerts,
        successRate: totalReqs ? (((totalReqs-failedReqs)/totalReqs)*100).toFixed(1) : 100 },
      reqsPerHour, alertsByType, statusDist
    }});
  } catch (e) { res.status(500).json({ success: false, message: 'Stats error' }); }
};

// GET /api/admin/logs
const getLogs = async (req, res) => {
  try {
    const { page=1, limit=30, method, status, ip, search } = req.query;
    const filter = {};
    if (method)  filter.method = method.toUpperCase();
    if (status)  filter.statusCode = parseInt(status);
    if (ip)      filter.ipAddress = { $regex: ip, $options: 'i' };
    if (search)  filter.$or = [{ endpoint: { $regex: search, $options:'i' } },
                                { username: { $regex: search, $options:'i' } }];

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      RequestLog.find(filter).sort({ timestamp: -1 }).skip(+skip).limit(+limit),
      RequestLog.countDocuments(filter)
    ]);
    res.json({ success: true, data: { logs, total, page: +page, pages: Math.ceil(total/limit) } });
  } catch (e) { res.status(500).json({ success: false, message: 'Logs error' }); }
};

// GET /api/admin/alerts
const getAlerts = async (req, res) => {
  try {
    const { page=1, limit=20, status, severity, type } = req.query;
    const filter = {};
    if (status)   filter.status = status;
    if (severity) filter.severity = severity;
    if (type)     filter.type = type;

    const [alerts, total] = await Promise.all([
      AttackAlert.find(filter).sort({ timestamp:-1 }).skip((page-1)*limit).limit(+limit),
      AttackAlert.countDocuments(filter)
    ]);
    res.json({ success: true, data: { alerts, total, page: +page, pages: Math.ceil(total/limit) } });
  } catch (e) { res.status(500).json({ success: false, message: 'Alerts error' }); }
};

// PATCH /api/admin/alerts/:id/resolve
const resolveAlert = async (req, res) => {
  const a = await AttackAlert.findOneAndUpdate(
    { alertId: req.params.id },
    { status: 'RESOLVED', resolvedAt: new Date(), resolvedBy: req.user._id },
    { new: true }
  );
  if (!a) return res.status(404).json({ success: false, message: 'Alert not found' });
  res.json({ success: true, data: a });
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { page=1, limit=20, role, search } = req.query;
    const filter = {};
    if (role)   filter.role = role;
    if (search) filter.$or = [{ username:{ $regex:search,$options:'i' } },{ email:{ $regex:search,$options:'i' } }];

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt:-1 }).skip((page-1)*limit).limit(+limit).select('-password'),
      User.countDocuments(filter)
    ]);
    res.json({ success: true, data: { users, total, page: +page, pages: Math.ceil(total/limit) } });
  } catch (e) { res.status(500).json({ success: false, message: 'Users error' }); }
};

// PATCH /api/admin/users/:id
const updateUser = async (req, res) => {
  const { role, isActive, isLocked } = req.body;
  const update = {};
  if (role !== undefined)     update.role = role;
  if (isActive !== undefined) update.isActive = isActive;
  if (isLocked !== undefined) { update.isLocked = isLocked; if (!isLocked) { update.failedLogins=0; update.lockUntil=null; } }

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
};

module.exports = { getStats, getLogs, getAlerts, resolveAlert, getUsers, updateUser };
