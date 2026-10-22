const express = require('express');
const router = express.Router();
const inMemoryStore = require('../data/inMemoryStore');
const authGuard = require('../middleware/authGuard');

/**
 * @route   POST /api/v1/tickets
 * @desc    Book ticket(s) with atomic in-memory inventory decrement to prevent overselling
 * @access  Protected (Requires Bearer token)
 */
router.post('/', authGuard, (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;

    // 1. Validate eventId
    if (!eventId || typeof eventId !== 'string' || !eventId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid eventId string is required to book a ticket.',
      });
    }

    // 2. Validate quantity: must be an integer and >= 1
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Ticket quantity must be a positive whole integer (at least 1).',
      });
    }

    // 3. Perform atomic booking and inventory decrement
    const result = inMemoryStore.bookTicketAtomic(req.user.id, eventId.trim(), qty);

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    if (result.error === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        success: false,
        message: result.message,
        ticketsAvailable: result.ticketsAvailable,
      });
    }

    if (result.error) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Ticket booked successfully.',
      data: result.ticket,
      remainingEventStock: result.remainingStock,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/tickets/my
 * @desc    Fetch only the authenticated attendee's booked tickets (populated with event & attendee details)
 * @access  Protected (Requires Bearer token)
 */
router.get('/my', authGuard, (req, res, next) => {
  try {
    const userTickets = inMemoryStore.getTicketsByAttendee(req.user.id);

    return res.status(200).json({
      success: true,
      count: userTickets.length,
      data: userTickets,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/v1/tickets/:id/status
 * @desc    Update ticket status (booked, cancelled, used) with inventory consistency
 * @access  Protected (Requires Bearer token)
 */
router.patch('/:id/status', authGuard, (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Validate ID
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID parameter is required.',
      });
    }

    // 2. Validate status: only booked, cancelled, and used
    const allowedStatuses = ['booked', 'cancelled', 'used'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed values: ${allowedStatuses.join(', ')}`,
      });
    }

    // 3. Update status in in-memory store
    const result = inMemoryStore.updateTicketStatus(
      id,
      status,
      req.user.id,
      req.user.role
    );

    if (result.error === 'NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    if (result.error === 'FORBIDDEN') {
      return res.status(403).json({
        success: false,
        message: result.message,
      });
    }

    if (result.error === 'INSUFFICIENT_STOCK') {
      return res.status(400).json({
        success: false,
        message: result.message,
        ticketsAvailable: result.ticketsAvailable,
      });
    }

    if (result.error) {
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
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
