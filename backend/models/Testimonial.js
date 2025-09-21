const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  
  message: {
    type: String,
    required: [true, 'Testimonial message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  
  visitType: {
    type: String,
    enum: {
      values: ['family_vacation', 'corporate_event', 'weekend_getaway', 'birthday_party', 'wedding', 'other'],
      message: 'Visit type must be one of: family_vacation, corporate_event, weekend_getaway, birthday_party, wedding, other'
    },
    default: 'family_vacation'
  },
  
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending'
  },
  
  isPublic: {
    type: Boolean,
    default: false
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },
  
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
testimonialSchema.index({ status: 1, isPublic: 1 });
testimonialSchema.index({ createdAt: -1 });

// Virtual for display name
testimonialSchema.virtual('displayName').get(function() {
  return this.name.split(' ').map(name => name.charAt(0).toUpperCase() + name.slice(1)).join(' ');
});

// Virtual for avatar initials
testimonialSchema.virtual('initials').get(function() {
  return this.name.split(' ').map(name => name.charAt(0).toUpperCase()).join('');
});

// Virtual for visit type display
testimonialSchema.virtual('visitTypeDisplay').get(function() {
  const types = {
    'family_vacation': 'Family Vacation',
    'corporate_event': 'Corporate Event',
    'weekend_getaway': 'Weekend Getaway',
    'birthday_party': 'Birthday Party',
    'wedding': 'Wedding',
    'other': 'Other'
  };
  return types[this.visitType] || 'Other';
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
