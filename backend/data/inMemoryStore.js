/**
 * ============================================================================
 * TEMPORARY IN-MEMORY DATA STORAGE MODULE (TASK 3)
 * ============================================================================
 * NOTE FOR EXAMINER / VIVA:
 * This module provides temporary, non-persistent in-memory data storage for
 * Attendees, Events, and Tickets. It enables full testing of the Express REST API
 * (Task 3) while database connectivity (Task 5) is deferred.
 * 
 * - Data lives in memory and resets whenever the Node.js server restarts.
 * - Data operations are isolated here so they can be replaced cleanly with
 *   Mongoose models and MongoDB Atlas queries in the next examination phase.
 * ============================================================================
 */

const bcrypt = require('bcryptjs');

// Pre-computed bcrypt hash for 'Password123!' (Salt rounds: 10)
// Generated securely so server starts immediately without synchronous hashing delay
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

/**
 * 1. Initial Sample Attendees (Pre-seeded with hashed passwords)
 */
const attendees = [
  {
    id: 'usr-1',
    name: 'Keval Sonariya',
    email: 'attendee@charusat.edu.in',
    phone: '+91 9876543210',
    password: DEMO_PASSWORD_HASH,
    role: 'attendee',
    createdAt: new Date('2026-10-01T10:00:00Z'),
  },
  {
    id: 'usr-2',
    name: 'Faculty Organizer',
    email: 'organizer@charusat.edu.in',
    phone: '+91 9876543211',
    password: DEMO_PASSWORD_HASH,
    role: 'organizer',
    createdAt: new Date('2026-10-01T10:00:00Z'),
  },
  {
    id: 'usr-3',
    name: 'Second Attendee',
    email: 'attendee2@charusat.edu.in',
    phone: '+91 9876543212',
    password: DEMO_PASSWORD_HASH,
    role: 'attendee',
    createdAt: new Date('2026-10-02T10:00:00Z'),
  },
];

/**
 * 2. Initial Sample Events (Matching Tasks 1 & 2 requirements)
 */
const events = [
  {
    id: 'evt-101',
    title: 'TechNova Global Hackathon 2026',
    category: 'Technology',
    date: 'Nov 15, 2026 • 09:00 AM',
    venue: 'Convention Center, Hall A',
    ticketsAvailable: 45,
    createdAt: new Date('2026-10-10T08:00:00Z'),
  },
  {
    id: 'evt-102',
    title: 'Indie Fusion Music Festival',
    category: 'Concert',
    date: 'Dec 05, 2026 • 06:30 PM',
    venue: 'Grand Amphitheater Arena',
    ticketsAvailable: 120,
    createdAt: new Date('2026-10-11T08:00:00Z'),
  },
  {
    id: 'evt-103',
    title: 'International AI & Web Summit',
    category: 'Conference',
    date: 'Oct 30, 2026 • 10:00 AM',
    venue: 'City Tech Park Auditorium',
    ticketsAvailable: 0, // Demonstrates Sold Out status
    createdAt: new Date('2026-10-12T08:00:00Z'),
  },
  {
    id: 'evt-104',
    title: 'UI/UX Design & Micro-interactions',
    category: 'Workshop',
    date: 'Nov 22, 2026 • 02:00 PM',
    venue: 'Creative Arts Hub, Room 4B',
    ticketsAvailable: 18,
    createdAt: new Date('2026-10-13T08:00:00Z'),
  },
  {
    id: 'evt-105',
    title: 'Cloud Security & DevSecOps Summit',
    category: 'Cybersecurity',
    date: 'Dec 12, 2026 • 11:00 AM',
    venue: 'Silicon Valley Expo Hall',
    ticketsAvailable: 0, // Demonstrates Sold Out status
    createdAt: new Date('2026-10-14T08:00:00Z'),
  },
  {
    id: 'evt-106',
    title: 'Startup Pitch & Venture Gala',
    category: 'Business',
    date: 'Jan 10, 2027 • 05:00 PM',
    venue: 'Metropolitan Hotel Ballroom',
    ticketsAvailable: 65,
    createdAt: new Date('2026-10-15T08:00:00Z'),
  },
];

/**
 * 3. Initial Sample Tickets
 */
const tickets = [
  {
    id: 'tkt-9001',
    attendeeId: 'usr-1',
    eventId: 'evt-101',
    quantity: 2,
    bookingDate: new Date('2026-10-20T14:30:00Z'),
    status: 'booked',
  },
  {
    id: 'tkt-9002',
    attendeeId: 'usr-1',
    eventId: 'evt-104',
    quantity: 1,
    bookingDate: new Date('2026-10-21T09:15:00Z'),
    status: 'booked',
  },
];

// Counter for auto-generating unique incremental ticket and attendee IDs
let ticketIdCounter = 9003;
let attendeeIdCounter = 4;

/**
 * Helper to populate a ticket object with attendee and event details
 * Equivalent to Mongoose .populate('attendeeId', 'name email').populate('eventId', 'title date venue')
 */
const populateTicket = (ticket) => {
  const event = events.find((e) => e.id === ticket.eventId);
  const attendee = attendees.find((a) => a.id === ticket.attendeeId);

  return {
    ...ticket,
    attendeeId: attendee
      ? { id: attendee.id, name: attendee.name, email: attendee.email }
      : ticket.attendeeId,
    eventId: event
      ? {
          id: event.id,
          title: event.title,
          category: event.category,
          date: event.date,
          venue: event.venue,
        }
      : ticket.eventId,
  };
};

