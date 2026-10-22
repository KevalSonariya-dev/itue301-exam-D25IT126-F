import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

function MyTicketsPage() {
  const { attendee, isAuthenticated } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  // Fetch authenticated attendee's tickets from GET /api/v1/tickets/my
  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMyTickets();
      if (res && res.data) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load your tickets from backend. Please ensure you are signed in and backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyTickets();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Handle ticket cancellation (Requirement 6)
  const handleCancelTicket = async (ticketId, eventTitle, quantity) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to cancel booking for "${eventTitle}" (${quantity} tickets)?\nThis will restore ${quantity} ticket(s) back to the event quota.`
    );
    if (!confirmCancel) return;

    try {
      setProcessingId(ticketId);
      setActionMessage(null);
      const res = await api.updateTicketStatus(ticketId, 'cancelled');

      setActionMessage({
        type: 'success',
        text: `✓ Booking for "${eventTitle}" cancelled. ${quantity} ticket(s) restored to quota.`,
      });

      // Update local ticket status in state
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: 'cancelled' } : t))
      );
    } catch (err) {
      console.error('Failed to cancel ticket:', err);
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to cancel ticket.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">My Booked Tickets</h2>
          <p className="section-subtitle">
            Authenticated attendee: <strong>{attendee?.name || attendee?.email || 'Guest'}</strong> ({attendee?.email || 'N/A'})
          </p>
        </div>
        <div className="events-count-pill">
          {loading ? 'Loading...' : `${tickets.length} Bookings Found`}
        </div>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div
          className={
            actionMessage.type === 'success'
              ? 'booking-alert-success'
              : 'booking-alert-error'
          }
          role="alert"
        >
          {actionMessage.text}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading your tickets from server...</div>
      ) : tickets.length === 0 ? (
        <div className="card empty-tickets-card">
          <span className="empty-icon">🎟️</span>
          <h3>No Tickets Reserved Yet</h3>
          <p className="card-hint">
            You haven't booked any event tickets yet. Explore upcoming conferences, hackathons, and festivals to make your first reservation.
          </p>
          <NavLink to="/events" className="btn-primary">
            Explore Events &amp; Book Tickets
          </NavLink>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => {
            const eventInfo = ticket.eventId || {};
            const isBooked = ticket.status === 'booked';
            const isCancelled = ticket.status === 'cancelled';
            const isUsed = ticket.status === 'used';

            return (
              <div
                key={ticket.id}
                className={`ticket-card ${isCancelled ? 'ticket-card--cancelled' : ''}`}
              >
                <div className="ticket-card-main">
                  <div className="ticket-tag-row">
                    <span className="ticket-id-badge">ID: {ticket.id}</span>
                    <span
                      className={`ticket-status-badge status-${ticket.status || 'booked'}`}
                    >
                      ● {ticket.status?.toUpperCase() || 'BOOKED'}
                    </span>
                    <span className="ticket-date-booked">
                      Booked on: {new Date(ticket.bookingDate).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="ticket-event-title">
                    {eventInfo.title || 'Event Title Not Available'}
                  </h3>

                  <div className="event-meta-list">
                    <div className="event-meta-item">
                      <span className="meta-icon" aria-hidden="true">📅</span>
                      <span className="meta-label">
                        {eventInfo.date || 'TBA'}
                      </span>
                    </div>
                    <div className="event-meta-item">
                      <span className="meta-icon" aria-hidden="true">📍</span>
                      <span className="meta-label">
                        {eventInfo.venue || 'TBA'}
                      </span>
                    </div>
                    {eventInfo.category && (
                      <div className="event-meta-item">
                        <span className="meta-icon" aria-hidden="true">🏷️</span>
                        <span className="meta-label">{eventInfo.category}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="ticket-card-side">
                  <div className="ticket-qty-box">
                    <span className="ticket-qty-label">Quantity</span>
                    <span className="ticket-qty-value">{ticket.quantity}</span>
                  </div>

                  {/* Actions based on ticket status */}
                  {isBooked && (
                    <button
                      type="button"
                      className="btn-cancel-ticket"
                      disabled={processingId === ticket.id}
                      onClick={() =>
                        handleCancelTicket(
                          ticket.id,
                          eventInfo.title,
                          ticket.quantity
                        )
                      }
                      title="Cancel this booking and restore tickets to event quota"
                    >
                      {processingId === ticket.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}

                  {isCancelled && (
                    <span className="badge-cancelled-pill">Cancelled</span>
                  )}

                  {isUsed && (
                    <span className="badge-used-pill">Redeemed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default MyTicketsPage;
