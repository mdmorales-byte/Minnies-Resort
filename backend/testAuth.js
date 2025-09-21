const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAuthFlow() {
  try {
    console.log('🧪 Testing authentication flow...');
    
    // 1. Test login
    console.log('\n1. Testing login...');
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
    console.log('Login response:', loginResult);
    
    if (!loginResult.success) {
      console.error('❌ Login failed');
      return;
    }
    
    const token = loginResult.token;
    console.log('✅ Login successful, token received');
    
    // 2. Submit a contact message
    console.log('\n2. Submitting test contact message...');
    const contactResponse = await fetch('http://localhost:5000/api/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        subject: 'booking',
        message: 'This is a test message to verify the contact form integration with admin panel.'
      })
    });
    
    const contactResult = await contactResponse.json();
    console.log('Contact submission response:', contactResult);
    
    if (!contactResult.success) {
      console.error('❌ Contact submission failed');
      return;
    }
    
    console.log('✅ Contact message submitted successfully');
    
    // 3. Test fetching contacts with admin token
    console.log('\n3. Fetching contacts with admin token...');
    const fetchResponse = await fetch('http://localhost:5000/api/contacts', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const fetchResult = await fetchResponse.json();
    console.log('Fetch contacts response:', fetchResult);
    
    if (!fetchResult.success) {
      console.error('❌ Failed to fetch contacts');
      return;
    }
    
    console.log('✅ Successfully fetched contacts');
    console.log(`📧 Found ${fetchResult.contacts.length} contact messages`);
    
    if (fetchResult.contacts.length > 0) {
      console.log('\n📋 Latest contact message:');
      const latest = fetchResult.contacts[0];
      console.log(`- Name: ${latest.name}`);
      console.log(`- Email: ${latest.email}`);
      console.log(`- Subject: ${latest.subject}`);
      console.log(`- Status: ${latest.status}`);
      console.log(`- Message: ${latest.message.substring(0, 50)}...`);
    }
    
    console.log('\n🎉 All tests passed! Contact form integration is working.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFlow();