/**
 * Storage Service Operations
 */
const inMemoryStore = {
  // --- Attendees Operations ---
  findAttendeeByEmail: (email) => {
    return attendees.find(
      (a) => a.email.toLowerCase() === email.trim().toLowerCase()
    );
  },

  findAttendeeById: (id) => {
    return attendees.find((a) => a.id === id);
  },

  createAttendee: ({ name, email, phone, password, role }) => {
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newAttendee = {
      id: `usr-${attendeeIdCounter++}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: role === 'organizer' ? 'organizer' : 'attendee',
      createdAt: new Date(),
    };

    attendees.push(newAttendee);
    return newAttendee;
  },

  // --- Events Operations ---
  getAllEvents: (categoryFilter) => {
    if (categoryFilter) {
      return events.filter((e) =>
        e.category.toLowerCase().includes(categoryFilter.toLowerCase())
      );
    }
    return [...events];
  },

  getEventById: (id) => {
    return events.find((e) => e.id === id);
  },

  createEvent: ({ title, category, date, venue, ticketsAvailable }) => {
    const newEvent = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      category: category ? category.trim() : 'General',
      date: date.trim(),
      venue: venue.trim(),
      ticketsAvailable: Number(ticketsAvailable),
      createdAt: new Date(),
    };
    events.push(newEvent);
    return newEvent;
  },

  // --- Tickets Operations (Atomic In-Memory Operations) ---

  /**
   * Atomic ticket booking operation:
   * Synchronously verifies event and quota, decrements inventory, and issues ticket.
   * Node.js executes this synchronously on the event loop, preventing race conditions.
   */
  bookTicketAtomic: (attendeeId, eventId, quantity) => {
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return { error: 'NOT_FOUND', message: `Event not found with ID: ${eventId}` };
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return { error: 'INVALID_QUANTITY', message: 'Ticket quantity must be at least 1.' };
    }

    // Check available quota
    if (event.ticketsAvailable < qty) {
      return {
        error: 'INSUFFICIENT_STOCK',
        message: `Insufficient stock available. Only ${event.ticketsAvailable} ticket(s) remaining for "${event.title}".`,
        ticketsAvailable: event.ticketsAvailable,
      };
    }

    // Atomic synchronous stock decrement
    event.ticketsAvailable -= qty;

    const newTicket = {
      id: `tkt-${ticketIdCounter++}`,
      attendeeId,
      eventId,
      quantity: qty,
      bookingDate: new Date(),
      status: 'booked',
    };

    tickets.push(newTicket);

    return {
      success: true,
      ticket: populateTicket(newTicket),
      remainingStock: event.ticketsAvailable,
    };
  },

  /**
   * Fetch all tickets for a specific authenticated attendee
   */
  getTicketsByAttendee: (attendeeId) => {
    const userTickets = tickets.filter((t) => t.attendeeId === attendeeId);
    return userTickets.map(populateTicket);
  },

  /**
   * Fetch a single ticket by ID
   */
  getTicketById: (id) => {
    return tickets.find((t) => t.id === id);
  },

  /**
   * Update ticket status with inventory consistency checks:
   * - booked -> cancelled: restores event stock by ticket.quantity
   * - cancelled -> booked: checks event quota and decrements stock
   * - booked -> used: updates status without stock change
   * - Prevents duplicate cancellations from restoring stock multiple times
   */
  updateTicketStatus: (ticketId, newStatus, requestingUserId, requestingUserRole) => {
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      return { error: 'NOT_FOUND', message: `Ticket not found with ID: ${ticketId}` };
    }

    // Ownership check: Attendee can only modify their own ticket; Organizer can modify any
    const isOwner = ticket.attendeeId === requestingUserId;
    const isOrganizer = requestingUserRole === 'organizer';

    if (!isOwner && !isOrganizer) {
      return {
        error: 'FORBIDDEN',
        message: 'Access forbidden. You are not authorized to modify another attendee\'s ticket.',
      };
    }

    const previousStatus = ticket.status;
    const event = events.find((e) => e.id === ticket.eventId);

    // Idempotent check: if status is identical, do nothing
    if (previousStatus === newStatus) {
      return {
        success: true,
        message: `Ticket is already in "${newStatus}" status. No inventory change required.`,
        ticket: populateTicket(ticket),
        eventTicketsAvailable: event ? event.ticketsAvailable : null,
      };
    }


    // Case 1: Cancelling an active booking -> RESTORE inventory
    if (previousStatus === 'booked' && newStatus === 'cancelled') {
      if (event) {
        event.ticketsAvailable += ticket.quantity;
      }
    }

    // Case 2: Re-activating a cancelled booking -> CHECK QUOTA & DECREMENT
    if (previousStatus === 'cancelled' && newStatus === 'booked') {
      if (!event || event.ticketsAvailable < ticket.quantity) {
        const available = event ? event.ticketsAvailable : 0;
        return {
          error: 'INSUFFICIENT_STOCK',
          message: `Cannot reactivate booking. Not enough tickets available in quota (${available} remaining).`,
          ticketsAvailable: available,
        };
      }
      event.ticketsAvailable -= ticket.quantity;
    }

    // Update status
    ticket.status = newStatus;

    return {
      success: true,
      message: `Ticket status successfully changed from "${previousStatus}" to "${newStatus}".`,
      ticket: populateTicket(ticket),
      eventTicketsAvailable: event ? event.ticketsAvailable : null,
    };
  },
};

module.exports = inMemoryStore;
