import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserSecret, FaSmile, FaUsers, FaPenFancy } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([
    { id: 1, user: "Anon123", content: "Feeling happy today!" },
    { id: 2, user: "Anon456", content: "Anyone wants to chat anonymously?" },
    { id: 3, user: "Anon789", content: "Life is tough sometimes..." },
  ]);

  return (
    <div className="bg-light">
      {/* Hero Section */}
      <section
        className="hero d-flex align-items-center text-center text-white"
        style={{
          minHeight: "85vh",
          background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1600') center/cover no-repeat",
        }}
      >
        <div className="container">
          <h1 className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown">
            Welcome to <span className="text-warning">QuiteConnect</span>
          </h1>
          <p className="lead mb-4 animate__animated animate__fadeInUp">
            Share your thoughts, release stress, and connect — completely anonymous.
          </p>
          <div>
            <button
              className="btn btn-warning btn-lg me-3 px-4 shadow"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="btn btn-outline-light btn-lg px-4 shadow"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container text-center">
          <h2 className="mb-5 fw-bold">Why Choose QuiteConnect?</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-0 h-100 hover-shadow">
                <div className="card-body">
                  <FaUserSecret size={40} className="mb-3 text-primary" />
                  <h5 className="card-title mb-2 fw-semibold">Anonymous</h5>
                  <p className="card-text">
                    Share your thoughts without revealing your identity.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-0 h-100 hover-shadow">
                <div className="card-body">
                  <FaSmile size={40} className="mb-3 text-success" />
                  <h5 className="card-title mb-2 fw-semibold">Stress Relief</h5>
                  <p className="card-text">
                    Express yourself freely and relieve stress anytime.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm border-0 h-100 hover-shadow">
                <div className="card-body">
                  <FaUsers size={40} className="mb-3 text-warning" />
                  <h5 className="card-title mb-2 fw-semibold">Community</h5>
                  <p className="card-text">
                    Connect with a like-minded anonymous community.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="mb-4 text-center fw-bold">Recent Posts</h2>
          <div className="row">
            {posts.map((post) => (
              <div key={post.id} className="col-md-6 mb-4">
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="bg-secondary rounded-circle me-3"
                        style={{ width: 40, height: 40 }}
                      ></div>
                      <span className="fw-bold">{post.user}</span>
                    </div>
                    <p className="card-text">{post.content}</p>
                    <div className="mt-3">
                      <button className="btn btn-sm btn-outline-primary me-2">
                        👍 Like
                      </button>
                      <button className="btn btn-sm btn-outline-secondary">
                        💬 Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <p className="text-center text-muted">No posts yet. Be the first to share!</p>
            )}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-5 bg-dark text-white text-center">
        <div className="container">
          <h2 className="fw-bold mb-3">Join the Conversation</h2>
          <p className="mb-4">
            Start sharing your thoughts today and connect with people who understand you.
          </p>
          <button
            className="btn btn-warning btn-lg shadow"
            onClick={() => navigate("/signup")}
          >
            <FaPenFancy className="me-2" /> Get Started
          </button>
        </div>
      </section>
    </div>
  );
}
