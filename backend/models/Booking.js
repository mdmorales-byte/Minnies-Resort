const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Booking ID (auto-generated)
  bookingId: {
    type: String,
    unique: true
  },
  
  // Guest Information
  guestName: {
    type: String,
    required: [true, 'Guest name is required'],
    trim: true,
    maxlength: [100, 'Guest name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9+\-\s()]+$/, 'Please enter a valid phone number']
  },
  
  // Booking Details
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  
  checkOut: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.checkIn;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: [1, 'At least 1 guest is required'],
    max: [20, 'Maximum 20 guests allowed']
  },
  
  accommodationType: {
    type: String,
    required: [true, 'Accommodation type is required'],
    enum: {
      values: ['day', 'overnight'],
      message: 'Accommodation type must be either day or overnight'
    }
  },
  
  // Add-ons
  addOns: [{
    type: String,
    enum: ['karaoke', 'bbq_grill', 'extra_bedding', 'tour_guide']
  }],
  
  // Pricing
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  
  // Special Requests
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  
  // Booking Status
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'cancelled', 'completed'],
      message: 'Status must be pending, confirmed, cancelled, or completed'
    },
    default: 'pending'
  },
  
  // Payment Status
  paymentStatus: {
    type: String,
    enum: {
      values: ['unpaid', 'partial', 'paid', 'refunded'],
      message: 'Payment status must be unpaid, partial, paid, or refunded'
    },
    default: 'unpaid'
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate booking ID before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    this.bookingId = 'BK' + Date.now().toString().slice(-6);
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
bookingSchema.index({ bookingId: 1 });
bookingSchema.index({ email: 1 });
bookingSchema.index({ checkIn: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Booking', bookingSchema);
