import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminLayout Component
 * Provides unified navigation and structure for the EventHub Admin Panel.
 */
function AdminLayout() {
  const { attendee, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Admin Sub-Navigation Header */}
      <header className="admin-navbar">
        <div className="admin-navbar-container">
          <div className="admin-brand-section">
            <span className="admin-shield-icon">🛡️</span>
            <div>
              <div className="admin-brand-title">EventHub Control Center</div>
              <span className="admin-role-badge">ADMINISTRATOR</span>
            </div>
          </div>

          <nav className="admin-nav-links">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `admin-nav-tab ${isActive ? 'active' : ''}`
              }
            >
              📊 Dashboard
            </NavLink>
            <NavLink
              to="/admin/events"
              className={({ isActive }) =>
                `admin-nav-tab ${isActive ? 'active' : ''}`
              }
            >
              📅 Events
            </NavLink>
            <NavLink
              to="/admin/bookings"
              className={({ isActive }) =>
                `admin-nav-tab ${isActive ? 'active' : ''}`
              }
            >
              🎟️ Bookings
            </NavLink>
            <NavLink
              to="/admin/attendees"
              className={({ isActive }) =>
                `admin-nav-tab ${isActive ? 'active' : ''}`
              }
            >
              👥 Attendees
            </NavLink>
          </nav>

          <div className="admin-user-controls">
            <NavLink to="/events" className="btn-admin-return">
              ← Return to Main Site
            </NavLink>
            <button
              type="button"
              className="btn-logout"
              onClick={handleLogout}
              title="Sign out of Administrator Session"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="admin-main-content">
        <div className="admin-content-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
