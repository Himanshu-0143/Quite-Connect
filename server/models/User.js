const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  emailHash: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  bio: { type: String, default: '' },
  role: { type: String, enum: ['user','admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
