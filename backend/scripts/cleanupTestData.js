const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
require('dotenv').config();

const cleanupTestData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/minnies_farm_resort', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    console.log('🧹 Cleaning up test data...');

    // Remove test bookings (sample data that was added during development)
    const testBookingPatterns = [
      'Juan Dela Cruz',
      'Maria Santos', 
      'Pedro Garcia',
      'Ana Rodriguez',
      'Carlos Miguel',
      'Peñafrancia Festival' // Remove the test booking I made
    ];

    const testEmails = [
      'pedro@example.com',
      'mick@gmail.com' // Remove test email
    ];

    // Delete test bookings
    for (const guestName of testBookingPatterns) {
      const result = await Booking.deleteMany({ guestName: guestName });
      if (result.deletedCount > 0) {
        console.log(`🗑️  Removed ${result.deletedCount} test booking(s) for: ${guestName}`);
      }
    }

    // Delete bookings with test emails
    for (const email of testEmails) {
      const result = await Booking.deleteMany({ email: email });
      if (result.deletedCount > 0) {
        console.log(`🗑️  Removed ${result.deletedCount} test booking(s) with email: ${email}`);
      }
    }

    // Remove test contact messages
    const testContactNames = [
      'Test User',
      'mick' // Remove test contact
    ];

    for (const name of testContactNames) {
      const result = await Contact.deleteMany({ name: name });
      if (result.deletedCount > 0) {
        console.log(`🗑️  Removed ${result.deletedCount} test contact message(s) from: ${name}`);
      }
    }

    // Show remaining data
    const remainingBookings = await Booking.countDocuments();
    const remainingContacts = await Contact.countDocuments();

    console.log('\n📊 Database Status After Cleanup:');
    console.log(`📋 Bookings: ${remainingBookings}`);
    console.log(`📧 Contact Messages: ${remainingContacts}`);

    if (remainingBookings > 0) {
      console.log('\n✅ Remaining Bookings:');
      const bookings = await Booking.find({}).select('bookingId guestName email checkIn status');
      bookings.forEach(booking => {
        console.log(`   📝 ${booking.bookingId} - ${booking.guestName} (${booking.email})`);
      });
    }

    if (remainingContacts > 0) {
      console.log('\n✅ Remaining Contact Messages:');
      const contacts = await Contact.find({}).select('name email subject createdAt');
      contacts.forEach(contact => {
        console.log(`   📧 ${contact.name} - ${contact.subject} (${new Date(contact.createdAt).toLocaleDateString()})`);
      });
    }

    console.log('\n🎉 Database cleanup completed successfully!');
    console.log('💡 Your database now contains only real customer data.');

  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  } finally {
    console.log('🔌 Closing database connection...');
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the cleanup
cleanupTestData();
