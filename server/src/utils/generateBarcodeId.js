const crypto = require('crypto');

// Generates a short, unique-ish barcode value, e.g. "STU-4F9A21C3"
const generateBarcodeId = (role) => {
  const prefix = role.slice(0, 3).toUpperCase(); // STU, INS, ADM
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

module.exports = generateBarcodeId;