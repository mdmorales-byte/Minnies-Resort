const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Testimonial = require('../models/Testimonial');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/testimonials
// @desc    Create new testimonial (public)
// @access  Public
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('message').trim().isLength({ min: 10, max: 500 }).withMessage('Message must be between 10 and 500 characters'),
  body('visitType').optional().isIn(['family_vacation', 'corporate_event', 'weekend_getaway', 'birthday_party', 'wedding', 'other']).withMessage('Invalid visit type')
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

    const { name, email, rating, message, visitType } = req.body;

    // Get client IP
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    // Create testimonial
    const testimonial = new Testimonial({
      name,
      email,
      rating,
      message,
      visitType: visitType || 'family_vacation',
      ipAddress
    });

    await testimonial.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Your testimonial is pending review and will be published soon.',
      testimonial: {
        id: testimonial._id,
        name: testimonial.name,
        rating: testimonial.rating,
        message: testimonial.message,
        visitType: testimonial.visitType,
        createdAt: testimonial.createdAt
      }
    });

  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting testimonial'
    });
  }
});

// @route   GET /api/testimonials/public
// @desc    Get approved public testimonials
// @access  Public
router.get('/public', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
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

    const limit = parseInt(req.query.limit) || 10;

    const testimonials = await Testimonial.find({
      status: 'approved',
      isPublic: true
    })
    .select('name rating message visitType createdAt')
    .sort({ createdAt: -1 })
    .limit(limit);

    res.json({
      success: true,
      testimonials: testimonials.map(testimonial => ({
        id: testimonial._id,
        name: testimonial.displayName,
        initials: testimonial.initials,
        rating: testimonial.rating,
        message: testimonial.message,
        visitType: testimonial.visitTypeDisplay,
        createdAt: testimonial.createdAt
      }))
    });

  } catch (error) {
    console.error('Get public testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching testimonials'
    });
  }
});

// @route   GET /api/testimonials
// @desc    Get all testimonials (admin only)
// @access  Private (Admin)
router.get('/', [
  authenticateToken,
  requireAdmin,
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const { status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }

    const testimonials = await Testimonial.find(query)
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      testimonials,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching testimonials'
    });
  }
});

// @route   PUT /api/testimonials/:id/approve
// @desc    Approve testimonial
// @access  Private (Admin)
router.put('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    testimonial.status = 'approved';
    testimonial.isPublic = true;
    testimonial.approvedBy = req.user._id;
    testimonial.approvedAt = new Date();

    await testimonial.save();

    res.json({
      success: true,
      message: 'Testimonial approved successfully',
      testimonial
    });

  } catch (error) {
    console.error('Approve testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving testimonial'
    });
  }
});

// @route   PUT /api/testimonials/:id/reject
// @desc    Reject testimonial
// @access  Private (Admin)
router.put('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    testimonial.status = 'rejected';
    testimonial.isPublic = false;
    testimonial.approvedBy = req.user._id;
    testimonial.approvedAt = new Date();

    await testimonial.save();

    res.json({
      success: true,
      message: 'Testimonial rejected successfully',
      testimonial
    });

  } catch (error) {
    console.error('Reject testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting testimonial'
    });
  }
});

// @route   DELETE /api/testimonials/:id
// @desc    Delete testimonial
// @access  Private (Admin)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await Testimonial.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });

  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting testimonial'
    });
  }
});

// @route   GET /api/testimonials/stats
// @desc    Get testimonial statistics
// @access  Private (Admin)
router.get('/stats/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalTestimonials = await Testimonial.countDocuments();
    const pendingTestimonials = await Testimonial.countDocuments({ status: 'pending' });
    const approvedTestimonials = await Testimonial.countDocuments({ status: 'approved' });
    const rejectedTestimonials = await Testimonial.countDocuments({ status: 'rejected' });

    // Average rating
    const ratingStats = await Testimonial.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, totalRatings: { $sum: 1 } } }
    ]);

    const avgRating = ratingStats[0]?.avgRating || 0;

    res.json({
      success: true,
      stats: {
        totalTestimonials,
        pendingTestimonials,
        approvedTestimonials,
        rejectedTestimonials,
        averageRating: Math.round(avgRating * 10) / 10
      }
    });

  } catch (error) {
    console.error('Get testimonial stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching testimonial statistics'
    });
  }
});

module.exports = router;
