const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

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

// Create admin users
const createAdminUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Create admin users with correct schema
    const users = [
      {
        username: 'superadmin',
        email: 'superadmin@minniesfarmresort.com',
        password: await bcrypt.hash('superadmin123', 12),
        role: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        status: 'active'
      },
      {
        username: 'admin',
        email: 'admin@minniesfarmresort.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        firstName: 'Admin',
        lastName: 'User',
        status: 'active'
      }
    ];

    await User.insertMany(users);
    console.log('✅ Admin users created successfully');
    console.log('');
    console.log('🔐 Login Credentials:');
    console.log('📧 Super Admin: superadmin@minniesfarmresort.com / superadmin123');
    console.log('📧 Admin: admin@minniesfarmresort.com / admin123');
    console.log('');
    console.log('🎯 You can now login to the admin portal!');
    
  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
};

// Main function
const main = async () => {
  console.log('👥 Creating Admin Users...');
  console.log('========================================');
  
  await connectDB();
  await createAdminUsers();
  
  console.log('========================================');
  console.log('✅ Admin users setup completed!');
  
  mongoose.connection.close();
  process.exit(0);
};

// Run the script
main().catch(error => {
  console.error('❌ Setup failed:', error);
  process.exit(1);
});
