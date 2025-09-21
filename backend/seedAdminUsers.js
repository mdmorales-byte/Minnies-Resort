const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/minnies_farm_resort', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  seedAdminUsers();
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

async function seedAdminUsers() {
  try {
    // Check if admin users already exist
    const existingAdmin = await User.findOne({ role: 'admin' });
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });

    if (existingAdmin && existingSuperAdmin) {
      console.log('✅ Admin users already exist');
      process.exit(0);
    }

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 12);
    const superAdminPassword = await bcrypt.hash('superadmin123', 12);

    // Create admin user if doesn't exist
    if (!existingAdmin) {
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
    }

    // Create super admin user if doesn't exist
    if (!existingSuperAdmin) {
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
    }

    console.log('🎉 Admin users seeded successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('Admin: admin@minniesfarm.com / admin123');
    console.log('Super Admin: superadmin@minniesfarm.com / superadmin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin users:', error);
    process.exit(1);
  }
}
