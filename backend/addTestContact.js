const mongoose = require('mongoose');
require('dotenv').config();

// Import Contact model
const Contact = require('./models/Contact');

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

// Add test contact message
const addTestContact = async () => {
  try {
    // Create a test contact message
    const testContact = new Contact({
      name: 'Karakanan',
      email: 'branchmanager@papatantan.com',
      phone: '09123456789',
      subject: 'complaint',
      message: 'fafaafafafafa',
      status: 'new'
    });

    await testContact.save();
    console.log('✅ Test contact message created successfully');
    console.log('📧 Name:', testContact.name);
    console.log('📧 Email:', testContact.email);
    console.log('📋 Subject:', testContact.subject);
    console.log('📋 Status:', testContact.status);
    
  } catch (error) {
    console.error('❌ Error creating test contact:', error);
  }
};

// Main function
const main = async () => {
  console.log('💬 Adding Test Contact Message...');
  console.log('========================================');
  
  await connectDB();
  await addTestContact();
  
  console.log('========================================');
  console.log('✅ Test contact message added!');
  
  mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Failed to add test contact:', error);
  process.exit(1);
});
