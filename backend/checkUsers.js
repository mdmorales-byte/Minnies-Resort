const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Set default environment variables for development
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'minnies_farm_resort_super_secret_jwt_key_for_development_only_2024';
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/minnies_farm_resort';
}

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  checkUsers();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function checkUsers() {
  try {
    console.log('\n📋 Checking existing users...');
    
    const users = await User.find({});
    console.log(`Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.isActive}`);
      console.log(`   Created: ${user.createdAt}`);
    });
    
    if (users.length === 0) {
      console.log('\n🔧 No users found. Creating default admin users...');
      await createDefaultUsers();
    } else {
      console.log('\n🧪 Testing password verification...');
      const superAdmin = await User.findOne({ email: 'superadmin@minniesfarm.com' });
      if (superAdmin) {
        const isValidPassword = await bcrypt.compare('superadmin123', superAdmin.password);
        console.log(`Super admin password check: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
      }
      
      const admin = await User.findOne({ email: 'admin@minniesfarm.com' });
      if (admin) {
        const isValidPassword = await bcrypt.compare('admin123', admin.password);
        console.log(`Admin password check: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking users:', error);
    process.exit(1);
  }
}

async function createDefaultUsers() {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const superAdminPassword = await bcrypt.hash('superadmin123', 12);

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@minniesfarm.com',
      password: adminPassword,
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Created admin user: admin@minniesfarm.com / admin123');

    // Create super admin user
    const superAdminUser = new User({
      username: 'superadmin',
      email: 'superadmin@minniesfarm.com',
      password: superAdminPassword,
      role: 'superadmin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true
    });

    await superAdminUser.save();
    console.log('✅ Created super admin user: superadmin@minniesfarm.com / superadmin123');
    
    console.log('\n🎉 Default users created successfully!');
  } catch (error) {
    console.error('❌ Error creating users:', error);
  }
}
