import React from 'react';
import EventCard from '../components/EventCard';

/**
 * TEMPORARY SAMPLE DATA
 * NOTE FOR LATER TASKS: This hardcoded sample array demonstrates Task 1 UI & prop passing.
 * It will be replaced by a live backend API call (e.g. GET /api/events) via Axios/Fetch.
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
  return (
    <section className="page-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Upcoming Events</h2>
          <p className="section-subtitle">
            Browse and book your tickets for trending events, conferences, and workshops.
          </p>
        </div>
        <div className="events-count-pill">
          Showing {SAMPLE_EVENTS.length} Events
        </div>
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
          />
        ))}
      </div>
    </section>
  );
}

export default EventsPage;
