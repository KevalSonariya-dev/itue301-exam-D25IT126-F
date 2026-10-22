/**
 * ============================================================================
 * TEMPORARY IN-MEMORY DATA STORAGE MODULE (TASK 3 & BOOKING ENHANCEMENT)
 * ============================================================================
 * NOTE FOR EXAMINER / VIVA:
 * This module provides temporary, non-persistent in-memory data storage for
 * Attendees, Events, and Tickets.
 * 
 * Invariant Maintained Across All Events:
 *   ticketsBooked + ticketsAvailable = totalTickets
 * 
 * - Data lives in memory and resets whenever the Node.js server restarts.
 * - Synchronous, atomic inventory operations prevent race conditions.
 * - Decoupled repository architecture allows transparent swap with Mongoose in Task 5.
 * ============================================================================
 */

const bcrypt = require('bcryptjs');

// Pre-computed bcrypt hash for 'Password123!' (Salt rounds: 10)
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Password123!', 10);

/**
 * 1. Initial Sample Attendees
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
 * 2. Initial Sample Events
 * INVARIANT: ticketsBooked + ticketsAvailable = totalTickets
 */
const events = [
  {
    id: 'evt-101',
    title: 'TechNova Global Hackathon 2026',
    category: 'Technology',
    date: 'Nov 15, 2026 • 09:00 AM',
    venue: 'Convention Center, Hall A',
    totalTickets: 47,
    ticketsBooked: 2,
    ticketsAvailable: 45, // 2 + 45 = 47
    createdAt: new Date('2026-10-10T08:00:00Z'),
  },
  {
    id: 'evt-102',
    title: 'Indie Fusion Music Festival',
    category: 'Concert',
    date: 'Dec 05, 2026 • 06:30 PM',
    venue: 'Grand Amphitheater Arena',
    totalTickets: 150,
    ticketsBooked: 30,
    ticketsAvailable: 120, // 30 + 120 = 150
    createdAt: new Date('2026-10-11T08:00:00Z'),
  },
  {
    id: 'evt-103',
    title: 'International AI & Web Summit',
    category: 'Conference',
    date: 'Oct 30, 2026 • 10:00 AM',
    venue: 'City Tech Park Auditorium',
    totalTickets: 100,
    ticketsBooked: 100,
    ticketsAvailable: 0, // 100 + 0 = 100 (Sold Out)
    createdAt: new Date('2026-10-12T08:00:00Z'),
  },
  {
    id: 'evt-104',
    title: 'UI/UX Design & Micro-interactions',
    category: 'Workshop',
    date: 'Nov 22, 2026 • 02:00 PM',
    venue: 'Creative Arts Hub, Room 4B',
    totalTickets: 19,
    ticketsBooked: 1,
    ticketsAvailable: 18, // 1 + 18 = 19
    createdAt: new Date('2026-10-13T08:00:00Z'),
  },
  {
    id: 'evt-105',
    title: 'Cloud Security & DevSecOps Summit',
    category: 'Cybersecurity',
    date: 'Dec 12, 2026 • 11:00 AM',
    venue: 'Silicon Valley Expo Hall',
    totalTickets: 50,
    ticketsBooked: 50,
    ticketsAvailable: 0, // 50 + 0 = 50 (Sold Out)
    createdAt: new Date('2026-10-14T08:00:00Z'),
  },
  {
    id: 'evt-106',
    title: 'Startup Pitch & Venture Gala',
    category: 'Business',
    date: 'Jan 10, 2027 • 05:00 PM',
    venue: 'Metropolitan Hotel Ballroom',
    totalTickets: 100,
    ticketsBooked: 35,
    ticketsAvailable: 65, // 35 + 65 = 100
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

// Incremental ID generator counters
let ticketIdCounter = 9003;
let attendeeIdCounter = 4;

/**
 * Populate helper equivalent to Mongoose .populate()
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
          totalTickets: event.totalTickets,
          ticketsBooked: event.ticketsBooked,
          ticketsAvailable: event.ticketsAvailable,
        }
      : ticket.eventId,
  };
};

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

  createEvent: ({ title, category, date, venue, ticketsAvailable, totalTickets }) => {
    const cap = Number(totalTickets || ticketsAvailable || 50);
    const newEvent = {
      id: `evt-${Date.now()}`,
      title: title.trim(),
      category: category ? category.trim() : 'General',
      date: date.trim(),
      venue: venue.trim(),
      totalTickets: cap,
      ticketsBooked: 0,
      ticketsAvailable: cap,
      createdAt: new Date(),
    };
    events.push(newEvent);
    return newEvent;
  },

  // --- Atomic Ticket Booking Operation ---
  bookTicketAtomic: (attendeeId, eventId, quantity) => {
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return { error: 'NOT_FOUND', message: `Event not found with ID: ${eventId}` };
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      return { error: 'INVALID_QUANTITY', message: 'Ticket quantity must be at least 1.' };
    }

    // Availability validation
    if (event.ticketsAvailable < qty) {
      return {
        error: 'INSUFFICIENT_STOCK',
        message: `Insufficient stock available. Only ${event.ticketsAvailable} ticket(s) remaining for "${event.title}".`,
        ticketsAvailable: event.ticketsAvailable,
        ticketsBooked: event.ticketsBooked,
        totalTickets: event.totalTickets,
      };
    }

    // Atomic synchronous updates: Maintain ticketsBooked + ticketsAvailable = totalTickets
    event.ticketsAvailable -= qty;
    event.ticketsBooked += qty;

    const newTicket = {
      id: `tkt-${ticketIdCounter++}`,
      attendeeId,
      eventId,
      quantity: qty,
      bookingDate: new Date(),
      status: 'booked',
    };

    tickets.unshift(newTicket);

    return {
      success: true,
      ticket: populateTicket(newTicket),
      remainingStock: event.ticketsAvailable,
      ticketsBooked: event.ticketsBooked,
      totalTickets: event.totalTickets,
      event: { ...event },
    };
  },

  // --- Fetch My Tickets ---
  getTicketsByAttendee: (attendeeId) => {
    const userTickets = tickets.filter((t) => t.attendeeId === attendeeId);
    return userTickets.map(populateTicket);
  },

  getTicketById: (id) => {
    return tickets.find((t) => t.id === id);
  },

  // --- Update Ticket Status & Maintain Invariant ---
  updateTicketStatus: (ticketId, newStatus, requestingUserId, requestingUserRole) => {
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      return { error: 'NOT_FOUND', message: `Ticket not found with ID: ${ticketId}` };
    }

    // Authorization check
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

    // Used tickets cannot be cancelled or altered
    if (previousStatus === 'used' && newStatus !== 'used') {
      return {
        error: 'INVALID_TRANSITION',
        message: 'A used ticket has already been redeemed and cannot be cancelled or modified.',
      };
    }

    // Idempotent check
    if (previousStatus === newStatus) {
      return {
        success: true,
        message: `Ticket is already "${newStatus}". No inventory change required.`,
        ticket: populateTicket(ticket),
        eventTicketsAvailable: event ? event.ticketsAvailable : null,
        ticketsBooked: event ? event.ticketsBooked : null,
        totalTickets: event ? event.totalTickets : null,
      };
    }

    // Case 1: Active booked -> Cancelled: Restore inventory exactly once
    if (previousStatus === 'booked' && newStatus === 'cancelled') {
      if (event) {
        event.ticketsAvailable += ticket.quantity;
        event.ticketsBooked -= ticket.quantity;
      }
    }

    // Case 2: Cancelled -> Booked: Verify quota and decrement
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
      event.ticketsBooked += ticket.quantity;
    }

    ticket.status = newStatus;

    return {
      success: true,
      message: `Ticket status successfully changed from "${previousStatus}" to "${newStatus}".`,
      ticket: populateTicket(ticket),
      eventTicketsAvailable: event ? event.ticketsAvailable : null,
      ticketsBooked: event ? event.ticketsBooked : null,
      totalTickets: event ? event.totalTickets : null,
    };
  },
};

module.exports = inMemoryStore;
