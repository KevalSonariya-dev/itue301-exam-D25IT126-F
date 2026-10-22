import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * Purpose (for Viva):
 * 1. Checks if the user has an authentication token.
 *    - If NO token: Redirects to login page ('/') while saving location in state.
 * 2. Checks role-based access control (RBAC):
 *    - If user is authenticated BUT does not have the required role (e.g., 'organizer'):
 *      Redirects to '/events' instead of logging them out.
 * 3. If all checks pass: Renders the protected child components.
 * 
 * Props:
 * @param {React.ReactNode} children - The protected page component
 * @param {string} [requiredRole] - Optional required role (e.g. 'organizer')
 */
function ProtectedRoute({ children, requiredRole }) {
  const { token, role } = useAuth();
  const location = useLocation();

  // Requirement 4: Redirect users without a token to the login page (/)
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Requirement 5: Role check - If authenticated but lacks the required role, redirect to /events
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/events" replace />;
  }

  // User is authenticated and possesses the required role
  return children;
}

export default ProtectedRoute;
