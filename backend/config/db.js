const tls = require('tls');
// Ensure TLS 1.2 compatibility across Node v22+ and lab network proxies
tls.DEFAULT_MAX_VERSION = 'TLSv1.2';

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas cluster
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('CRITICAL ERROR: Neither MONGO_URI nor MONGODB_URI is set in environment variables (.env).');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
