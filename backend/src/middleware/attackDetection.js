const { v4: uuidv4 } = require('uuid');
const AttackAlert = require('../models/AttackAlert');
const { getIP } = require('./requestLogger');

// In-memory trackers (use Redis for production multi-instance)
const loginTracker = new Map();  // ip -> { count, first, blocked }
const ddosTracker  = new Map();  // ip -> [timestamps]

// Cleanup every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of loginTracker) if (now - v.first > 15 * 60000) loginTracker.delete(k);
  for (const [k, v] of ddosTracker)  if (!v.filter(t => now - t < 60000).length) ddosTracker.delete(k);
}, 10 * 60000);

// ── helpers ─────────────────────────────────────────────
const saveAlert = async (type, severity, ip, description, extra = {}) => {
  try {
    return await AttackAlert.create({
      alertId: `ALT-${Date.now()}-${uuidv4().slice(0,6).toUpperCase()}`,
      type, severity, ipAddress: ip, description, ...extra
    });
  } catch { /* duplicate alert? ignore */ }
};

// ── Brute-force detection ────────────────────────────────
const detectBruteForce = (req, res, next) => {
  const ip = getIP(req);
  const threshold = parseInt(process.env.BRUTE_FORCE_THRESHOLD) || 5;
  const windowMs  = (parseInt(process.env.BRUTE_FORCE_WINDOW_MINUTES) || 15) * 60000;
  const now = Date.now();

  let t = loginTracker.get(ip) || { count: 0, first: now, blocked: false };
  if (now - t.first > windowMs) { t = { count: 0, first: now, blocked: false }; }

  if (t.blocked) {
    const mins = Math.ceil((t.first + windowMs - now) / 60000);
    return res.status(429).json({ success: false, message: `Blocked. Retry in ${mins} min.`, code: 'BRUTE_FORCE_BLOCKED' });
  }

  t.count++;
  loginTracker.set(ip, t);

  if (t.count >= threshold) {
    t.blocked = true;
    loginTracker.set(ip, t);
    saveAlert('BRUTE_FORCE', 'HIGH', ip, `${t.count} failed login attempts`, { requestCount: t.count });
    return res.status(429).json({ success: false, message: 'Too many login attempts. Temporarily blocked.', code: 'BRUTE_FORCE' });
  }

  req.loginAttemptsLeft = threshold - t.count;
  next();
};

const resetBruteForce = (ip) => loginTracker.delete(ip);

// ── DDoS detection ───────────────────────────────────────
const detectDDoS = (req, res, next) => {
  const ip = getIP(req);
  const threshold = 200;
  const now = Date.now();

  const ts = (ddosTracker.get(ip) || []).filter(t => now - t < 60000);
  ts.push(now);
  ddosTracker.set(ip, ts);

  if (ts.length >= threshold) {
    saveAlert('DDOS_ATTEMPT', 'CRITICAL', ip, `${ts.length} requests/min from this IP`, { requestCount: ts.length });
    return res.status(429).json({ success: false, message: 'DDoS detected. Request blocked.', code: 'DDOS' });
  }
  next();
};

// ── Injection detection ───────────────────────────────────
const detectInjection = (req, res, next) => {
  const patterns = [/<script/i, /javascript:/i, /on\w+\s*=/i,
                    /\b(SELECT|INSERT|DROP|DELETE|UNION)\b/i, /--\s/, /\/\*/];

  const check = (v) => typeof v === 'string' && patterns.some(p => p.test(v));
  const scanObj = (o) => o && Object.values(o).some(v => typeof v === 'object' ? scanObj(v) : check(v));

  if (scanObj(req.body) || scanObj(req.query)) {
    saveAlert('INJECTION_ATTEMPT', 'HIGH', getIP(req), `Injection pattern on ${req.originalUrl}`);
    return res.status(400).json({ success: false, message: 'Malicious content detected.', code: 'INJECTION' });
  }
  next();
};

module.exports = { detectBruteForce, detectDDoS, detectInjection, resetBruteForce, saveAlert };
