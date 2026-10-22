const express = require('express');
const router = express.Router();
const inMemoryStore = require('../data/inMemoryStore');
const authGuard = require('../middleware/authGuard');
const adminGuard = require('../middleware/adminGuard');

// Apply authGuard and adminGuard to all /api/v1/admin/* routes
router.use(authGuard);
router.use(adminGuard);

/**
 * ============================================================================
 * 1. ADMIN DASHBOARD STATS
 * ============================================================================
 * @route   GET /api/v1/admin/stats
 * @desc    Fetch live dashboard summary statistics
 * @access  Protected (Admin only)
 */
router.get('/stats', (req, res, next) => {
  try {
    const stats = inMemoryStore.getDashboardStats();
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ============================================================================
 * 2. ADMIN EVENT MANAGEMENT
 * ============================================================================
 */

/**
 * @route   GET /api/v1/admin/events
 * @desc    List all events with full metrics
 * @access  Protected (Admin only)
 */
router.get('/events', (req, res, next) => {
  try {
    const eventsList = inMemoryStore.getAllEvents();
    return res.status(200).json({
      success: true,
      count: eventsList.length,
      data: eventsList,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/admin/events
 * @desc    Create a new event listing
 * @access  Protected (Admin only)
 */
router.post('/events', (req, res, next) => {
  try {
    const { title, category, date, venue, totalTickets } = req.body;

    if (!title || !date || !venue) {
      return res.status(400).json({
        success: false,
        message: 'Event title, date, and venue are required fields.',
      });
    }

    const capacity = Number(totalTickets);
    if (isNaN(capacity) || capacity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Total ticket capacity must be a positive integer of at least 1.',
      });
    }

    const newEvent = inMemoryStore.createEvent({
      title,
      category,
      date,
      venue,
      totalTickets: capacity,
      ticketsAvailable: capacity,
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: newEvent,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/v1/admin/events/:id
 * @desc    Update event details and preserve inventory invariants
 * @access  Protected (Admin only)
 */
router.put('/events/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, category, date, venue, totalTickets } = req.body;

    const result = inMemoryStore.adminUpdateEvent(id, {
      title,
      category,
      date,
      venue,
      totalTickets,
    });

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    if (result.error === 'INVALID_CAPACITY' || result.error === 'CAPACITY_TOO_LOW') {
      return res.status(400).json({
        success: false,
        message: result.message,
        ticketsBooked: result.ticketsBooked,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: result.event,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/v1/admin/events/:id
 * @desc    Safely delete event only if no active bookings exist
 * @access  Protected (Admin only)
 */
router.delete('/events/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const result = inMemoryStore.adminDeleteEvent(id);

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    if (result.error === 'HAS_ACTIVE_BOOKINGS') {
      return res.status(400).json({
        success: false,
        message: result.message,
        activeBookingsCount: result.activeBookingsCount,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ============================================================================
 * 3. ADMIN BOOKING MANAGEMENT
 * ============================================================================
 */

/**
 * @route   GET /api/v1/admin/bookings
 * @desc    Fetch all bookings with optional search and filters
 * @access  Protected (Admin only)
 */
router.get('/bookings', (req, res, next) => {
  try {
    const { status, search, eventId } = req.query;
    const bookings = inMemoryStore.adminGetAllBookings({ status, search, eventId });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/v1/admin/bookings/:id/status
 * @desc    Update booking status (booked, cancelled, used) with inventory adjustments
 * @access  Protected (Admin only)
 */
router.patch('/bookings/:id/status', (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['booked', 'cancelled', 'used'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    const result = inMemoryStore.updateTicketStatus(
      id,
      status,
      req.user.id,
      req.user.role // 'admin'
    );

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    if (result.error === 'INVALID_TRANSITION' || result.error === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.ticket,
      eventTicketsAvailable: result.eventTicketsAvailable,
      ticketsBooked: result.ticketsBooked,
      totalTickets: result.totalTickets,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ============================================================================
 * 4. ADMIN ATTENDEE MANAGEMENT
 * ============================================================================
 */

/**
 * @route   GET /api/v1/admin/attendees
 * @desc    Fetch all attendees with booking counts (passwords stripped)
 * @access  Protected (Admin only)
 */
router.get('/attendees', (req, res, next) => {
  try {
    const { search } = req.query;
    const attendeesList = inMemoryStore.adminGetAllAttendees(search);

    return res.status(200).json({
      success: true,
      count: attendeesList.length,
      data: attendeesList,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/admin/attendees/:id
 * @desc    Fetch single attendee profile and their complete booking history
 * @access  Protected (Admin only)
 */
router.get('/attendees/:id', (req, res, next) => {
  try {
    const attendeeData = inMemoryStore.adminGetAttendeeById(req.params.id);

    if (!attendeeData) {
      return res.status(404).json({
        success: false,
        message: `Attendee not found with ID: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: attendeeData,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
