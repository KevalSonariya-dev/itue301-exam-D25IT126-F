import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage Component (Task 2)
 * 
 * Integrated with AuthContext:
 * - Updates attendee, token, and role on login.
 * - Redirects authenticated users to protected pages (/events or /organizer).
 */
function LoginPage() {
  const { login, token, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('attendee'); // 'attendee' or 'organizer'

  // If already logged in, redirect away from LoginPage
  useEffect(() => {
    if (token) {
      const destination = location.state?.from?.pathname || '/events';
      navigate(destination, { replace: true });
    }
  }, [token, navigate, location]);

  const handleStandardLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    // Mock authentication payload (Task 2: without backend API)
    const mockAttendee = {
      name: email.split('@')[0],
      email: email,
    };
    const mockToken = `mock-jwt-token-${Date.now()}`;

    login(mockAttendee, mockToken, loginRole);

    const redirectPath = loginRole === 'organizer' ? '/organizer' : '/events';
    navigate(redirectPath, { replace: true });
  };

  // Quick helper buttons for student viva demo
  const handleQuickLogin = (selectedRole) => {
    const isOrganizer = selectedRole === 'organizer';
    const mockAttendee = {
      name: isOrganizer ? 'Admin Organizer' : 'Keval Sonariya',
      email: isOrganizer ? 'organizer@charusat.edu.in' : 'd25it126@charusat.edu.in',
    };
    const mockToken = `mock-token-${selectedRole}-${Date.now()}`;

    login(mockAttendee, mockToken, selectedRole);

    const targetRoute = isOrganizer ? '/organizer' : '/events';
    navigate(targetRoute, { replace: true });
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        <div className="login-card-header">
          <span className="login-icon-badge">🔐</span>
          <h2 className="login-title">Sign in to EventHub</h2>
          <p className="login-subtitle">
            Authenticate to access protected event booking and dashboard routes.
          </p>
        </div>

        <form onSubmit={handleStandardLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              className="form-input"
              placeholder="e.g. attendee@charusat.edu.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="role-select" className="form-label">
              Select Role for Session
            </label>
            <select
              id="role-select"
              className="form-input"
              value={loginRole}
              onChange={(e) => setLoginRole(e.target.value)}
            >
              <option value="attendee">Attendee (Standard User)</option>
              <option value="organizer">Organizer (Admin Quota)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary-block">
            Sign In with Credentials
          </button>
        </form>

        {/* Quick-test buttons for examination demo */}
        <div className="quick-login-box">
          <div className="quick-login-title">Quick Demo Login (Viva Preset):</div>
          <div className="quick-login-actions">
            <button
              type="button"
              className="btn-quick-attendee"
              onClick={() => handleQuickLogin('attendee')}
            >
              👤 Login as Attendee
            </button>
            <button
              type="button"
              className="btn-quick-organizer"
              onClick={() => handleQuickLogin('organizer')}
            >
              🛡️ Login as Organizer
            </button>
          </div>
        </div>

        <div className="login-footer-hint">
          <span>Protected routes require a valid token &amp; role via AuthContext.</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
