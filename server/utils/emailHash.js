const crypto = require('crypto');
const emailSecret = process.env.EMAIL_SECRET || 'change_me';

function hashEmail(email) {
  return crypto.createHmac('sha256', emailSecret)
               .update(String(email).trim().toLowerCase())
               .digest('hex');
}

module.exports = { hashEmail };
