import React, { useState, useEffect } from 'react';
import api from '../../api/api';

/**
 * AdminAttendees Component
 * Allows administrators to search, view attendee roles, booking totals,
 * and drill down into each attendee's full booking history safely.
 */
function AdminAttendees() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected attendee for history modal
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const fetchAttendees = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminAttendees(query);
      if (res && res.data) {
        setAttendees(res.data);
      }
    } catch (err) {
      console.error('Failed to load attendees:', err);
      setError(err.response?.data?.message || 'Failed to fetch attendee records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAttendees(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchAttendees('');
  };

  const handleViewHistory = async (attendeeId) => {
    try {
      setHistoryLoading(true);
      setHistoryError(null);
      setSelectedAttendee(null);
      const res = await api.getAdminAttendeeById(attendeeId);
      if (res && res.data) {
        setSelectedAttendee(res.data);
      }
    } catch (err) {
      console.error('Failed to load attendee history:', err);
      setHistoryError(err.response?.data?.message || 'Failed to load booking history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCloseHistory = () => {
    setSelectedAttendee(null);
    setHistoryError(null);
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Attendee Management</h2>
          <p className="admin-page-subtitle">
            Inspect registered attendees, assignable roles, and audit complete ticket reservation histories.
          </p>
        </div>
        <button
          type="button"
          className="btn-refresh"
          onClick={() => fetchAttendees(searchQuery.trim())}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Attendees'}
        </button>
      </div>

      {error && (
        <div className="alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="admin-controls-card card">
        <form onSubmit={handleSearchSubmit} className="admin-controls-grid">
          <div className="control-item flex-2">
            <label htmlFor="searchAttendees" className="form-label">
              Search Attendees by Name or Email
            </label>
            <input
              type="text"
              id="searchAttendees"
              className="form-input"
              placeholder="e.g. Keval, attendee@charusat.edu.in..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="control-actions-col">
            <button type="submit" className="btn-primary" disabled={loading}>
              Search
            </button>
            {searchQuery && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClearSearch}
                disabled={loading}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Safety Notice regarding Account Retention */}
      <div className="admin-info-banner">
        <span className="info-icon">ℹ️</span>
        <div>
          <strong>Account Integrity Policy:</strong> Attendee account deletion is restricted
          to preserve booking audit trails, ticket validation integrity, and financial records.
        </div>
      </div>

      {/* Attendees Table */}
      {loading ? (
        <div className="loading-state">Loading attendee accounts...</div>
      ) : attendees.length === 0 ? (
        <div className="card empty-state-box">
          <p>No attendees found matching "{searchQuery}".</p>
          {searchQuery && (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClearSearch}
              style={{ marginTop: '0.75rem' }}
            >
              Reset Search
            </button>
          )}
        </div>
      ) : (
        <div className="admin-table-container card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Attendee ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Booking Count</th>
                <th>Tickets Reserved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((att) => (
                <tr key={att.id}>
                  <td>
                    <span className="font-mono text-bold text-accent">{att.id}</span>
                  </td>
                  <td>
                    <div className="font-bold">{att.name}</div>
                  </td>
                  <td>
                    <span className="text-secondary">{att.email}</span>
                  </td>
                  <td>
                    <span className={`role-badge role-${att.role}`}>
                      {att.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="badge-qty-pill">
                      {att.totalBookings} {att.totalBookings === 1 ? 'booking' : 'bookings'}
                    </span>
                  </td>
                  <td>
                    <strong className="text-emerald">{att.totalTicketsBooked} tickets</strong>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-action-view"
                      onClick={() => handleViewHistory(att.id)}
                    >
                      📜 View History
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Booking History Modal */}
      {(selectedAttendee || historyLoading || historyError) && (
        <div className="modal-backdrop" onClick={handleCloseHistory}>
          <div
            className="modal-box modal-wide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                {selectedAttendee ? `Booking History: ${selectedAttendee.name}` : 'Attendee History'}
              </h3>
              <button
                type="button"
                className="btn-close-modal"
                onClick={handleCloseHistory}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {historyLoading && (
                <div className="loading-state">Fetching reservation history...</div>
              )}

              {historyError && (
                <div className="alert-error" role="alert">
                  ⚠️ {historyError}
                </div>
              )}

              {selectedAttendee && (
                <div>
                  <div className="attendee-modal-summary card">
                    <div className="summary-grid">
                      <div>
                        <span className="summary-label">Attendee:</span>
                        <strong> {selectedAttendee.name}</strong>
                      </div>
                      <div>
                        <span className="summary-label">Email:</span>
                        <span> {selectedAttendee.email}</span>
                      </div>
                      <div>
                        <span className="summary-label">Role:</span>
                        <span className={`role-badge role-${selectedAttendee.role}`}>
                          {selectedAttendee.role}
                        </span>
                      </div>
                      <div>
                        <span className="summary-label">Total Reservations:</span>
                        <strong> {selectedAttendee.totalBookings}</strong>
                      </div>
                    </div>
                  </div>

                  <h4 style={{ margin: '1.25rem 0 0.5rem 0' }}>All Associated Tickets</h4>

                  {selectedAttendee.bookings.length === 0 ? (
                    <p className="text-secondary" style={{ padding: '1rem 0' }}>
                      This attendee has not booked any tickets yet.
                    </p>
                  ) : (
                    <div className="admin-table-container">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Ticket ID</th>
                            <th>Event Title</th>
                            <th>Date &amp; Venue</th>
                            <th>Quantity</th>
                            <th>Booking Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAttendee.bookings.map((b) => (
                            <tr key={b.id}>
                              <td className="font-mono text-bold text-accent">{b.id}</td>
                              <td className="font-bold">{b.eventId?.title || 'Unknown Event'}</td>
                              <td className="text-secondary text-sm">
                                {b.eventId?.date || 'N/A'} • {b.eventId?.venue || 'N/A'}
                              </td>
                              <td>
                                <span className="badge-qty-pill">{b.quantity} Tickets</span>
                              </td>
                              <td className="text-sm">
                                {new Date(b.bookingDate).toLocaleDateString()}
                              </td>
                              <td>
                                <span className={`ticket-status-badge status-${b.status}`}>
                                  ● {b.status?.toUpperCase()}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCloseHistory}
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAttendees;
