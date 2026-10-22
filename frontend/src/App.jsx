import React, { Suspense, lazy } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import EventsPage from './pages/EventsPage';
import MyTicketsPage from './pages/MyTicketsPage';
import './App.css';

// Requirement 1: Lazy-load OrganizerPanel using React.lazy
const OrganizerPanel = lazy(() => import('./pages/OrganizerPanel'));

// Admin Panel Components
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEvents from './pages/admin/AdminEvents';
import AdminBookings from './pages/admin/AdminBookings';
import AdminAttendees from './pages/admin/AdminAttendees';

/**
 * Navigation Bar Component
 * Requirement 6: Navigation links for all routes using NavLink without full-page reloads.
 */
function NavigationBar() {
  const { attendee, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink to="/events" className="brand">
          <span className="brand-logo-icon">🎟️</span>
          <span className="brand-name">EventHub</span>
        </NavLink>

        {/* Navigation links */}
        <nav className="nav-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            Sign In
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            Explore Events
          </NavLink>

          <NavLink
            to="/my-tickets"
            className={({ isActive }) => `nav-btn ${isActive ? 'active' : ''}`}
          >
            My Tickets
          </NavLink>

          <NavLink
            to="/organizer"
            className={({ isActive }) =>
              `nav-btn ${isActive ? 'active' : ''} ${role === 'organizer' ? 'nav-organizer-highlight' : ''}`
            }
          >
            Organizer Panel
          </NavLink>

          {/* Admin link visible only to users with the 'admin' role */}
          {isAuthenticated && role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `nav-btn nav-admin-highlight ${isActive ? 'active' : ''}`
              }
            >
              ⚙️ Admin Panel
            </NavLink>
          )}

          {/* User profile / session status */}
          {isAuthenticated && (
            <div className="user-session-bar">
              <span className="user-greeting">
                👤 {attendee?.name || 'User'}
                <span className={`role-tag role-${role}`}>({role})</span>
              </span>
              <button
                type="button"
                className="btn-logout"
                onClick={handleLogout}
                title="Log out from current session"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

/**
 * Suspense fallback loading indicator for lazy-loaded route
 */
function LoadingFallback() {
  return (
    <div className="suspense-fallback">
      <div className="spinner"></div>
      <p>Loading Organizer Panel bundle...</p>
    </div>
  );
}

/**
 * Main Application Component with Router Routes
 */
function AppRoutes() {
  return (
    <div className="app-layout">
      <NavigationBar />

      <main className="main-content">
        <div className="content-container">
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<LoginPage />} />

            {/* Protected Route: EventsPage (Requires Token) */}
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <EventsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Route: MyTicketsPage (Requires Token) */}
            <Route
              path="/my-tickets"
              element={
                <ProtectedRoute>
                  <MyTicketsPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Route: OrganizerPanel (Lazy-Loaded + Requires 'organizer' Role) */}
            <Route
              path="/organizer"
              element={
                <ProtectedRoute requiredRole="organizer">
                  <Suspense fallback={<LoadingFallback />}>
                    <OrganizerPanel />
                  </Suspense>
                </ProtectedRoute>
              }
            />

            {/* Protected Route: Admin Panel and Nested Pages (Requires 'admin' Role) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="events" element={<AdminEvents />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="attendees" element={<AdminAttendees />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<LoginPage />} />
          </Routes>
        </div>
      </main>

      <footer className="footer">
        <p>EventHub Ticket Booking System • ITUE301 Examination Task 2</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
