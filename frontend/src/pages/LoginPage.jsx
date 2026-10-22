import React, { useState } from 'react';

/**
 * LoginPage Component (Task 1 Starter UI)
 * NOTE: Authentication logic and backend endpoints will be implemented in subsequent tasks.
 */
function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Task 1: UI demonstration only. Authentication API call to be integrated in future task.
    alert(`Login attempted for: ${formData.email}\n(Authentication logic will be integrated in later task)`);
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-card-header">
          <span className="login-icon-badge">🔐</span>
          <h2 className="login-title">Sign in to EventHub</h2>
          <p className="login-subtitle">
            Enter your credentials to manage your bookings and explore exclusive events.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="form-input"
              placeholder="e.g. attendee@charusat.edu.in"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary-block">
            Sign In
          </button>
        </form>

        <div className="login-footer-hint">
          <span>Task 1 component skeleton (Auth logic will connect in later tasks)</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
