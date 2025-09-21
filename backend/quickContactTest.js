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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  checkContacts();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function checkContacts() {
  try {
    console.log('\n📊 Checking contact system status...');
    
    // Check existing contacts
    const contacts = await Contact.find({}).sort({ createdAt: -1 });
    console.log(`📧 Found ${contacts.length} contacts in database`);
    
    if (contacts.length > 0) {
      console.log('\n📋 Recent contacts:');
      contacts.slice(0, 3).forEach((contact, index) => {
        console.log(`${index + 1}. ${contact.name} (${contact.email}) - ${contact.subject} - Status: ${contact.status}`);
        console.log(`   Message: ${contact.message.substring(0, 50)}...`);
        console.log(`   ID: ${contact._id}`);
        console.log('');
      });
    }
    
    console.log('\n✅ Contact System Status:');
    console.log(`📧 Messages: ${contacts.length} records`);
    console.log('🔗 API Endpoints: /api/contacts (GET/POST/PATCH)');
    console.log('🔐 Authentication: JWT tokens configured');
    
    console.log('\n💡 Frontend should be able to:');
    console.log('   1. View contact messages in admin panel');
    console.log('   2. Update message status (new → read → replied → resolved)');
    console.log('   3. Delete messages');
    
    console.log('\n🔧 If status updates are failing, try:');
    console.log('   1. Clear browser localStorage');
    console.log('   2. Login again to get fresh auth token');
    console.log('   3. Check browser console for specific error messages');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking contacts:', error);
    process.exit(1);
  }
}
