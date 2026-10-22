import React, { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import api from '../api/api';
import { useAuth } from '../context/AuthContext';

function EventsPage() {
  const { isAuthenticated } = useAuth();

  // State managed by useState
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Booking Form State (Requirements 2, 4, 8)
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Fetch live event list from backend GET /api/v1/events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEvents();
      if (res && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch events from backend:', err);
      setError('Unable to reach the EventHub backend server. Ensure backend is running on http://localhost:5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // When clicking "Book Ticket" on any card
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setTicketQuantity(1);
    setBookingSuccess(null);
    setBookingError(null);

    // Smooth scroll to the booking section
    const formSection = document.getElementById('booking-section');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit booking form calling POST /api/v1/tickets
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingSuccess(null);
    setBookingError(null);

    if (!selectedEvent) return;

    if (!isAuthenticated) {
      setBookingError('Authentication required. Please sign in to book event tickets.');
      return;
    }

    const qty = parseInt(ticketQuantity, 10);
    if (isNaN(qty) || qty < 1) {
      setBookingError('Ticket quantity must be a positive integer of at least 1.');
      return;
    }

    if (qty > selectedEvent.ticketsAvailable) {
      setBookingError(
        `Cannot book ${qty} ticket(s). Only ${selectedEvent.ticketsAvailable} remaining for "${selectedEvent.title}".`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.bookTicket(selectedEvent.id, qty);

      // Requirement 4: Show clear confirmation with booking ID, event title, quantity, and remaining tickets
      setBookingSuccess({
        message: 'Booking successful',
        bookingId: res.data.id,
        eventTitle: res.data.eventId?.title || selectedEvent.title,
        quantityBooked: res.data.quantity,
        remainingTickets: res.remainingEventStock,
        venue: res.data.eventId?.venue || selectedEvent.venue,
        date: res.data.eventId?.date || selectedEvent.date,
      });

      // Update local events state immediately from confirmed API response
      setEvents((prevEvents) =>
        prevEvents.map((evt) =>
          evt.id === selectedEvent.id
            ? {
                ...evt,
                ticketsAvailable: res.remainingEventStock,
                ticketsBooked: res.ticketsBooked !== undefined ? res.ticketsBooked : (evt.ticketsBooked + qty),
              }
            : evt
        )
      );

      // Reset form
      setSelectedEvent(null);
      setTicketQuantity(1);
    } catch (err) {
      console.error('Booking submission failed:', err);
      const errorMsg =
        err.response?.data?.message || err.message || 'An error occurred while booking tickets.';
      setBookingError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelSelection = () => {
    setSelectedEvent(null);
    setTicketQuantity(1);
    setBookingError(null);
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Explore Events</h2>
          <p className="section-subtitle">
            Live event listings synchronized directly with the EventHub backend.
          </p>
        </div>
        <div className="events-count-pill">
          {loading ? 'Refreshing...' : `${events.length} Events Listed`}
        </div>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="alert-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Interactive Booking Panel (Requirements 2, 4, 8) */}
      <div id="booking-section" className="booking-panel card">
        <div className="booking-panel-header">
          <span className="booking-panel-icon">🎟️</span>
          <div>
            <h3>Event Ticket Reservation</h3>
            <p className="card-hint">
              Select any available event card below to book confirmed tickets.
            </p>
          </div>
        </div>

        {/* Success Alert Banner (Requirement 4) */}
        {bookingSuccess && (
          <div className="booking-alert-success" role="alert">
            <div className="booking-alert-header">
              <span className="success-icon">✓</span>
              <h4>{bookingSuccess.message}!</h4>
            </div>
            <div className="booking-details-grid">
              <div className="detail-item">
                <span className="detail-label">Booking ID:</span>
                <span className="detail-value font-mono">{bookingSuccess.bookingId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Event:</span>
                <span className="detail-value">{bookingSuccess.eventTitle}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tickets Reserved:</span>
                <span className="detail-value highlight">{bookingSuccess.quantityBooked}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Current Remaining Quota:</span>
                <span className="detail-value text-available">{bookingSuccess.remainingTickets} Left</span>
              </div>
            </div>
            <p className="booking-alert-footer">
              📍 Venue: {bookingSuccess.venue} • 📅 Date: {bookingSuccess.date}
            </p>
          </div>
        )}

        {/* Error Alert Banner */}
        {bookingError && (
          <div className="booking-alert-error" role="alert">
            ❌ <strong>Booking Error:</strong> {bookingError}
          </div>
        )}

        {selectedEvent ? (
          <form onSubmit={handleBookingSubmit} className="booking-form">
            <div className="selected-event-preview">
              <div className="preview-label">Selected Event:</div>
              <div className="preview-title">{selectedEvent.title}</div>
              <div className="preview-meta">
                <span>📍 {selectedEvent.venue}</span>
                <span>📅 {selectedEvent.date}</span>
                <span className="text-available">
                  ✓ {selectedEvent.ticketsAvailable} remaining of {selectedEvent.totalTickets || (selectedEvent.ticketsAvailable + (selectedEvent.ticketsBooked || 0))} total capacity
                </span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group flex-1">
                <label htmlFor="ticketQuantity" className="form-label">
                  Number of Tickets (Max: {selectedEvent.ticketsAvailable})
                </label>
                <div className="quantity-stepper">
                  <button
                    type="button"
                    className="btn-stepper"
                    disabled={ticketQuantity <= 1 || isSubmitting}
                    onClick={() => setTicketQuantity((q) => Math.max(1, q - 1))}
                  >
                    –
                  </button>
                  <input
                    type="number"
                    id="ticketQuantity"
                    className="form-input text-center"
                    min="1"
                    max={selectedEvent.ticketsAvailable}
                    value={ticketQuantity}
                    disabled={selectedEvent.ticketsAvailable === 0 || isSubmitting}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (isNaN(val)) {
                        setTicketQuantity(1);
                      } else {
                        setTicketQuantity(Math.min(selectedEvent.ticketsAvailable, Math.max(1, val)));
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-stepper"
                    disabled={ticketQuantity >= selectedEvent.ticketsAvailable || isSubmitting}
                    onClick={() =>
                      setTicketQuantity((q) => Math.min(selectedEvent.ticketsAvailable, q + 1))
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="booking-actions">
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting || selectedEvent.ticketsAvailable === 0}
              >
                {isSubmitting
                  ? 'Confirming with Server...'
                  : `Confirm Booking (${ticketQuantity} ${ticketQuantity === 1 ? 'Ticket' : 'Tickets'})`}
              </button>
              <button
                type="button"
                className="btn-secondary"
                disabled={isSubmitting}
                onClick={handleCancelSelection}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="booking-prompt-empty">
            <p>
              👉 Click <strong>"Book Ticket"</strong> on any event card below to open the live reservation form.
            </p>
          </div>
        )}
      </div>

      {/* Responsive Event Cards Grid (Requirement 7) */}
      {loading ? (
        <div className="loading-state">Loading live events from backend...</div>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              category={event.category}
              date={event.date}
              venue={event.venue}
              ticketsAvailable={event.ticketsAvailable}
              totalTickets={event.totalTickets}
              ticketsBooked={event.ticketsBooked}
              onBook={() => handleSelectEvent(event)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default EventsPage;
