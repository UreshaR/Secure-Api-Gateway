const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { getIP } = require('../middleware/requestLogger');
const { resetBruteForce } = require('../middleware/attackDetection');

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });

    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(409).json({ success: false, message: 'Username or email already exists' });

    const user = await User.create({ username, email, password, role: 'user' });
    const token = generateToken(user);

    res.status(201).json({
      success: true, message: 'Registered successfully',
      data: { token, user: { id: user._id, username, email, role: user.role } }
    });
  } catch (e) {
    if (e.name === 'ValidationError')
      return res.status(400).json({ success: false, message: Object.values(e.errors).map(x => x.message).join(', ') });
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.isAccountLocked()) {
      const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ success: false, message: `Account locked. Try in ${mins} min.`, code: 'LOCKED' });
    }

    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account deactivated' });

    const ok = await user.comparePassword(password);
    if (!ok) {
      await user.incrementFailed();
      return res.status(401).json({
        success: false, message: 'Invalid credentials',
        attemptsLeft: Math.max(0, (parseInt(process.env.BRUTE_FORCE_THRESHOLD)||5) - user.failedLogins)
      });
    }

    await user.resetFailed();
    resetBruteForce(getIP(req));
    user.lastLogin = new Date(); user.lastLoginIP = getIP(req); await user.save();

    const token = generateToken(user);
    res.json({
      success: true, message: 'Login successful',
      data: {
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role,
                permissions: user.getPermissions(), lastLogin: user.lastLogin }
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// GET /api/auth/me
const getMe = (req, res) => {
  res.json({
    success: true,
    data: { id: req.user._id, username: req.user.username, email: req.user.email,
            role: req.user.role, permissions: req.user.getPermissions(), lastLogin: req.user.lastLogin }
  });
};

// POST /api/auth/logout
const logout = (req, res) => res.json({ success: true, message: 'Logged out' });

module.exports = { register, login, getMe, logout };
