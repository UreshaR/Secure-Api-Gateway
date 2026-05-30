const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided', code: 'NO_TOKEN' });

    const token = header.slice(7);
    let decoded;
    try { decoded = verifyToken(token); }
    catch (e) {
      const code = e.message.includes('expired') ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
      return res.status(401).json({ success: false, message: e.message, code });
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'User not found', code: 'USER_NOT_FOUND' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account deactivated', code: 'INACTIVE' });
    if (user.isAccountLocked()) return res.status(403).json({ success: false, message: 'Account locked', code: 'LOCKED' });

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Auth error' });
  }
};

module.exports = { authenticate };
