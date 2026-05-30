const { encrypt, decrypt, sha256 } = require('../utils/encryption');

const encryptData = (req, res) => {
  try {
    const { data } = req.body;
    if (!data) return res.status(400).json({ success: false, message: 'data required' });
    res.json({ success: true, data: { encrypted: encrypt(data), algorithm: 'AES-256' } });
  } catch { res.status(500).json({ success: false, message: 'Encryption failed' }); }
};

const decryptData = (req, res) => {
  try {
    const { encrypted } = req.body;
    if (!encrypted) return res.status(400).json({ success: false, message: 'encrypted required' });
    res.json({ success: true, data: { decrypted: decrypt(encrypted) } });
  } catch { res.status(400).json({ success: false, message: 'Decryption failed – invalid data' }); }
};

const hashData = (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ success: false, message: 'data required' });
  res.json({ success: true, data: { hash: sha256(typeof data === 'string' ? data : JSON.stringify(data)), algorithm: 'SHA-256' } });
};

module.exports = { encryptData, decryptData, hashData };
