const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 1. Load environment variables reliably from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// 2. Import Middleware
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// 4. Import Route Handlers (Using decoupled in-memory store for Task 3)
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 4. Built-in & CORS Middleware configured for React Vite frontend
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Global Request Logger Middleware: [METHOD] [PATH] [TIMESTAMP]
app.use(requestLogger);

// 6. Root Health-Check & API Documentation Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EventHub REST API is operational (Task 3: In-Memory Phase)',
    version: '1.0.0',
    storageMode: 'Temporary In-Memory Store (Non-Persistent, resets on server restart)',
    endpoints: {
      auth: {
        login: 'POST /api/v1/auth/login (Public)',
        register: 'POST /api/v1/auth/register (Public)',
        profile: 'GET /api/v1/auth/me (Protected)',
      },
      events: {
        listAll: 'GET /api/v1/events (Public)',
        getOne: 'GET /api/v1/events/:id (Public)',
      },
      tickets: {
        book: 'POST /api/v1/tickets (Protected)',
        myTickets: 'GET /api/v1/tickets/my (Protected)',
        updateStatus: 'PATCH /api/v1/tickets/:id/status (Protected)',
      },
    },
    demoCredentials: {
      attendee: 'attendee@charusat.edu.in / Password123!',
      organizer: 'organizer@charusat.edu.in / Password123!',
    },
  });
});

// 7. Mount API Routes under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/admin', adminRoutes);

// 8. 404 Route Handler for unknown endpoints
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`,
  });
});

// 9. Global Structured JSON Error Handler (Must be registered last)
app.use(errorHandler);

// 10. Start Server only when executed directly (not when required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`EventHub Express REST API running on port ${PORT}`);
    console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`Storage Mode: In-Memory (Task 3 Standalone Phase)`);
    console.log(`====================================================`);
  });
}

module.exports = app;
