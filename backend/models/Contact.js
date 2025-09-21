const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  // Message ID (auto-generated)
  messageId: {
    type: String,
    unique: true
  },
  
  // Contact Information
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
  
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+\-\s()]*$/, 'Please enter a valid phone number']
  },
  
  // Message Details
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: {
      values: ['booking', 'information', 'complaint', 'suggestion', 'other'],
      message: 'Subject must be booking, information, complaint, suggestion, or other'
    }
  },
  
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  
  // Status
  status: {
    type: String,
    enum: {
      values: ['new', 'read', 'replied', 'resolved'],
      message: 'Status must be new, read, replied, or resolved'
    },
    default: 'new'
  },
  
  // Admin Response
  adminResponse: {
    type: String,
    maxlength: [2000, 'Admin response cannot exceed 2000 characters']
  },
  
  respondedBy: {
    type: String,
    trim: true
  },
  
  respondedAt: {
    type: Date
  },
  
  // Priority
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Priority must be low, medium, high, or urgent'
    },
    default: 'medium'
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

// Generate message ID before saving
contactSchema.pre('save', function(next) {
  if (!this.messageId) {
    this.messageId = 'MSG' + Date.now().toString().slice(-6);
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes for better query performance
contactSchema.index({ messageId: 1 });
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contact', contactSchema);
