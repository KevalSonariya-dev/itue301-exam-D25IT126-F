const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// Built-in & third-party middleware
app.use(cors());
app.use(express.json());

// Root health-check / starter route
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'EventHub Backend API starter is running',
  });
});

// MongoDB connection setup
if (MONGO_URI) {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB Atlas successfully.');
    })
    .catch((err) => {
      console.error('MongoDB Atlas connection error:', err.message);
    });
} else {
  console.log('Notice: MONGO_URI is not set. Configure your .env file to connect to MongoDB Atlas.');
}

// Start HTTP server
app.listen(PORT, () => {
  console.log(`EventHub server running on port ${PORT}`);
});
