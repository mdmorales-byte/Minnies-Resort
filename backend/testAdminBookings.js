const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAdminBookings() {
  try {
    console.log('🧪 Testing Admin Bookings API...');
    
    // 1. Login first
    console.log('\n1. Logging in as super admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'superadmin@minniesfarmresort.com',
        password: 'superadmin123'
      })
    });
    
    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.message);
      return;
    }
    
    console.log('✅ Login successful');
    const token = loginResult.token;
    
    // 2. Test fetching bookings with admin token
    console.log('\n2. Fetching bookings with admin token...');
    const bookingsResponse = await fetch('http://localhost:5000/api/bookings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const bookingsResult = await bookingsResponse.json();
    
    if (!bookingsResult.success) {
      console.error('❌ Failed to fetch bookings:', bookingsResult.message);
      return;
    }
    
    console.log('✅ Successfully fetched bookings');
    console.log(`🏨 Found ${bookingsResult.bookings.length} bookings`);
    
    // Show bookings
    if (bookingsResult.bookings.length > 0) {
      console.log('\n📋 Recent bookings:');
      bookingsResult.bookings.slice(0, 5).forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.guestName} (${booking.email})`);
        console.log(`   - ${booking.accommodationType} accommodation`);
        console.log(`   - ${booking.guests} guests`);
        console.log(`   - Check-in: ${booking.checkIn}`);
        console.log(`   - Status: ${booking.status}`);
        console.log(`   - Total: ₱${booking.totalAmount}`);
        console.log('');
      });
    }
    
    console.log('🎉 Admin Bookings API is working correctly!');
    console.log('\n💡 Frontend admin panel should now be able to fetch and display all bookings.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminBookings();
