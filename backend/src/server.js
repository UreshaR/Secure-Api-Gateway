require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const { requestLogger } = require('./middleware/requestLogger');
const { detectDDoS } = require('./middleware/attackDetection');

const app = express();

// ── Security headers ─────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ── Body parsing (limit 10 KB) ────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ── Global rate limiter ───────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests', code: 'RATE_LIMIT' }
}));

// ── DDoS detection ────────────────────────────────────────
app.use(detectDDoS);

// ── Request logger (MongoDB) ──────────────────────────────
app.use(requestLogger);

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/crypto',    require('./routes/crypto'));
app.use('/api/protected', require('./routes/protected'));

// ── Health check ──────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// ── 404 ───────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'Server error' : err.message });
});

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Gateway running on http://localhost:${PORT}`));
};

start().catch(e => { console.error(e); process.exit(1); });
module.exports = app;
