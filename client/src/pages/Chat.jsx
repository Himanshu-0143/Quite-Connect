import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('new-message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      socket.on('user-typing', ({ userId }) => {
        // Handle typing indicator
      });
    }
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchRooms() {
    try {
      const res = await api.get('/chat/rooms');
      setRooms(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  async function startNewChat() {
    setLoading(true);
    try {
      const res = await api.post('/chat/match');
      const { roomId, partnerId, partnerName } = res.data;
      
      setCurrentRoom(roomId);
      setPartner({ id: partnerId, name: partnerName });
      socket.emit('join-room', roomId);
      
      // Fetch room messages
      const roomRes = await api.get(`/chat/rooms/${roomId}`);
      setMessages(roomRes.data.messages || []);
      
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not find a chat partner');
    } finally {
      setLoading(false);
    }
  }

  async function selectRoom(room) {
    setCurrentRoom(room._id);
    const otherParticipant = room.participants.find(p => p._id !== user.id);
    setPartner(otherParticipant ? { id: otherParticipant._id, name: otherParticipant.displayName } : null);
    
    socket.emit('join-room', room._id);
    setMessages(room.messages || []);
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !currentRoom) return;

    socket.emit('send-message', {
      roomId: currentRoom,
      userId: user.id,
      content: newMessage
    });

    setNewMessage('');
  }

  async function endChat() {
    if (!window.confirm('End this chat?')) return;
    
    try {
      await api.post(`/chat/rooms/${currentRoom}/end`);
      setCurrentRoom(null);
      setPartner(null);
      setMessages([]);
      fetchRooms();
    } catch (err) {
      alert('Could not end chat');
    }
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">QuiteConnect - Chat</span>
          <div className="d-flex align-items-center">
            <button className="btn btn-sm btn-outline-light me-2" onClick={() => navigate('/feed')}>
              📝 Feed
            </button>
            <span className="text-white me-3">👤 {user?.displayName}</span>
            <button className="btn btn-outline-light btn-sm" onClick={() => { logout(); navigate('/'); }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-3" style={{ height: 'calc(100vh - 56px)' }}>
        <div className="row h-100">
          {/* Sidebar - Chat List */}
          <div className="col-md-3 pe-0">
            <div className="card h-100">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0">Your Chats</h6>
              </div>
              <div className="card-body p-0">
                <button 
                  className="btn btn-success w-100 rounded-0"
                  onClick={startNewChat}
                  disabled={loading}
                >
                  {loading ? '🔄 Finding...' : '➕ Start Random Chat'}
                </button>
                <div className="list-group list-group-flush" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
                  {rooms.length === 0 ? (
                    <div className="p-3 text-center text-muted">
                      <p>No active chats</p>
                    </div>
                  ) : (
                    rooms.map(room => {
                      const otherUser = room.participants.find(p => p._id !== user.id);
                      return (
                        <button
                          key={room._id}
                          className={`list-group-item list-group-item-action ${currentRoom === room._id ? 'active' : ''}`}
                          onClick={() => selectRoom(room)}
                        >
                          <div className="d-flex justify-content-between">
                            <strong>{otherUser?.displayName || 'Anonymous'}</strong>
                            <small>{new Date(room.lastActivity).toLocaleDateString()}</small>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="col-md-9 ps-2">
            <div className="card h-100">
              {currentRoom ? (
                <>
                  <div className="card-header bg-white d-flex justify-content-between align-items-center">
                    <div>
                      <h5 className="mb-0">💬 Chat with {partner?.name || 'Anonymous'}</h5>
                      <small className="text-muted">Anonymous conversation</small>
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={endChat}>
                      End Chat
                    </button>
                  </div>
                  
                  <div className="card-body" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 250px)' }}>
                    {messages.length === 0 ? (
                      <div className="text-center text-muted mt-5">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`mb-3 d-flex ${msg.sender === user.id ? 'justify-content-end' : 'justify-content-start'}`}
                        >
                          <div
                            className={`p-2 rounded ${
                              msg.sender === user.id ? 'bg-primary text-white' : 'bg-light'
                            }`}
                            style={{ maxWidth: '70%' }}
                          >
                            <div>{msg.content}</div>
                            <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="card-footer bg-white">
                    <form onSubmit={sendMessage} className="d-flex gap-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                      />
                      <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
                        Send
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="card-body d-flex align-items-center justify-content-center">
                  <div className="text-center">
                    <h3 className="text-muted mb-3">👋 Welcome to Anonymous Chat</h3>
                    <p className="text-muted">
                      Click "Start Random Chat" to connect with someone anonymously
                    </p>
                    <button className="btn btn-primary btn-lg mt-3" onClick={startNewChat} disabled={loading}>
                      {loading ? 'Finding Partner...' : 'Start Chatting'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
