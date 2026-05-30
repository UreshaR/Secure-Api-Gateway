const CryptoJS = require('crypto-js');

const KEY = process.env.AES_SECRET_KEY || 'defaultkey32charslong__changeme!';

const encrypt = (data) => {
  const text = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(text, KEY).toString();
};

const decrypt = (encrypted) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, KEY);
  const text = bytes.toString(CryptoJS.enc.Utf8);
  if (!text) throw new Error('Decryption failed');
  try { return JSON.parse(text); } catch { return text; }
};

const sha256 = (data) => CryptoJS.SHA256(data).toString();

module.exports = { encrypt, decrypt, sha256 };
