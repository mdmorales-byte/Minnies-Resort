const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const mongoose = require('mongoose');
require('dotenv').config();

// Set default environment variables for development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'minnies_farm_resort_super_secret_jwt_key_for_development_only_2024';
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/minnies_farm_resort';
}

// Import Contact model
const Contact = require('./models/Contact');

async function testContactStatusUpdate() {
  try {
    console.log('🧪 Testing Contact Status Update...');
    
    // Connect to MongoDB to get a contact ID
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    // Get a contact to test with
    const contact = await Contact.findOne({});
    if (!contact) {
      console.log('❌ No contacts found to test with');
      return;
    }
    
    console.log(`📧 Testing with contact: ${contact.name} (${contact._id})`);
    console.log(`   Current status: ${contact.status}`);
    
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
    
    // 2. Test updating contact status
    const newStatus = contact.status === 'new' ? 'read' : 'new';
    console.log(`\n2. Updating contact status to: ${newStatus}`);
    
    const updateResponse = await fetch(`http://localhost:5000/api/contacts/${contact._id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    const updateResult = await updateResponse.json();
    
    if (!updateResult.success) {
      console.error('❌ Failed to update contact status:', updateResult.message);
      if (updateResult.errors) {
        console.error('Validation errors:', updateResult.errors);
      }
      return;
    }
    
    console.log('✅ Successfully updated contact status');
    console.log(`   New status: ${updateResult.contact.status}`);
    
    console.log('\n🎉 Contact status update is working correctly!');
    console.log('\n💡 Frontend should now be able to update contact statuses.');
    
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testContactStatusUpdate();
