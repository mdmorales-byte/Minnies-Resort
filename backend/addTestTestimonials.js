const mongoose = require('mongoose');
const Testimonial = require('./models/Testimonial');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/minnies_farm_resort', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const sampleTestimonials = [
  {
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    rating: 5,
    message: 'Amazing place for family bonding! The cottages are clean and comfortable. The staff is very accommodating. We\'ll definitely come back!',
    visitType: 'family_vacation',
    status: 'approved',
    isPublic: true
  },
  {
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@company.com',
    rating: 5,
    message: 'Perfect venue for our company outing! Great facilities, beautiful surroundings, and excellent service. Highly recommended!',
    visitType: 'corporate_event',
    status: 'approved',
    isPublic: true
  },
  {
    name: 'Ana Rodriguez',
    email: 'ana.rodriguez@gmail.com',
    rating: 5,
    message: 'Peaceful and relaxing environment. Great for unwinding from city stress. The karaoke was a hit with the kids!',
    visitType: 'weekend_getaway',
    status: 'approved',
    isPublic: true
  },
  {
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@yahoo.com',
    rating: 4,
    message: 'Had a wonderful time celebrating my daughter\'s birthday here. The staff helped us set up decorations and the kids had so much fun!',
    visitType: 'birthday_party',
    status: 'approved',
    isPublic: true
  },
  {
    name: 'Lisa Chen',
    email: 'lisa.chen@outlook.com',
    rating: 5,
    message: 'Beautiful location for our wedding reception! The natural setting provided the perfect backdrop for our special day. Thank you for making it memorable!',
    visitType: 'wedding',
    status: 'approved',
    isPublic: true
  },
  {
    name: 'Roberto Silva',
    email: 'roberto.silva@gmail.com',
    rating: 4,
    message: 'Great place to relax and unwind. The cottages are comfortable and the surroundings are very peaceful. Will definitely recommend to friends.',
    visitType: 'weekend_getaway',
    status: 'pending',
    isPublic: false
  },
  {
    name: 'Grace Lim',
    email: 'grace.lim@email.com',
    rating: 5,
    message: 'Exceeded our expectations! The resort is well-maintained and the staff is incredibly friendly. Perfect for family gatherings.',
    visitType: 'family_vacation',
    status: 'pending',
    isPublic: false
  },
  {
    name: 'Michael Torres',
    email: 'michael.torres@company.ph',
    rating: 3,
    message: 'Good location but could use some improvements in the facilities. The staff was helpful though.',
    visitType: 'corporate_event',
    status: 'rejected',
    isPublic: false
  }
];

async function addTestimonials() {
  try {
    console.log('🌟 Adding sample testimonials...');
    
    // Clear existing testimonials
    await Testimonial.deleteMany({});
    console.log('✅ Cleared existing testimonials');
    
    // Add sample testimonials
    const testimonials = await Testimonial.insertMany(sampleTestimonials);
    console.log(`✅ Added ${testimonials.length} sample testimonials`);
    
    // Display summary
    const approved = testimonials.filter(t => t.status === 'approved').length;
    const pending = testimonials.filter(t => t.status === 'pending').length;
    const rejected = testimonials.filter(t => t.status === 'rejected').length;
    
    console.log('\n📊 Testimonials Summary:');
    console.log(`   • Approved: ${approved}`);
    console.log(`   • Pending: ${pending}`);
    console.log(`   • Rejected: ${rejected}`);
    console.log(`   • Total: ${testimonials.length}`);
    
    // Calculate average rating
    const avgRating = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length;
    console.log(`   • Average Rating: ${avgRating.toFixed(1)}/5 ⭐`);
    
    console.log('\n🎉 Sample testimonials added successfully!');
    console.log('💡 You can now:');
    console.log('   • View testimonials on the homepage');
    console.log('   • Manage testimonials in the admin dashboard');
    console.log('   • Test the feedback form');
    
  } catch (error) {
    console.error('❌ Error adding testimonials:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestimonials();
