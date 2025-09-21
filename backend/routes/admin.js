const express = require('express');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const User = require('../models/User');
const { authenticateToken, requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard data
// @access  Private (Admin)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Booking statistics
    const bookingStats = {
      total: await Booking.countDocuments(),
      pending: await Booking.countDocuments({ status: 'pending' }),
      confirmed: await Booking.countDocuments({ status: 'confirmed' }),
      completed: await Booking.countDocuments({ status: 'completed' }),
      cancelled: await Booking.countDocuments({ status: 'cancelled' }),
      thisMonth: await Booking.countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      }),
      thisYear: await Booking.countDocuments({ 
        createdAt: { $gte: startOfYear } 
      })
    };

    // Revenue statistics
    const revenueStats = await Booking.aggregate([
      {
        $match: { 
          status: { $in: ['confirmed', 'completed'] }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageBookingValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const monthlyRevenue = await Booking.aggregate([
      {
        $match: { 
          status: { $in: ['confirmed', 'completed'] },
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          monthlyRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Contact statistics
    const contactStats = {
      total: await Contact.countDocuments(),
      new: await Contact.countDocuments({ status: 'new' }),
      read: await Contact.countDocuments({ status: 'read' }),
      replied: await Contact.countDocuments({ status: 'replied' }),
      resolved: await Contact.countDocuments({ status: 'resolved' }),
      urgent: await Contact.countDocuments({ priority: 'urgent' }),
      thisMonth: await Contact.countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      })
    };

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('bookingId guestName email accommodationType totalAmount status createdAt');

    // Recent contacts
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('messageId name email subject status priority createdAt');

    // Monthly booking trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { 
            $sum: {
              $cond: [
                { $in: ['$status', ['confirmed', 'completed']] },
                '$totalAmount',
                0
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        bookingStats,
        contactStats,
        totalRevenue: revenueStats[0]?.totalRevenue || 0,
        averageBookingValue: Math.round(revenueStats[0]?.averageBookingValue || 0),
        monthlyRevenue: monthlyRevenue[0]?.monthlyRevenue || 0
      },
      recentActivity: {
        recentBookings,
        recentContacts
      },
      trends: {
        monthlyTrends
      }
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (super admin only)
// @access  Private (Super Admin)
router.get('/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   PATCH /api/admin/users/:id/status
// @desc    Update user status (super admin only)
// @access  Private (Super Admin)
router.patch('/users/:id/status', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (super admin only)
// @access  Private (Super Admin)
router.delete('/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @route   GET /api/admin/export/bookings
// @desc    Export bookings data
// @access  Private (Admin)
router.get('/export/bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'json', status, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const bookings = await Booking.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Booking ID,Guest Name,Email,Phone,Check In,Check Out,Guests,Accommodation,Total Amount,Status,Created At\n';
      const csvData = bookings.map(booking => 
        `${booking.bookingId},"${booking.guestName}","${booking.email}","${booking.phone}","${booking.checkIn.toISOString().split('T')[0]}","${booking.checkOut ? booking.checkOut.toISOString().split('T')[0] : ''}",${booking.guests},"${booking.accommodationType}",${booking.totalAmount},"${booking.status}","${booking.createdAt.toISOString()}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="bookings-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        bookings,
        exportedAt: new Date().toISOString(),
        totalRecords: bookings.length
      });
    }

  } catch (error) {
    console.error('Export bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting bookings'
    });
  }
});

// @route   GET /api/admin/export/contacts
// @desc    Export contacts data
// @access  Private (Admin)
router.get('/export/contacts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { format = 'json', status, priority, startDate, endDate } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Message ID,Name,Email,Phone,Subject,Status,Priority,Created At\n';
      const csvData = contacts.map(contact => 
        `${contact.messageId},"${contact.name}","${contact.email}","${contact.phone || ''}","${contact.subject}","${contact.status}","${contact.priority}","${contact.createdAt.toISOString()}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="contacts-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvHeader + csvData);
    } else {
      res.json({
        success: true,
        contacts,
        exportedAt: new Date().toISOString(),
        totalRecords: contacts.length
      });
    }

  } catch (error) {
    console.error('Export contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting contacts'
    });
  }
});

module.exports = router;
