const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // not exposed publicly
  displayName: String, // copied at creation so even if user changes later posts keep original alias (optional)
  content: { type: String, required: true },
  tags: [String],
  likes: { type: Number, default: 0 },
  flags: { type: Number, default: 0 },
  comments: [commentSchema],
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
