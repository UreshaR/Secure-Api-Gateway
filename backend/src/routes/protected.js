const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { adminOnly, devOrAdmin, allRoles } = require('../middleware/rbac');

router.use(authenticate);

router.get('/user',      allRoles,   (req,res) => res.json({ success:true, message:'User endpoint ✅', user: req.user.username, role: req.user.role }));
router.get('/developer', devOrAdmin, (req,res) => res.json({ success:true, message:'Developer endpoint ✅', uptime: process.uptime() }));
router.get('/admin',     adminOnly,  (req,res) => res.json({ success:true, message:'Admin endpoint ✅', env: process.env.NODE_ENV }));

module.exports = router;
