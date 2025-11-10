const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const chatRoutes = require('./routes/chat');
const ChatRoom = require('./models/ChatRoom');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(helmet());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', async ({ roomId, userId, content }) => {
    try {
      const room = await ChatRoom.findById(roomId);
      if (!room) return;

      // Check if user is participant
      if (!room.participants.some(p => p.toString() === userId)) return;

      // Add message to room
      room.messages.push({ sender: userId, content });
      room.lastActivity = new Date();
      await room.save();

      // Broadcast to room
      io.to(roomId).emit('new-message', {
        sender: userId,
        content,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('Message error:', err);
    }
  });

  socket.on('typing', ({ roomId, userId }) => {
    socket.to(roomId).emit('user-typing', { userId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => server.listen(PORT, () => console.log(`Server started on ${PORT}`)))
  .catch(err => console.error('DB connect error:', err));
