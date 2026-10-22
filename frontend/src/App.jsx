import React, { useState } from 'react';
import EventsPage from './pages/EventsPage';
import LoginPage from './pages/LoginPage';
import MyTicketsPage from './pages/MyTicketsPage';
import './App.css';

function App() {
  // Navigation tab state for Task 1 (Routing not implemented yet as per rules)
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="app-layout">
      {/* Top Navigation Header */}
      <header className="navbar">
        <div className="navbar-container">
          <div className="brand" onClick={() => setActiveTab('events')} role="button" tabIndex={0}>
            <span className="brand-logo-icon">🎟️</span>
            <span className="brand-name">EventHub</span>
          </div>

          <nav className="nav-links">
            <button
              type="button"
              className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              Explore Events
            </button>
            <button
              type="button"
              className={`nav-btn ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              My Tickets
            </button>
            <button
              type="button"
              className={`nav-btn nav-btn-cta ${activeTab === 'login' ? 'active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Sign In
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area Rendering Active Page Component */}
      <main className="main-content">
        <div className="content-container">
          {activeTab === 'events' && <EventsPage />}
          {activeTab === 'tickets' && <MyTicketsPage />}
          {activeTab === 'login' && <LoginPage />}
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>EventHub Ticket Booking System • ITUE301 Examination Task 1 Demo</p>
      </footer>
    </div>
  );
}

export default App;
