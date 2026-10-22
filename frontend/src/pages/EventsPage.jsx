import React, { useState } from 'react';
import EventCard from '../components/EventCard';

/**
 * TEMPORARY SAMPLE DATA
 * NOTE FOR LATER TASKS: This sample array will be replaced by GET /api/events API call.
 */
const SAMPLE_EVENTS = [
  {
    id: 'evt-101',
    title: 'TechNova Global Hackathon 2026',
    category: 'Technology',
    date: 'Nov 15, 2026 • 09:00 AM',
    venue: 'Convention Center, Hall A',
    ticketsAvailable: 45,
  },
  {
    id: 'evt-102',
    title: 'Indie Fusion Music Festival',
    category: 'Concert',
    date: 'Dec 05, 2026 • 06:30 PM',
    venue: 'Grand Amphitheater Arena',
    ticketsAvailable: 120,
  },
  {
    id: 'evt-103',
    title: 'International AI & Web Summit',
    category: 'Conference',
    date: 'Oct 30, 2026 • 10:00 AM',
    venue: 'City Tech Park Auditorium',
    ticketsAvailable: 0, // Demonstrates conditional rendering for Sold Out badge
  },
  {
    id: 'evt-104',
    title: 'UI/UX Design & Micro-interactions',
    category: 'Workshop',
    date: 'Nov 22, 2026 • 02:00 PM',
    venue: 'Creative Arts Hub, Room 4B',
    ticketsAvailable: 18,
  },
  {
    id: 'evt-105',
    title: 'Cloud Security & DevSecOps Summit',
    category: 'Cybersecurity',
    date: 'Dec 12, 2026 • 11:00 AM',
    venue: 'Silicon Valley Expo Hall',
    ticketsAvailable: 0, // Demonstrates conditional rendering for Sold Out badge
  },
  {
    id: 'evt-106',
    title: 'Startup Pitch & Venture Gala',
    category: 'Business',
    date: 'Jan 10, 2027 • 05:00 PM',
    venue: 'Metropolitan Hotel Ballroom',
    ticketsAvailable: 65,
  },
];

function EventsPage() {
  // Requirement 7 & 8: Meaningful state values managed by useState
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [bookingMessage, setBookingMessage] = useState(null);

  // Handler when clicking "Book Ticket" on any card
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setTicketQuantity(1);
    setBookingMessage(null);

    // Smooth scroll to the booking form
    const formElement = document.getElementById('booking-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handler when submitting the booking form
  const handleBookingSubmit = (e) => {
    e.preventDefault();

    if (!selectedEvent) return;

    if (ticketQuantity <= 0 || ticketQuantity > selectedEvent.ticketsAvailable) {
      alert(`Please choose a quantity between 1 and ${selectedEvent.ticketsAvailable}.`);
      return;
    }

    // Meaningful state update for booking confirmation
    setBookingMessage({
      type: 'success',
      text: `🎉 Booking Confirmed! You booked ${ticketQuantity} ticket(s) for "${selectedEvent.title}".`,
      details: {
        event: selectedEvent.title,
        quantity: ticketQuantity,
        venue: selectedEvent.venue,
        date: selectedEvent.date,
      },
    });

    // Reset selection after booking
    setSelectedEvent(null);
    setTicketQuantity(1);
  };

  const handleCancelBooking = () => {
    setSelectedEvent(null);
    setTicketQuantity(1);
  };

  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Upcoming Events</h2>
          <p className="section-subtitle">
            Explore conferences, hackathons, and festivals. Select an event below to book tickets.
          </p>
        </div>
        <div className="events-count-pill">
          Showing {SAMPLE_EVENTS.length} Events
        </div>
      </div>

      {/* Booking Form Section (Task 2 Requirement 7 & 8) */}
      <div id="booking-section" className="booking-panel card">
        <div className="booking-panel-header">
          <span className="booking-panel-icon">🎟️</span>
          <div>
            <h3>Event Ticket Reservation</h3>
            <p className="card-hint">
              Select any available event card or choose from the list to reserve tickets.
            </p>
          </div>
        </div>

        {/* Confirmation feedback */}
        {bookingMessage && (
          <div className="booking-alert-success" role="alert">
            <p className="booking-alert-title">{bookingMessage.text}</p>
            <p className="booking-alert-sub">
              📍 Venue: {bookingMessage.details.venue} | 📅 Date: {bookingMessage.details.date}
            </p>
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
                  ✓ {selectedEvent.ticketsAvailable} remaining in quota
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
                    disabled={ticketQuantity <= 1}
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
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10) || 1;
                      setTicketQuantity(Math.min(selectedEvent.ticketsAvailable, Math.max(1, val)));
                    }}
                  />
                  <button
                    type="button"
                    className="btn-stepper"
                    disabled={ticketQuantity >= selectedEvent.ticketsAvailable}
                    onClick={() =>
                      setTicketQuantity((q) =>
                        Math.min(selectedEvent.ticketsAvailable, q + 1)
                      )
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="booking-actions">
              <button type="submit" className="btn-primary">
                Confirm Booking ({ticketQuantity} {ticketQuantity === 1 ? 'Ticket' : 'Tickets'})
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancelBooking}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="booking-prompt-empty">
            <p>
              👉 Click <strong>"Book Ticket"</strong> on any event card below to open the reservation form.
            </p>
          </div>
        )}
      </div>

      {/* Responsive Grid of EventCards */}
      <div className="events-grid">
        {SAMPLE_EVENTS.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            category={event.category}
            date={event.date}
            venue={event.venue}
            ticketsAvailable={event.ticketsAvailable}
            onBook={() => handleSelectEvent(event)}
          />
        ))}
      </div>
    </section>
  );
}

export default EventsPage;
