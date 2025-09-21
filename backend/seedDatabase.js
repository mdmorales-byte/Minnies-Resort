const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Booking = require('./models/Booking');
const Contact = require('./models/Contact');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/minnies_farm_resort', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Seed admin users
const seedUsers = async () => {
  try {
    // Clear existing users and recreate them
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    const existingUsers = await User.find({});
    if (existingUsers.length > 0) {
      console.log('👤 Users already exist, skipping user seeding');
      return;
    }

    // Create admin users
    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@minniesfarmresort.com',
        password: await bcrypt.hash('superadmin123', 12),
        role: 'superadmin',
        status: 'active'
      },
      {
        name: 'Admin User',
        email: 'admin@minniesfarmresort.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        status: 'active'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Admin users created successfully');
    console.log('📧 Super Admin: superadmin@minniesfarmresort.com / superadmin123');
    console.log('📧 Admin: admin@minniesfarmresort.com / admin123');
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

// Seed sample bookings
const seedBookings = async () => {
  try {
    const existingBookings = await Booking.find({});
    if (existingBookings.length > 0) {
      console.log('📅 Bookings already exist, skipping booking seeding');
      return;
    }

    const bookings = [
      {
        bookingId: 'MFR-' + Date.now() + '-001',
        guestName: 'Juan Dela Cruz',
        email: 'juan.delacruz@gmail.com',
        phone: '09123456789',
        checkIn: new Date('2024-09-25'),
        checkOut: new Date('2024-09-25'),
        guests: 4,
        accommodationType: 'day',
        addOns: [],
        totalAmount: 900,
        status: 'confirmed',
        specialRequests: 'Need extra chairs for elderly guests'
      },
      {
        bookingId: 'MFR-' + Date.now() + '-002',
        guestName: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '09987654321',
        checkIn: new Date('2024-09-28'),
        checkOut: new Date('2024-09-29'),
        guests: 6,
        accommodationType: 'overnight',
        addOns: ['karaoke'],
        totalAmount: 2100,
        status: 'pending',
        specialRequests: 'Vegetarian meals preferred'
      }
    ];

    await Booking.insertMany(bookings);
    console.log('✅ Sample bookings created successfully');
  } catch (error) {
    console.error('❌ Error seeding bookings:', error);
  }
};

// Seed sample contact messages
const seedContacts = async () => {
  try {
    const existingContacts = await Contact.find({});
    if (existingContacts.length > 0) {
      console.log('📧 Contact messages already exist, skipping contact seeding');
      return;
    }

    const contacts = [
      {
        name: 'Pedro Garcia',
        email: 'pedro.garcia@hotmail.com',
        phone: '09555123456',
        subject: 'Event Booking Inquiry',
        message: 'Good day! We are planning a family reunion and would like to book your facility for 50 people. Please let me know the rates and availability.',
        status: 'new'
      },
      {
        name: 'Ana Rodriguez',
        email: 'ana.rodriguez@yahoo.com',
        phone: '09777888999',
        subject: 'Feedback',
        message: 'We had a wonderful stay at your resort last month. The staff was very accommodating and the facilities were clean. Thank you!',
        status: 'replied'
      }
    ];

    await Contact.insertMany(contacts);
    console.log('✅ Sample contact messages created successfully');
  } catch (error) {
    console.error('❌ Error seeding contacts:', error);
  }
};

// Main seeding function
const seedDatabase = async () => {
  console.log('🌱 Starting database seeding...');
  console.log('========================================');
  
  await connectDB();
  await seedUsers();
  await seedBookings();
  await seedContacts();
  
  console.log('========================================');
  console.log('✅ Database seeding completed!');
  console.log('🚀 Your resort system is ready to use!');
  
  mongoose.connection.close();
  process.exit(0);
};

// Run the seeding
seedDatabase().catch(error => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
