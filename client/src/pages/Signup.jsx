import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const navigate = useNavigate();

  function submit(e) {
    e.preventDefault();
    // Replace with API call
    alert(`Account created for ${email}`);
    navigate("/Home");
  }

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%", animation: "fadeIn 0.8s" }}>
        <h2 className="text-center mb-4">Create Anonymous Account</h2>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label htmlFor="displayName" className="form-label">Display Name (Optional)</label>
            <input
              type="text"
              className="form-control"
              id="displayName"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Enter display name"
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button className="btn btn-success w-100" type="submit">Sign Up</button>
        </form>
        <div className="mt-3 text-center">
          Already have an account?{" "}
          <button className="btn btn-link p-0" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
