import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';

/**
 * LoginPage Component
 * Authenticates against backend POST /api/v1/auth/login and receives signed JWT tokens
 */
function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If already authenticated with token, navigate away
  useEffect(() => {
    if (token) {
      const destination = location.state?.from?.pathname || '/events';
      navigate(destination, { replace: true });
    }
  }, [token, navigate, location]);

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.login(email, password);

      if (res && res.token && res.attendee) {
        login(res.attendee, res.token, res.attendee.role);
        const redirectPath = res.attendee.role === 'organizer' ? '/organizer' : '/events';
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Authentication failed. Ensure backend server is running on http://localhost:5000.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper buttons for viva testing calling live backend login endpoint
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setErrorMessage(null);
    try {
      setIsSubmitting(true);
      const res = await api.login(demoEmail, demoPassword);

      if (res && res.token && res.attendee) {
        login(res.attendee, res.token, res.attendee.role);
        const redirectPath = res.attendee.role === 'organizer' ? '/organizer' : '/events';
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      console.error('Quick login failed:', err);
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to sign in. Please verify backend is running on http://localhost:5000.'
      );
    } finally {
      setIsSubmitting(false);
    }
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

        {errorMessage && (
          <div className="alert-error" role="alert">
            ❌ {errorMessage}
          </div>
        )}

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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            className="btn-primary-block"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In with Credentials'}
          </button>
        </form>

        {/* Quick-test buttons for examination viva */}
        <div className="quick-login-box">
          <div className="quick-login-title">Live Viva Presets (Backend Authenticated):</div>
          <div className="quick-login-actions">
            <button
              type="button"
              className="btn-quick-attendee"
              disabled={isSubmitting}
              onClick={() =>
                handleQuickLogin('attendee@charusat.edu.in', 'Password123!')
              }
            >
              👤 Login as Attendee
            </button>
            <button
              type="button"
              className="btn-quick-organizer"
              disabled={isSubmitting}
              onClick={() =>
                handleQuickLogin('organizer@charusat.edu.in', 'Password123!')
              }
            >
              🛡️ Login as Organizer
            </button>
          </div>
        </div>

        <div className="login-footer-hint">
          <span>
            Communicates with live POST /api/v1/auth/login and receives signed Bearer tokens.
          </span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
