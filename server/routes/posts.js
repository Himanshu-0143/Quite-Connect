const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const leoProfanity = require('leo-profanity');
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// Rate limiter for post creation
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each user to 10 posts per windowMs
  message: 'Too many posts, please try again later'
});

// Content filter setup
leoProfanity.loadDictionary('en'); // Load English profanity dictionary

function containsBadWords(text) {
  if (!text) return false;
  return leoProfanity.check(text);
}

// create post
router.post('/', auth, postLimiter, async (req,res) => {
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
    const tag = req.query.tag;
    const search = req.query.search;

    let query = { hidden: false };
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    res.json(posts);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

// like/unlike post
router.post('/:id/like', auth, async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    const alreadyLiked = post.likedBy.includes(req.user._id);
    
    if (alreadyLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter(id => id.toString() !== req.user._id.toString());
      post.likes = Math.max(0, post.likes - 1);
    } else {
      // Like
      post.likedBy.push(req.user._id);
      post.likes += 1;
    }

    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked });
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

    post.comments.push({ 
      author: req.user._id, 
      displayName: req.user.displayName,
      content 
    });
    await post.save();
    
    // Populate comments for response
    await post.populate('comments.author', 'displayName');
    res.json(post);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

// flag post
router.post('/:id/flag', auth, async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });
    
    // Prevent duplicate flags from same user
    if (post.flaggedBy.includes(req.user._id)) {
      return res.status(400).json({ msg: 'Already flagged this post' });
    }

    post.flaggedBy.push(req.user._id);
    post.flags += 1;
    
    // threshold: hide after 5 flags
    if (post.flags >= 5) post.hidden = true;
    
    await post.save();
    res.json({ flags: post.flags, hidden: post.hidden });
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Server error' }); }
});

// Get single post with comments
router.get('/:id', async (req,res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.hidden) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (err) { 
    console.error(err); 
    res.status(500).json({ msg: 'Server error' }); 
  }
});

// Get current user's posts
router.get('/user/my-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Delete user's own post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
