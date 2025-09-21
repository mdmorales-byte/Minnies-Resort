const fetch = require('node-fetch');

const testAdminAccess = async () => {
  try {
    console.log('🧪 Testing Regular Admin Access...');
    console.log('========================================');
    
    // Step 1: Login as regular admin
    console.log('1. Logging in as regular admin...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin@minniesfarmresort.com',
        password: 'admin123'
      })
    });

    const loginResult = await loginResponse.json();
    
    if (!loginResult.success) {
      console.error('❌ Login failed:', loginResult.message);
      return;
    }
    
    console.log('✅ Login successful');
    console.log('👤 User:', loginResult.user.email);
    console.log('🔑 Role:', loginResult.user.role);
    
    const token = loginResult.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Step 2: Test dashboard access
    console.log('\n2. Testing dashboard access...');
    const dashboardResponse = await fetch('http://localhost:5000/api/admin/dashboard', {
      headers
    });
    
    const dashboardResult = await dashboardResponse.json();
    
    if (dashboardResponse.ok && dashboardResult.success) {
      console.log('✅ Dashboard access successful');
      console.log('📊 Stats:', dashboardResult.stats);
    } else {
      console.error('❌ Dashboard access failed:', dashboardResult.message);
    }

    // Step 3: Test bookings access
    console.log('\n3. Testing bookings access...');
    const bookingsResponse = await fetch('http://localhost:5000/api/bookings', {
      headers
    });
    
    const bookingsResult = await bookingsResponse.json();
    
    if (bookingsResponse.ok && bookingsResult.success) {
      console.log('✅ Bookings access successful');
      console.log('📅 Bookings count:', bookingsResult.bookings?.length || 0);
    } else {
      console.error('❌ Bookings access failed:', bookingsResult.message);
    }

    // Step 4: Test contacts access
    console.log('\n4. Testing contacts access...');
    const contactsResponse = await fetch('http://localhost:5000/api/contacts', {
      headers
    });
    
    const contactsResult = await contactsResponse.json();
    
    if (contactsResponse.ok && contactsResult.success) {
      console.log('✅ Contacts access successful');
      console.log('💬 Contacts count:', contactsResult.contacts?.length || 0);
    } else {
      console.error('❌ Contacts access failed:', contactsResult.message);
    }

    // Step 5: Test user management access (should fail)
    console.log('\n5. Testing user management access (should fail)...');
    const usersResponse = await fetch('http://localhost:5000/api/users', {
      headers
    });
    
    const usersResult = await usersResponse.json();
    
    if (usersResponse.ok && usersResult.success) {
      console.log('⚠️ User management access successful (unexpected)');
    } else {
      console.log('✅ User management access properly restricted');
      console.log('🚫 Message:', usersResult.message);
    }

    console.log('\n========================================');
    console.log('🎯 Admin access test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testAdminAccess();
