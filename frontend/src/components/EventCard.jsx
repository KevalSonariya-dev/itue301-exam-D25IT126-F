import React from 'react';

/**
 * Reusable EventCard component for displaying event information.
 * 
 * Props:
 * @param {string} title - The title/name of the event
 * @param {string} category - The category/genre of the event (e.g., Technology, Concert)
 * @param {string} date - The date and time of the event
 * @param {string} venue - Location or venue where the event takes place
 * @param {number} ticketsAvailable - Number of remaining available tickets
 */
function EventCard({ title, category, date, venue, ticketsAvailable, onBook }) {
  const isSoldOut = ticketsAvailable === 0;

  return (
    <div className={`event-card ${isSoldOut ? 'event-card--soldout' : ''}`}>
      <div className="event-card-header">
        <span className="event-category-badge">{category}</span>
        <span className={`event-tickets-count ${isSoldOut ? 'text-soldout' : 'text-available'}`}>
          {isSoldOut ? '0 Left' : `${ticketsAvailable} Left`}
        </span>
      </div>

      <div className="event-card-body">
        <h3 className="event-title">{title}</h3>

        <div className="event-meta-list">
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true">📅</span>
            <span className="meta-label">{date}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true">📍</span>
            <span className="meta-label">{venue}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon" aria-hidden="true">🎟️</span>
            <span className="meta-label">
              Tickets Available: <strong>{ticketsAvailable}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="event-card-footer">
        {/* Conditional Rendering: Sold Out badge vs Book button */}
        {isSoldOut ? (
          <span className="badge-sold-out" role="status">
            Sold Out
          </span>
        ) : (
          <button
            type="button"
            className="btn-book"
            onClick={() => (onBook ? onBook() : alert(`Selected event: "${title}"`))}
          >
            Book Ticket
          </button>
        )}
      </div>
    </div>
  );
}

export default EventCard;
