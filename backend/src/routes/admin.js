const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { adminOnly, devOrAdmin } = require('../middleware/rbac');
const c = require('../controllers/adminController');

router.use(authenticate);

router.get('/stats',               devOrAdmin, c.getStats);
router.get('/logs',                devOrAdmin, c.getLogs);
router.get('/alerts',              devOrAdmin, c.getAlerts);
router.patch('/alerts/:id/resolve',adminOnly,  c.resolveAlert);
router.get('/users',               adminOnly,  c.getUsers);
router.patch('/users/:id',         adminOnly,  c.updateUser);

module.exports = router;
