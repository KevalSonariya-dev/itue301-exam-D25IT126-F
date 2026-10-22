import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * OrganizerPanel Component (Lazy-Loaded for Task 2)
 * Accessible only by authenticated users with the 'organizer' role.
 */
function OrganizerPanel() {
  const { attendee, role } = useAuth();

  // Local state demonstrating organizer form controls (Viva-friendly)
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState('Technology');
  const [eventCreatedMessage, setEventCreatedMessage] = useState('');

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    setEventCreatedMessage(`Event "${newEventTitle}" (${newEventCategory}) staged successfully!`);
    setNewEventTitle('');
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <span className="organizer-badge">🛡️ Role: {role?.toUpperCase()}</span>
          <h2 className="section-title">Organizer Control Dashboard</h2>
          <p className="section-subtitle">
            Welcome back, <strong>{attendee?.name || 'Organizer'}</strong>. Manage event listings, inspect ticket quotas, and publish new events.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Total Events Managed</span>
          <span className="metric-value">6</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Total Tickets Sold</span>
          <span className="metric-value">345</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Access Level</span>
          <span className="metric-value text-accent">Organizer Admin</span>
        </div>
      </div>

      {/* Quick Event Creation Stage (Frontend Demo for Viva) */}
      <div className="card organizer-card">
        <h3>Publish a New Event Listing</h3>
        <p className="card-hint">
          This organizer-only panel was dynamically loaded via React.lazy and Suspense.
        </p>

        {eventCreatedMessage && (
          <div className="alert-success" role="alert">
            ✓ {eventCreatedMessage}
          </div>
        )}

        <form onSubmit={handleCreateEvent} className="organizer-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="eventTitle" className="form-label">
                Event Title
              </label>
              <input
                type="text"
                id="eventTitle"
                className="form-input"
                placeholder="e.g. AI Next-Gen Hackathon 2027"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="eventCategory" className="form-label">
                Category
              </label>
              <select
                id="eventCategory"
                className="form-input"
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value)}
              >
                <option value="Technology">Technology</option>
                <option value="Concert">Concert</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="Business">Business</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary">
            + Publish Event (Preview)
          </button>
        </form>
      </div>
    </section>
  );
}

export default OrganizerPanel;
