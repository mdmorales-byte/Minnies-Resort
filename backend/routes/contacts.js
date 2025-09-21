const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Contact = require('../models/Contact');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/contacts
// @desc    Create new contact message
// @access  Public
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').isIn(['booking', 'information', 'complaint', 'suggestion', 'other']).withMessage('Invalid subject'),
  body('message').trim().isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, phone, subject, message } = req.body;

    // Create contact message
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully! We\'ll get back to you soon.',
      contact: {
        id: contact._id,
        messageId: contact.messageId,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   GET /api/contacts
// @desc    Get all contact messages (admin only)
// @access  Private (Admin)
router.get('/', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['new', 'read', 'replied', 'resolved']).withMessage('Invalid status'),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  query('subject').optional().isIn(['booking', 'information', 'complaint', 'suggestion', 'other']).withMessage('Invalid subject')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.subject) filter.subject = req.query.subject;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
        { messageId: { $regex: req.query.search, $options: 'i' } },
        { message: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    res.json({
      success: true,
      contacts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalContacts: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get single contact message
// @access  Private (Admin)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findOne({
      $or: [
        { _id: req.params.id },
        { messageId: req.params.id }
      ]
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    // Mark as read if it's new
    if (contact.status === 'new') {
      contact.status = 'read';
      contact.updatedAt = Date.now();
      await contact.save();
    }

    res.json({
      success: true,
      contact
    });

  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact'
    });
  }
});

// @route   PATCH /api/contacts/:id/status
// @desc    Update contact message status
// @access  Private (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, [
  body('status').isIn(['new', 'read', 'replied', 'resolved']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    contact.status = status;
    contact.updatedAt = Date.now();

    await contact.save();

    res.json({
      success: true,
      message: 'Contact status updated successfully',
      contact
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact status'
    });
  }
});

// @route   PATCH /api/contacts/:id/priority
// @desc    Update contact message priority
// @access  Private (Admin)
router.patch('/:id/priority', authenticateToken, requireAdmin, [
  body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { priority } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    contact.priority = priority;
    contact.updatedAt = Date.now();

    await contact.save();

    res.json({
      success: true,
      message: 'Contact priority updated successfully',
      contact
    });

  } catch (error) {
    console.error('Update contact priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact priority'
    });
  }
});

// @route   POST /api/contacts/:id/reply
// @desc    Reply to contact message
// @access  Private (Admin)
router.post('/:id/reply', authenticateToken, requireAdmin, [
  body('adminResponse').trim().isLength({ min: 10, max: 2000 }).withMessage('Response must be between 10 and 2000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { adminResponse } = req.body;

    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    contact.adminResponse = adminResponse;
    contact.respondedBy = req.user.username;
    contact.respondedAt = Date.now();
    contact.status = 'replied';
    contact.updatedAt = Date.now();

    await contact.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      contact
    });

  } catch (error) {
    console.error('Reply to contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending reply'
    });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact message status
// @access  Private (Admin)
router.put('/:id', [
  authenticateToken,
  requireAdmin,
  body('status').isIn(['new', 'read', 'replied', 'resolved']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    contact.status = status;
    contact.updatedAt = new Date();
    await contact.save();

    res.json({
      success: true,
      message: `Contact message status updated to ${status}`,
      contact
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact status'
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact message
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });

  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting contact'
    });
  }
});

// @route   GET /api/contacts/stats/dashboard
// @desc    Get contact statistics for dashboard
// @access  Private (Admin)
router.get('/stats/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Basic stats
    const totalContacts = await Contact.countDocuments();
    const newContacts = await Contact.countDocuments({ status: 'new' });
    const urgentContacts = await Contact.countDocuments({ priority: 'urgent' });
    const monthlyContacts = await Contact.countDocuments({ 
      createdAt: { $gte: startOfMonth } 
    });

    // Status breakdown
    const statusStats = await Contact.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Subject breakdown
    const subjectStats = await Contact.aggregate([
      { $group: { _id: '$subject', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalContacts,
        newContacts,
        urgentContacts,
        monthlyContacts,
        statusBreakdown: statusStats,
        subjectBreakdown: subjectStats
      }
    });

  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact statistics'
    });
  }
});

module.exports = router;
