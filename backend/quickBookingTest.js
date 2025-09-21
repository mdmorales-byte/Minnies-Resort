const mongoose = require('mongoose');
require('dotenv').config();

// Set default environment variables for development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'minnies_farm_resort_super_secret_jwt_key_for_development_only_2024';
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/minnies_farm_resort';
}

// Import models
const Booking = require('./models/Booking');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  checkBookings();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function checkBookings() {
  try {
    console.log('\n📊 Checking booking system status...');
    
    // Check existing bookings
    const bookings = await Booking.find({}).sort({ createdAt: -1 });
    console.log(`📋 Found ${bookings.length} bookings in database`);
    
    if (bookings.length > 0) {
      console.log('\n🏨 Recent bookings:');
      bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.guestName} - ${booking.accommodationType} - Status: ${booking.status}`);
        console.log(`   Email: ${booking.email}, Amount: ₱${booking.totalAmount}`);
        console.log(`   Check-in: ${booking.checkIn}, Guests: ${booking.guests}`);
        console.log('');
      });
    }
    
    // Check admin users
    const adminUsers = await User.find({});
    console.log(`👥 Found ${adminUsers.length} admin users`);
    
    console.log('\n✅ System Status:');
    console.log(`📧 Bookings: ${bookings.length} records`);
    console.log(`👤 Admin Users: ${adminUsers.length} users`);
    console.log('🔗 API Endpoints: /api/bookings (GET/POST)');
    console.log('🔐 Authentication: JWT tokens configured');
    
    console.log('\n💡 Frontend should now be able to:');
    console.log('   1. Submit bookings via /book page');
    console.log('   2. View bookings in admin panel at /admin/bookings');
    console.log('   3. Manage booking status (pending → confirmed → completed)');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking bookings:', error);
    process.exit(1);
  }
}
