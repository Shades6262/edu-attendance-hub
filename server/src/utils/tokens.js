const crypto = require('crypto');

const hashToken = (raw) => crypto.createHash('sha256').update(raw).digest('hex');

// raw goes in the email link, hash is what we store
const createToken = () => {
  const raw = crypto.randomBytes(32).toString('hex');
  return { raw, hash: hashToken(raw) };
};

module.exports = { createToken, hashToken };