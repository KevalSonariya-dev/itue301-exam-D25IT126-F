import React, { useState, useEffect } from 'react';
import api from '../../api/api';

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAdminBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      if (res && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch admin bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleStatusChange = async (ticketId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;

    const confirmChange = window.confirm(
      `Change ticket ${ticketId} status from "${currentStatus}" to "${newStatus}"?\nInventory will be automatically adjusted.`
    );
    if (!confirmChange) return;

    try {
      setUpdatingId(ticketId);
      setFeedback(null);
      const res = await api.updateAdminBookingStatus(ticketId, newStatus);

      setFeedback({
        type: 'success',
        text: `✓ Ticket ${ticketId} status updated to "${newStatus}".`,
      });

      await fetchBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
      setFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update ticket status.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h2 className="admin-page-title">Booking Management</h2>
          <p className="admin-page-subtitle">
            Inspect all attendee reservations and administer booking status transitions.
          </p>
        </div>
        <button
          type="button"
          className="btn-refresh"
          onClick={fetchBookings}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Bookings'}
        </button>
      </div>

      {feedback && (
        <div
          className={feedback.type === 'success' ? 'booking-alert-success' : 'alert-error'}
          role="alert"
        >
          {feedback.text}
        </div>
      )}

      {error && (
        <div className="alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="admin-controls-card card">
        <form onSubmit={handleSearchSubmit} className="admin-controls-grid">
          <div className="control-item flex-2">
            <label htmlFor="searchBookings" className="form-label">
              Search by Booking ID, Attendee, or Event
            </label>
            <input
              type="text"
              id="searchBookings"
              className="form-input"
              placeholder="e.g. tkt-9001, Keval, Hackathon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="control-item flex-1">
            <label htmlFor="statusFilter" className="form-label">
              Filter by Status
            </label>
            <select
              id="statusFilter"
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">ALL STATUSES</option>
              <option value="booked">BOOKED (ACTIVE)</option>
              <option value="cancelled">CANCELLED</option>
              <option value="used">USED / REDEEMED</option>
            </select>
          </div>

          <div className="control-actions-col">
            <button type="submit" className="btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="loading-state">Loading booking records...</div>
      ) : bookings.length === 0 ? (
        <div className="card empty-state-box">
          <p>No booking records match the selected filters.</p>
        </div>
      ) : (
        <div className="admin-table-container card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Attendee Details</th>
                <th>Event &amp; Venue</th>
                <th>Quantity</th>
                <th>Booking Date</th>
                <th>Status</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const attendee = b.attendeeId || {};
                const event = b.eventId || {};

                return (
                  <tr key={b.id}>
                    <td>
                      <span className="font-mono text-bold text-accent">{b.id}</span>
                    </td>
                    <td>
                      <div className="font-bold">{attendee.name || 'Unknown Attendee'}</div>
                      <div className="text-secondary text-sm">{attendee.email || 'N/A'}</div>
                    </td>
                    <td>
                      <div className="font-bold">{event.title || 'Event Removed'}</div>
                      <div className="text-secondary text-sm">📍 {event.venue || 'N/A'}</div>
                    </td>
                    <td>
                      <span className="badge-qty-pill">{b.quantity} Tickets</span>
                    </td>
                    <td>
                      <div className="text-sm">
                        {new Date(b.bookingDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`ticket-status-badge status-${b.status}`}>
                        ● {b.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <select
                        className="status-select-input"
                        value={b.status}
                        disabled={updatingId === b.id || b.status === 'used'}
                        onChange={(e) =>
                          handleStatusChange(b.id, e.target.value, b.status)
                        }
                      >
                        <option value="booked">Booked</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="used">Used</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminBookings;
