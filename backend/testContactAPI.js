const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testContactAPI() {
  try {
    console.log('🧪 Testing Contact API access...');
    
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
    
    // 2. Test fetching contacts
    console.log('\n2. Fetching contacts...');
    const contactsResponse = await fetch('http://localhost:5000/api/contacts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const contactsResult = await contactsResponse.json();
    
    if (!contactsResult.success) {
      console.error('❌ Failed to fetch contacts:', contactsResult.message);
      return;
    }
    
    console.log('✅ Successfully fetched contacts');
    console.log(`📧 Found ${contactsResult.contacts.length} contact messages`);
    
    // Show first few messages
    if (contactsResult.contacts.length > 0) {
      console.log('\n📋 Recent contact messages:');
      contactsResult.contacts.slice(0, 3).forEach((contact, index) => {
        console.log(`${index + 1}. ${contact.name} (${contact.email}) - ${contact.subject} - Status: ${contact.status}`);
      });
    }
    
    console.log('\n🎉 Contact API is working correctly!');
    console.log('\n💡 Frontend should now be able to fetch contacts after login.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContactAPI();
