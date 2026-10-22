const tls = require('tls');
// Ensure TLS 1.2 compatibility across Node v22+ and lab network proxies
tls.DEFAULT_MAX_VERSION = 'TLSv1.2';

const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment variables reliably regardless of CWD
dotenv.config({ path: path.join(__dirname, '.env') });

const Event = require('./models/Event');
const Attendee = require('./models/Attendee');

const SAMPLE_EVENTS = [
  {
    title: 'TechNova Global Hackathon 2026',
    category: 'Technology',
    date: 'Nov 15, 2026 • 09:00 AM',
    venue: 'Convention Center, Hall A',
    ticketsAvailable: 45,
  },
  {
    title: 'Indie Fusion Music Festival',
    category: 'Concert',
    date: 'Dec 05, 2026 • 06:30 PM',
    venue: 'Grand Amphitheater Arena',
    ticketsAvailable: 120,
  },
  {
    title: 'International AI & Web Summit',
    category: 'Conference',
    date: 'Oct 30, 2026 • 10:00 AM',
    venue: 'City Tech Park Auditorium',
    ticketsAvailable: 0, // Demonstrates Sold Out status
  },
  {
    title: 'UI/UX Design & Micro-interactions',
    category: 'Workshop',
    date: 'Nov 22, 2026 • 02:00 PM',
    venue: 'Creative Arts Hub, Room 4B',
    ticketsAvailable: 18,
  },
  {
    title: 'Cloud Security & DevSecOps Summit',
    category: 'Cybersecurity',
    date: 'Dec 12, 2026 • 11:00 AM',
    venue: 'Silicon Valley Expo Hall',
    ticketsAvailable: 0, // Demonstrates Sold Out status
  },
  {
    title: 'Startup Pitch & Venture Gala',
    category: 'Business',
    date: 'Jan 10, 2027 • 05:00 PM',
    venue: 'Metropolitan Hotel Ballroom',
    ticketsAvailable: 65,
  },
];

const seedDatabase = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!uri) {
    console.error('Seed Error: MONGO_URI / MONGODB_URI not found in environment.');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('Connected to database.');

    // 1. Seed Sample Events idempotently using findOneAndUpdate with upsert
    console.log('\n--- Seeding Events ---');
    for (const eventData of SAMPLE_EVENTS) {
      const seeded = await Event.findOneAndUpdate(
        { title: eventData.title },
        eventData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[Event Synced] ${seeded.title} (${seeded.ticketsAvailable} tickets available)`);
    }

    // 2. Seed Default Attendees idempotently for viva testing
    console.log('\n--- Seeding Test Users ---');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Password123!', salt);

    const testUsers = [
      {
        name: 'Keval Sonariya',
        email: 'attendee@charusat.edu.in',
        phone: '+91 9876543210',
        password: defaultPasswordHash,
        role: 'attendee',
      },
      {
        name: 'Faculty Organizer',
        email: 'organizer@charusat.edu.in',
        phone: '+91 9876543211',
        password: defaultPasswordHash,
        role: 'organizer',
      },
    ];

    for (const userData of testUsers) {
      const user = await Attendee.findOneAndUpdate(
        { email: userData.email },
        userData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`[User Synced] ${user.name} (${user.email}) - Role: ${user.role}`);
    }

    console.log('\nDatabase seeding finished successfully!');
    console.log('Test Credentials:');
    console.log('  Attendee:  attendee@charusat.edu.in  / Password: Password123!');
    console.log('  Organizer: organizer@charusat.edu.in / Password: Password123!\n');

    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
