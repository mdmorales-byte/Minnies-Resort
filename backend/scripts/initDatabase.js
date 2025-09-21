const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');

const initDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/minnies_farm_resort', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Create default admin users
    console.log('🔄 Creating default admin users...');

    // Check if super admin exists
    const existingSuperAdmin = await User.findOne({ username: 'superadmin' });
    if (!existingSuperAdmin) {
      const superAdmin = new User({
        username: 'superadmin',
        email: 'superadmin@minniesfarmresort.com',
        password: process.env.SUPER_ADMIN_PASSWORD || 'superadmin123',
        role: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        phone: '09666619229'
      });
      await superAdmin.save();
      console.log('✅ Super admin created');
    } else {
      console.log('ℹ️  Super admin already exists');
    }

    // Check if regular admin exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const admin = new User({
        username: 'admin',
        email: 'admin@minniesfarmresort.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        firstName: 'Resort',
        lastName: 'Admin',
        phone: '09666619229'
      });
      await admin.save();
      console.log('✅ Regular admin created');
    } else {
      console.log('ℹ️  Regular admin already exists');
    }

    // Create sample data for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Creating sample data for development...');

      // Sample bookings
      const sampleBookings = [
        {
          guestName: 'Juan Dela Cruz',
          email: 'juan@example.com',
          phone: '09123456789',
          checkIn: new Date('2024-09-25'),
          checkOut: new Date('2024-09-26'),
          guests: 4,
          accommodationType: 'overnight',
          addOns: ['karaoke'],
          totalAmount: 2500,
          status: 'confirmed',
          specialRequests: 'Please prepare extra towels'
        },
        {
          guestName: 'Maria Santos',
          email: 'maria@example.com',
          phone: '09987654321',
          checkIn: new Date('2024-09-28'),
          guests: 6,
          accommodationType: 'day',
          addOns: ['bbq_grill'],
          totalAmount: 1800,
          status: 'pending',
          specialRequests: 'Vegetarian BBQ options please'
        },
        {
          guestName: 'Pedro Garcia',
          email: 'pedro@example.com',
          phone: '09555666777',
          checkIn: new Date('2024-10-01'),
          checkOut: new Date('2024-10-02'),
          guests: 8,
          accommodationType: 'overnight',
          addOns: ['karaoke', 'extra_bedding'],
          totalAmount: 3200,
          status: 'confirmed'
        }
      ];

      for (const bookingData of sampleBookings) {
        const existingBooking = await Booking.findOne({ email: bookingData.email });
        if (!existingBooking) {
          const booking = new Booking(bookingData);
          await booking.save();
        }
      }

      // Sample contact messages
      const sampleContacts = [
        {
          name: 'Anna Rodriguez',
          email: 'anna@example.com',
          phone: '09111222333',
          subject: 'booking',
          message: 'Hi! I would like to inquire about availability for December 25-26. We are a group of 10 people.',
          priority: 'high'
        },
        {
          name: 'Carlos Mendoza',
          email: 'carlos@example.com',
          subject: 'information',
          message: 'What are your operating hours? Do you have parking available?',
          status: 'replied',
          adminResponse: 'We are open daily from 6:00 AM to 10:00 PM. Yes, we have free parking available for all guests.',
          respondedBy: 'admin',
          respondedAt: new Date()
        },
        {
          name: 'Lisa Chen',
          email: 'lisa@example.com',
          phone: '09444555666',
          subject: 'suggestion',
          message: 'The resort is beautiful! I suggest adding more vegetarian options to the menu.',
          status: 'resolved'
        }
      ];

      for (const contactData of sampleContacts) {
        const existingContact = await Contact.findOne({ email: contactData.email });
        if (!existingContact) {
          const contact = new Contact(contactData);
          await contact.save();
        }
      }

      console.log('✅ Sample data created');
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('\n📋 Default Admin Accounts:');
    console.log('Super Admin - Username: superadmin, Password: superadmin123');
    console.log('Regular Admin - Username: admin, Password: admin123');
    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run initialization
initDatabase();
