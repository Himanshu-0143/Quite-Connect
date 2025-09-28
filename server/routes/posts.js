const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// very small bad-word example — replace with better solution later
const BAD_WORDS = ['badword1','badword2'];
function containsBadWords(t) {
  if (!t) return false;
  const s = t.toLowerCase();
  return BAD_WORDS.some(w => s.includes(w));
}

// create post
router.post('/', auth, async (req,res) => {
  try {
    const { content, tags } = req.body;
    if (!content) return res.status(400).json({ msg: 'Content required' });
    if (containsBadWords(content)) return res.status(400).json({ msg: 'Content violates rules' });

    const post = await Post.create({
      author: req.user._id,
      displayName: req.user.displayName,
      content,
      tags: tags || []
    });
    res.json(post);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

// list posts (public)
router.get('/', async (req,res) => {
  try {
    const page = parseInt(req.query.page || '1');
    const limit = Math.min(parseInt(req.query.limit || '10'), 50);
    const skip = (page - 1) * limit;
    const posts = await Post.find({ hidden: false }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    res.json(posts);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

// comment
router.post('/:id/comment', auth, async (req,res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ msg: 'Content required' });
    if (containsBadWords(content)) return res.status(400).json({ msg: 'Content violates rules' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    post.comments.push({ author: req.user._id, content });
    await post.save();
    res.json(post);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

// flag post
router.post('/:id/flag', auth, async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    post.flags += 1;
    // threshold: hide after 5 flags
    if (post.flags >= 5) post.hidden = true;
    await post.save();
    res.json({ flags: post.flags, hidden: post.hidden });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
