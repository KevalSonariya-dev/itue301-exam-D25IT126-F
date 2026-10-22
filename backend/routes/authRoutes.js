const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const inMemoryStore = require('../data/inMemoryStore');
const authGuard = require('../middleware/authGuard');

const JWT_SECRET = process.env.JWT_SECRET || 'eventhub_jwt_secret_key_itue301_d25it126_exam';

/**
 * Generate signed JWT Token
 * Payload includes attendee ID, email, name, and role.
 */
const generateToken = (attendee) => {
  return jwt.sign(
    {
      id: attendee.id,
      email: attendee.email,
      name: attendee.name,
      role: attendee.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate attendee & return signed Bearer token
 * @access  Public
 */
router.post('/login', (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // 2. Find attendee in temporary in-memory store
    const attendee = inMemoryStore.findAttendeeByEmail(email);
    if (!attendee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No account found with this email.',
      });
    }

    // 3. Compare password with bcrypt hash
    const isMatch = bcrypt.compareSync(password, attendee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password does not match.',
      });
    }

    // 4. Generate signed token
    const token = generateToken(attendee);

    // 5. Return success (never exposing password hash)
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      attendee: {
        id: attendee.id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        role: attendee.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new attendee (Development & Viva helper)
 * @access  Public
 */
router.post('/register', (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    // Check duplicate email
    const existing = inMemoryStore.findAttendeeByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `An attendee with email "${email}" already exists.`,
      });
    }

    const attendee = inMemoryStore.createAttendee({
      name,
      email,
      phone,
      password,
      role,
    });

    const token = generateToken(attendee);

    return res.status(201).json({
      success: true,
      message: 'Attendee registered successfully.',
      token,
      attendee: {
        id: attendee.id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        role: attendee.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Fetch authenticated attendee profile
 * @access  Protected
 */
router.get('/me', authGuard, (req, res, next) => {
  try {
    const attendee = inMemoryStore.findAttendeeById(req.user.id);
    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      attendee: {
        id: attendee.id,
        name: attendee.name,
        email: attendee.email,
        phone: attendee.phone,
        role: attendee.role,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
