const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { detectBruteForce, detectInjection } = require('../middleware/attackDetection');
const { register, login, getMe, logout } = require('../controllers/authController');

router.post('/register', detectInjection, register);
router.post('/login',    detectInjection, detectBruteForce, login);
router.get('/me',        authenticate, getMe);
router.post('/logout',   authenticate, logout);

module.exports = router;
