// Role-Based Access Control middleware

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user)
    return res.status(401).json({ success: false, message: 'Not authenticated', code: 'UNAUTHENTICATED' });
  if (!roles.includes(req.user.role))
    return res.status(403).json({
      success: false,
      message: `Access denied. Need: ${roles.join(' or ')}. You have: ${req.user.role}`,
      code: 'FORBIDDEN'
    });
  next();
};

const adminOnly     = requireRole('admin');
const devOrAdmin    = requireRole('admin', 'developer');
const allRoles      = requireRole('admin', 'developer', 'user');

module.exports = { requireRole, adminOnly, devOrAdmin, allRoles };
