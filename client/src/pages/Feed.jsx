import React, { useEffect, useState } from 'react';
import api from '../services/api';
import CreatePost from '../components/CreatePost';
import { useAuth } from '../context/AuthContext';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const { user } = useAuth();

  async function fetchPosts() {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => { fetchPosts(); }, []);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4">Logged in as <strong>{user?.displayName}</strong></div>
      <CreatePost onPosted={fetchPosts} />
      <div className="mt-6 space-y-4">
        {posts.map(p => (
          <div key={p._id} className="p-4 bg-white rounded shadow">
            <div className="text-sm text-gray-500">{p.displayName} · <span className="text-xs">{new Date(p.createdAt).toLocaleString()}</span></div>
            <div className="mt-2">{p.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
