import React, { useState } from 'react';
import api from '../services/api';

export default function CreatePost({ onPosted }) {
  const [content, setContent] = useState('');

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/posts', { content });
      setContent('');
      if (onPosted) onPosted();
    } catch (err) {
      alert(err.response?.data?.msg || 'Could not post');
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow">
      <textarea className="w-full p-2 border rounded" rows="3" value={content} onChange={e=>setContent(e.target.value)} placeholder="Share something..."></textarea>
      <div className="text-right mt-2"><button className="px-4 py-2 bg-blue-600 text-white rounded">Post</button></div>
    </form>
  );
}
