const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { encryptData, decryptData, hashData } = require('../controllers/cryptoController');

router.use(authenticate);
router.post('/encrypt', encryptData);
router.post('/decrypt', decryptData);
router.post('/hash',    hashData);

module.exports = router;
