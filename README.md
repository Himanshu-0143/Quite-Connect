# QuiteConnect - Anonymous Social Media Platform

An anonymous social media platform where users can share thoughts, connect with random people, and chat anonymously.

## Features

- 🎭 **Anonymous Posting**: Share thoughts without revealing identity
- 💬 **Random Chat**: Connect and chat with random users in real-time
- 👍 **Post Interactions**: Like, comment, and flag posts
- 🔍 **Search & Filter**: Find posts by content or tags
- 🛡️ **Content Moderation**: Automatic profanity filtering and user flagging system
- 🔒 **Secure Authentication**: Email-based authentication with hashed emails
- ⚡ **Real-time Chat**: WebSocket-based instant messaging

## Tech Stack

### Backend
- Node.js & Express
- MongoDB & Mongoose
- Socket.io (real-time chat)
- JWT authentication
- bcryptjs (password hashing)
- express-rate-limit (API protection)
- bad-words (content moderation)

### Frontend
- React 18
- React Router v6
- Bootstrap 5
- Socket.io-client
- Axios

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
EMAIL_SECRET=your_email_secret_here
CLIENT_URL=http://localhost:5173
```

5. Start the server:
```bash
npm run dev
```

Server will run on http://localhost:5000

### Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Project Structure

```
Quite-Connect-main/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context (Auth)
│   │   ├── services/         # API services
│   │   └── App.jsx           # Main app component
│   └── package.json
│
├── server/                    # Node.js backend
│   ├── models/               # MongoDB models
│   ├── routes/               # API routes
│   ├── middleware/           # Custom middleware
│   ├── utils/                # Utility functions
│   ├── server.js             # Main server file
│   └── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts` - Get all posts (with pagination)
- `POST /api/posts` - Create new post (authenticated)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts/:id/like` - Like/unlike post (authenticated)
- `POST /api/posts/:id/comment` - Comment on post (authenticated)
- `POST /api/posts/:id/flag` - Flag inappropriate post (authenticated)

### Chat
- `POST /api/chat/match` - Find random chat partner (authenticated)
- `GET /api/chat/rooms` - Get user's active chats (authenticated)
- `GET /api/chat/rooms/:roomId` - Get chat messages (authenticated)
- `POST /api/chat/rooms/:roomId/end` - End a chat (authenticated)

## Features in Detail

### Anonymous Posting
Users can create posts with optional display names. Email addresses are hashed for privacy.

### Random Chat System
- Click "Random Chat" to be matched with an available user
- Real-time messaging using Socket.io
- Chat history is saved
- Option to end chat at any time

### Content Moderation
- Automatic profanity filtering using bad-words library
- User flagging system (posts hidden after 5 flags)
- Rate limiting to prevent spam

### Security Features
- Passwords hashed with bcryptjs
- Email addresses stored as hashes
- JWT token authentication
- Rate limiting on auth and post routes
- CORS protection
- Helmet.js security headers

## Development

### Backend Development
```bash
cd server
npm run dev
```

### Frontend Development
```bash
cd client
npm run dev
```

### Production Build
```bash
cd client
npm run build
```

## Environment Variables

### Server
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `EMAIL_SECRET` - Secret key for email hashing
- `CLIENT_URL` - Frontend URL for CORS

### Client
- `VITE_API_URL` - Backend API URL

## Security Notes

⚠️ **Important**: 
- Never commit `.env` files to version control
- Use strong secrets for JWT_SECRET and EMAIL_SECRET
- Update the example `.env.example` files with your actual values
- Consider implementing additional security measures for production

## Future Enhancements

- [ ] User profiles with customizable anonymous avatars
- [ ] Media upload support (images)
- [ ] Emoji reactions
- [ ] Notification system
- [ ] Advanced search with filters
- [ ] Admin dashboard for moderation
- [ ] Report system for users
- [ ] Block/mute functionality
- [ ] Dark mode

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and questions, please open an issue on the GitHub repository.
