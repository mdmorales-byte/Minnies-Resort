const mongoose = require('mongoose');
require('dotenv').config();

// Import Booking model
const Booking = require('./models/Booking');

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

// Add test booking
const addTestBooking = async () => {
  try {
    // Create a test booking
    const testBooking = new Booking({
      bookingId: 'MFR-' + Date.now(),
      guestName: 'hotdog',
      email: 'hotdognapula4@gmail.com',
      phone: '09620554534',
      checkIn: new Date('2025-09-21'),
      checkOut: new Date('2025-09-22'),
      guests: 15,
      accommodationType: 'day',
      addOns: [],
      totalAmount: 2500.00,
      status: 'pending',
      specialRequests: 'Test booking for demo'
    });

    await testBooking.save();
    console.log('✅ Test booking created successfully');
    console.log('📧 Guest:', testBooking.guestName);
    console.log('📅 Check-in:', testBooking.checkIn);
    console.log('💰 Amount:', testBooking.totalAmount);
    console.log('📋 Status:', testBooking.status);
    
  } catch (error) {
    console.error('❌ Error creating test booking:', error);
  }
};

// Main function
const main = async () => {
  console.log('📅 Adding Test Booking...');
  console.log('========================================');
  
  await connectDB();
  await addTestBooking();
  
  console.log('========================================');
  console.log('✅ Test booking added!');
  
  mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Failed to add test booking:', error);
  process.exit(1);
});
