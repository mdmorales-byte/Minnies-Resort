const mongoose = require('mongoose');
require('dotenv').config();

// Set default environment variables for development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'minnies_farm_resort_super_secret_jwt_key_for_development_only_2024';
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/minnies_farm_resort';
}

// Import Booking model
const Booking = require('./models/Booking');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  createTestBooking();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function createTestBooking() {
  try {
    console.log('\n🏨 Creating test booking...');
    
    // Check if test bookings already exist
    const existingBookings = await Booking.find({});
    console.log(`📋 Found ${existingBookings.length} existing bookings`);
    
    // Create a test booking
    const testBooking = new Booking({
      guestName: 'Test Customer',
      email: 'customer@example.com',
      phone: '09123456789',
      checkIn: new Date('2025-01-15'),
      checkOut: new Date('2025-01-17'),
      guests: 2,
      accommodationType: 'overnight',
      addOns: ['karaoke'],
      totalAmount: 1500,
      specialRequests: 'Test booking for admin panel integration',
      status: 'pending'
    });

    await testBooking.save();
    console.log('✅ Test booking created successfully!');
    
    // Show all bookings
    const allBookings = await Booking.find({}).sort({ createdAt: -1 });
    console.log(`\n📊 Total bookings in database: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      console.log('\n📋 Recent bookings:');
      allBookings.slice(0, 5).forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.guestName} (${booking.email}) - ${booking.accommodationType} - Status: ${booking.status}`);
      });
    }
    
    console.log('\n🎉 Test booking created! Admin panel should now show bookings.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test booking:', error);
    process.exit(1);
  }
}
