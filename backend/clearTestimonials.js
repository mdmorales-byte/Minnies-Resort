const mongoose = require('mongoose');
const Testimonial = require('./models/Testimonial');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/minnies_farm_resort', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function clearTestimonials() {
  try {
    console.log('🗑️ Clearing all testimonials...');
    
    // Delete all testimonials
    const result = await Testimonial.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} testimonials`);
    
    console.log('\n🎉 All testimonials cleared successfully!');
    console.log('💡 The testimonials section will now show:');
    console.log('   • Empty state on homepage');
    console.log('   • "Be the first to share your experience!" message');
    console.log('   • Clean admin dashboard');
    
  } catch (error) {
    console.error('❌ Error clearing testimonials:', error);
  } finally {
    mongoose.connection.close();
  }
}

clearTestimonials();
