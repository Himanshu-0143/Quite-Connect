import React, { useState } from 'react';
import api from '../services/api';

export default function CreatePost({ onPosted }) {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      await api.post('/posts', { content, tags: tagArray });
      setContent('');
      setTags('');
      if (onPosted) onPosted();
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not post');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title mb-3">Share Your Thoughts</h5>
        <form onSubmit={submit}>
          <textarea 
            className="form-control mb-2" 
            rows="3" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="What's on your mind? Share anonymously..."
            disabled={loading}
            required
          />
          <input
            type="text"
            className="form-control form-control-sm mb-2"
            placeholder="Tags (comma-separated, optional)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            disabled={loading}
          />
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">{content.length}/500</small>
            <button 
              className="btn btn-primary" 
              type="submit" 
              disabled={loading || !content.trim()}
            >
              {loading ? 'Posting...' : '📝 Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
