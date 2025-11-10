import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ displayName: '', bio: '' });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchMyPosts();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get('/auth/profile');
      setProfile({ 
        displayName: res.data.displayName || '', 
        bio: res.data.bio || '' 
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchMyPosts() {
    try {
      const res = await api.get('/posts/user/my-posts');
      setMyPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/auth/profile', profile);
      setSuccess('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(postId) {
    if (!window.confirm('Delete this post?')) return;

    try {
      await api.delete(`/posts/${postId}`);
      setMyPosts(myPosts.filter(p => p._id !== postId));
    } catch (err) {
      alert('Failed to delete post');
    }
  }

  return (
    <div className="bg-light min-vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow">
        <div className="container-fluid">
          <span className="navbar-brand fw-bold">QuiteConnect</span>
          <div className="d-flex align-items-center">
            <button className="btn btn-sm btn-outline-light me-2" onClick={() => navigate('/feed')}>
              📝 Feed
            </button>
            <button className="btn btn-warning btn-sm me-2" onClick={() => navigate('/chat')}>
              💬 Chat
            </button>
            <span className="text-white me-3">👤 {user?.displayName}</span>
            <button className="btn btn-outline-light btn-sm" onClick={() => { logout(); navigate('/'); }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-4" style={{ maxWidth: '900px' }}>
        {/* Profile Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">👤 Your Profile</h5>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            {editing ? (
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-3">
                  <label className="form-label">Display Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={profile.displayName}
                    onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Bio (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={profile.bio}
                    onChange={e => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell something about yourself..."
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => { setEditing(false); fetchProfile(); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="mb-3">
                  <strong>Display Name:</strong> {profile.displayName || user?.displayName}
                </div>
                <div className="mb-3">
                  <strong>Bio:</strong> {profile.bio || 'No bio set'}
                </div>
                <button className="btn btn-outline-primary" onClick={() => setEditing(true)}>
                  ✏️ Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card shadow-sm text-center">
              <div className="card-body">
                <h3 className="text-primary">{myPosts.length}</h3>
                <p className="text-muted mb-0">Total Posts</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm text-center">
              <div className="card-body">
                <h3 className="text-success">{myPosts.reduce((sum, p) => sum + (p.likes || 0), 0)}</h3>
                <p className="text-muted mb-0">Total Likes</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm text-center">
              <div className="card-body">
                <h3 className="text-warning">{myPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0)}</h3>
                <p className="text-muted mb-0">Total Comments</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Posts */}
        <div className="card shadow-sm">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0">📝 Your Posts</h5>
          </div>
          <div className="card-body">
            {myPosts.length === 0 ? (
              <div className="text-center text-muted py-4">
                <p>You haven't posted anything yet</p>
                <button className="btn btn-primary" onClick={() => navigate('/feed')}>
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="list-group">
                {myPosts.map(post => (
                  <div key={post._id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleString()}
                      </small>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deletePost(post._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                    <p className="mb-2">{post.content}</p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mb-2">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="badge bg-secondary me-1">#{tag}</span>
                        ))}
                      </div>
                    )}
                    <div className="d-flex gap-3">
                      <small>👍 {post.likes || 0} likes</small>
                      <small>💬 {post.comments?.length || 0} comments</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
