import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([
    { id: 1, user: "Anon123", content: "Feeling happy today!" },
    { id: 2, user: "Anon456", content: "Anyone wants to chat anonymously?" },
    { id: 3, user: "Anon789", content: "Life is tough sometimes..." },
  ]);
  const [newPost, setNewPost] = useState("");

  const addPost = () => {
    if (newPost.trim() === "") return;
    const post = {
      id: Date.now(),
      user: `Anon${Math.floor(Math.random() * 1000)}`,
      content: newPost,
    };
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm px-4 py-3">
        <span className="navbar-brand fw-bold text-primary">Anon Social</span>
        <div className="ms-auto">
          <button className="btn btn-outline-danger" onClick={() => navigate("/login")}>
            Logout
          </button>
        </div>
      </nav>

      {/* New Post Input */}
      <div className="container my-4">
        <div className="card shadow-sm p-3 rounded-3">
          <div className="d-flex align-items-center mb-2">
            <span className="fw-bold me-2">You</span>
          </div>
          <textarea
            className="form-control mb-2"
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            rows={3}
          ></textarea>
          <button className="btn btn-primary w-100" onClick={addPost}>
            Post
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="container mb-5">
        {posts.map((post) => (
          <div key={post.id} className="card shadow-sm rounded-3 mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center mb-2">
                <div className="bg-secondary rounded-circle me-2" style={{ width: 40, height: 40 }}></div>
                <span className="fw-bold">{post.user}</span>
              </div>
              <p className="card-text">{post.content}</p>
              <div>
                <button className="btn btn-sm btn-outline-primary me-2">Like</button>
                <button className="btn btn-sm btn-outline-secondary">Comment</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
