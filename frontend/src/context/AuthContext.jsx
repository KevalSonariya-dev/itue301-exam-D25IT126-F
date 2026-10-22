import React, { createContext, useContext, useState } from 'react';

// 1. Create the Authentication Context
const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps the application and provides
 * authentication state: attendee details, JWT token, and user role.
 */
export function AuthProvider({ children }) {
  // Meaningful state values initialized from localStorage (if existing) or null
  const [attendee, setAttendee] = useState(() => {
    const savedAttendee = localStorage.getItem('eventhub_attendee');
    return savedAttendee ? JSON.parse(savedAttendee) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('eventhub_token') || null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('eventhub_role') || null;
  });

  /**
   * Log in user and persist state
   * @param {Object} attendeeData - e.g. { name: 'Keval Sonariya', email: 'd25it126@charusat.edu.in' }
   * @param {string} authToken - JWT token string
   * @param {string} userRole - 'attendee' or 'organizer'
   */
  const login = (attendeeData, authToken, userRole) => {
    setAttendee(attendeeData);
    setToken(authToken);
    setRole(userRole);

    localStorage.setItem('eventhub_attendee', JSON.stringify(attendeeData));
    localStorage.setItem('eventhub_token', authToken);
    localStorage.setItem('eventhub_role', userRole);
  };

  /**
   * Log out user and clear state & storage
   */
  const logout = () => {
    setAttendee(null);
    setToken(null);
    setRole(null);

    localStorage.removeItem('eventhub_attendee');
    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_role');
  };

  const value = {
    attendee,
    token,
    role,
    isAuthenticated: Boolean(token),
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook for easy access to AuthContext
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
