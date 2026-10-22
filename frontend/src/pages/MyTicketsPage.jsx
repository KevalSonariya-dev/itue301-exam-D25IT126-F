import React from 'react';

/**
 * TEMPORARY SAMPLE BOOKED TICKETS DATA
 * NOTE FOR LATER TASKS: This sample array demonstrates the MyTicketsPage UI.
 * It will be replaced by user-specific ticket data fetched from GET /api/tickets.
 */
const SAMPLE_BOOKED_TICKETS = [
  {
    ticketId: 'TKT-98231',
    eventTitle: 'TechNova Global Hackathon 2026',
    category: 'Technology',
    date: 'Nov 15, 2026 • 09:00 AM',
    venue: 'Convention Center, Hall A',
    quantity: 2,
    status: 'Confirmed',
    bookedAt: 'Oct 20, 2026',
  },
  {
    ticketId: 'TKT-74190',
    eventTitle: 'UI/UX Design & Micro-interactions',
    category: 'Workshop',
    date: 'Nov 22, 2026 • 02:00 PM',
    venue: 'Creative Arts Hub, Room 4B',
    quantity: 1,
    status: 'Confirmed',
    bookedAt: 'Oct 21, 2026',
  },
];

function MyTicketsPage() {
  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">My Booked Tickets</h2>
          <p className="section-subtitle">
            View your registered event passes and confirmed bookings.
          </p>
        </div>
        <div className="events-count-pill">
          {SAMPLE_BOOKED_TICKETS.length} Active Tickets
        </div>
      </div>

      <div className="tickets-list">
        {SAMPLE_BOOKED_TICKETS.map((ticket) => (
          <div key={ticket.ticketId} className="ticket-card">
            <div className="ticket-card-main">
              <div className="ticket-tag-row">
                <span className="ticket-id-badge">ID: {ticket.ticketId}</span>
                <span className="ticket-status-badge status-confirmed">
                  ● {ticket.status}
                </span>
              </div>
              <h3 className="ticket-event-title">{ticket.eventTitle}</h3>
              <div className="event-meta-list">
                <div className="event-meta-item">
                  <span className="meta-icon" aria-hidden="true">📅</span>
                  <span className="meta-label">{ticket.date}</span>
                </div>
                <div className="event-meta-item">
                  <span className="meta-icon" aria-hidden="true">📍</span>
                  <span className="meta-label">{ticket.venue}</span>
                </div>
              </div>
            </div>

            <div className="ticket-card-side">
              <div className="ticket-qty-box">
                <span className="ticket-qty-label">Quantity</span>
                <span className="ticket-qty-value">{ticket.quantity}</span>
              </div>
              <button
                type="button"
                className="btn-download-pass"
                onClick={() => alert(`Downloading pass for ${ticket.ticketId}`)}
              >
                View Pass
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MyTicketsPage;
