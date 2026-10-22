const express = require('express');
const router = express.Router();
const inMemoryStore = require('../data/inMemoryStore');
const authGuard = require('../middleware/authGuard');

/**
 * @route   GET /api/v1/events
 * @desc    Fetch all available events
 * @access  Public
 */
router.get('/', (req, res, next) => {
  try {
    const { category } = req.query;
    const eventsList = inMemoryStore.getAllEvents(category);

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
 * @route   GET /api/v1/events/:id
 * @desc    Fetch single event details by ID
 * @access  Public
 */
router.get('/:id', (req, res, next) => {
  try {
    const event = inMemoryStore.getEventById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: `Event not found with ID: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/events
 * @desc    Create a new event listing (Organizer only)
 * @access  Protected (Requires Organizer role)
 */
router.post('/', authGuard, (req, res, next) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. Only organizers can publish new event listings.',
      });
    }

    const { title, category, date, venue, ticketsAvailable } = req.body;

    if (!title || !date || !venue || ticketsAvailable === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, date, venue, and ticketsAvailable.',
      });
    }

    const newEvent = inMemoryStore.createEvent({
      title,
      category,
      date,
      venue,
      ticketsAvailable,
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

module.exports = router;
