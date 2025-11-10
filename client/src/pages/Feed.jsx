import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CreatePost from '../components/CreatePost';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function fetchPosts() {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const res = await api.get('/posts', { params });
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId) {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likes: res.data.likes } : p));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleFlag(postId) {
    if (!window.confirm('Flag this post as inappropriate?')) return;
    try {
      await api.post(`/posts/${postId}/flag`);
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to flag post');
    }
  }

  function handleLogout() {
    logout();
    navigate('/');
  }

  useEffect(() => { fetchPosts(); }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.length > 2 || search.length === 0) {
        fetchPosts();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">QuiteConnect</span>
          <div className="d-flex align-items-center">
            <button className="btn btn-warning btn-sm me-2" onClick={() => navigate('/chat')}>
              💬 Random Chat
            </button>
            <button className="btn btn-info btn-sm me-2" onClick={() => navigate('/profile')}>
              👤 Profile
            </button>
            <span className="text-white me-3">{user?.displayName}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4" style={{ maxWidth: '800px' }}>
        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Create Post */}
        <CreatePost onPosted={fetchPosts} />

        {/* Posts Feed */}
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="alert alert-info text-center">
              No posts found. Be the first to share something!
            </div>
          ) : (
            posts.map(p => (
              <div key={p._id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <strong className="text-primary">{p.displayName || 'Anonymous'}</strong>
                      <small className="text-muted ms-2">
                        {new Date(p.createdAt).toLocaleString()}
                      </small>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleFlag(p._id)}
                      title="Flag as inappropriate"
                    >
                      🚩
                    </button>
                  </div>
                  
                  <p className="card-text mb-3">{p.content}</p>
                  
                  {p.tags && p.tags.length > 0 && (
                    <div className="mb-2">
                      {p.tags.map((tag, i) => (
                        <span key={i} className="badge bg-secondary me-1">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleLike(p._id)}
                    >
                      👍 {p.likes || 0}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      💬 {p.comments?.length || 0}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
