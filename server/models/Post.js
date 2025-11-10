const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  displayName: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // not exposed publicly
  displayName: String, // copied at creation so even if user changes later posts keep original alias (optional)
  content: { type: String, required: true },
  tags: [String],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who liked
  flags: { type: Number, default: 0 },
  flaggedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who flagged
  comments: [commentSchema],
  hidden: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for performance
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ hidden: 1 });

module.exports = mongoose.model('Post', postSchema);
