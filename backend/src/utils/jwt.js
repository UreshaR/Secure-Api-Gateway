const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'fallback_dev_secret_change_me';
const EXPIRES = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, username: user.username, role: user.role, email: user.email },
    SECRET,
    { expiresIn: EXPIRES, issuer: 'secure-api-gateway' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET, { issuer: 'secure-api-gateway' });
};

const decodeToken = (token) => jwt.decode(token);

module.exports = { generateToken, verifyToken, decodeToken };
