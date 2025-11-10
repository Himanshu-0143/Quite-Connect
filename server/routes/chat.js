const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');

// Find or create a random chat partner
router.post('/match', auth, async (req, res) => {
  try {
    // Find users currently looking for a chat or available users
    const availableUsers = await User.find({ 
      _id: { $ne: req.user._id } 
    }).limit(50);

    if (availableUsers.length === 0) {
      return res.status(404).json({ msg: 'No users available for chat right now' });
    }

    // Pick a random user
    const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];

    // Check if a room already exists between these users
    let room = await ChatRoom.findOne({
      participants: { $all: [req.user._id, randomUser._id] },
      isActive: true
    });

    if (!room) {
      // Create new room
      room = await ChatRoom.create({
        participants: [req.user._id, randomUser._id]
      });
    }

    res.json({ 
      roomId: room._id,
      partnerId: randomUser._id,
      partnerName: randomUser.displayName
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get user's active chats
router.get('/rooms', auth, async (req, res) => {
  try {
    const rooms = await ChatRoom.find({
      participants: req.user._id,
      isActive: true
    })
    .populate('participants', 'displayName')
    .sort({ lastActivity: -1 })
    .limit(20);

    res.json(rooms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get messages from a room
router.get('/rooms/:roomId', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId)
      .populate('participants', 'displayName');

    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // Check if user is a participant
    if (!room.participants.some(p => p._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// End a chat
router.post('/rooms/:roomId/end', auth, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    if (!room.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    room.isActive = false;
    await room.save();

    res.json({ msg: 'Chat ended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
