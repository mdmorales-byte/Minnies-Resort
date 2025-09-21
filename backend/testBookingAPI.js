const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBookingAPI() {
  try {
    console.log('🧪 Testing Booking API access...');
    
    // 1. Login first
    console.log('\n1. Logging in...');
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
    
    // 2. Test creating a booking first
    console.log('\n2. Creating a test booking...');
    const bookingData = {
      guest_name: 'Test Customer',
      guest_email: 'customer@example.com',
      guest_phone: '09123456789',
      accommodation_type: 'Standard Room',
      check_in_date: '2025-01-15',
      check_out_date: '2025-01-17',
      guests: 2,
      special_requests: 'Test booking for admin panel integration'
    };
    
    const createResponse = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData)
    });
    
    const createResult = await createResponse.json();
    
    if (createResult.success) {
      console.log('✅ Test booking created successfully');
    } else {
      console.log('ℹ️ Booking creation result:', createResult.message);
    }
    
    // 3. Test fetching bookings
    console.log('\n3. Fetching bookings...');
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
    
    // Show first few bookings
    if (bookingsResult.bookings.length > 0) {
      console.log('\n📋 Recent bookings:');
      bookingsResult.bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`${index + 1}. ${booking.guest_name} (${booking.guest_email}) - ${booking.accommodation_type} - Status: ${booking.status}`);
      });
    } else {
      console.log('\n📋 No bookings found in database');
    }
    
    console.log('\n🎉 Booking API is working correctly!');
    console.log('\n💡 Frontend should now be able to fetch bookings after login.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBookingAPI();
