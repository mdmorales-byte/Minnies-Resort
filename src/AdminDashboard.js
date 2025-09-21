import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, Filter, Settings, TrendingUp, Calendar, Users, DollarSign, Download, Edit, Save, X, Eye, FileText, Bell, Menu, LogOut, Home, BookOpen, Cog, Star } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isSuperAdmin, loading, logout, user } = useAuth();
  // Real data from MongoDB API
  const [bookings, setBookings] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0
  });
  const [dataLoading, setDataLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);

  // Fetch data from MongoDB API
  const fetchDashboardData = useCallback(async () => {
    try {
      setDataLoading(true);
      const token = user?.token;
      
      if (!token) {
        console.error('No auth token available');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch bookings
      const bookingsResponse = await fetch('/api/bookings', { headers });
      if (bookingsResponse.ok) {
        const bookingsResult = await bookingsResponse.json();
        if (bookingsResult.success) {
          setBookings(bookingsResult.bookings || []);
        }
      }

      // Fetch contacts
      const contactsResponse = await fetch('/api/contacts', { headers });
      if (contactsResponse.ok) {
        const contactsResult = await contactsResponse.json();
        if (contactsResult.success) {
          setContacts(contactsResult.contacts || []);
        }
      }

      // Fetch testimonials
      const testimonialsResponse = await fetch('/api/testimonials', { headers });
      if (testimonialsResponse.ok) {
        const testimonialsResult = await testimonialsResponse.json();
        if (testimonialsResult.success) {
          setTestimonials(testimonialsResult.testimonials || []);
        }
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard', { headers });
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          setDashboardStats(statsResult.stats || {});
        }
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [user]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [editingSettings, setEditingSettings] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    pricing: {
      dayCottage: 500,
      overnightStay: 1000,
      karaoke: 500,
      entranceFee: 100,
      seasonalMultiplier: 1.2
    },
    business: {
      name: "Minnie's Farm Resort",
      phone: "09666619229",
      email: "info@minniesfarmresort.com",
      address: "Purok 1, Matnog, Basud, 4608 Camarines Norte",
      hours: "8:00 AM - 8:00 PM"
    },
    booking: {
      maxAdvanceDays: 90,
      cancellationHours: 24,
      depositPercentage: 30,
      maxGuests: 20
    }
  });

  // Auth guard: allow any authenticated user. Redirect super admins to their dashboard.
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/admin/login');
      } else if (isSuperAdmin) {
        navigate('/admin/super-dashboard');
      } else {
        // Fetch dashboard data for regular admin
        fetchDashboardData();
      }
    }
  }, [isAuthenticated, isSuperAdmin, loading, navigate, fetchDashboardData]);

  // Refresh data when user changes
  useEffect(() => {
    if (isAuthenticated && !isSuperAdmin && user?.token) {
      fetchDashboardData();
    }
  }, [isAuthenticated, isSuperAdmin, user, fetchDashboardData]);

  // Load settings on component mount
  useEffect(() => {
    const loadSettingsOnMount = () => {
      try {
        const savedSettings = localStorage.getItem('resortSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettingsOnMount();
  }, []);

  if (loading || dataLoading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin"></i> 
          {loading ? 'Loading...' : 'Fetching dashboard data...'}
        </div>
      </div>
    );
  }

  // Calculate real analytics data from actual bookings
  const calculateRevenueData = () => {
    const monthlyRevenue = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 9 months with 0
    const currentDate = new Date();
    for (let i = 8; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = monthNames[date.getMonth()];
      monthlyRevenue[monthKey] = 0;
    }
    
    // Calculate actual revenue from bookings
    bookings.forEach(booking => {
      if (booking.createdAt && (booking.status === 'confirmed' || booking.status === 'completed')) {
        const bookingDate = new Date(booking.createdAt);
        const monthKey = monthNames[bookingDate.getMonth()];
        if (monthlyRevenue.hasOwnProperty(monthKey)) {
          monthlyRevenue[monthKey] += booking.totalAmount || 0;
        }
      }
    });
    
    return Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue
    }));
  };

  const calculateBookingTypeData = () => {
    const typeCounts = { day: 0, overnight: 0 };
    
    bookings.forEach(booking => {
      if (booking.accommodationType === 'day') {
        typeCounts.day++;
      } else if (booking.accommodationType === 'overnight') {
        typeCounts.overnight++;
      }
    });
    
    const total = typeCounts.day + typeCounts.overnight;
    if (total === 0) {
      return [
        { name: 'Day Cottage', value: 50, color: '#8FBC8F' },
        { name: 'Overnight', value: 50, color: '#CD853F' }
      ];
    }
    
    return [
      { 
        name: 'Day Cottage', 
        value: Math.round((typeCounts.day / total) * 100), 
        color: '#8FBC8F' 
      },
      { 
        name: 'Overnight', 
        value: Math.round((typeCounts.overnight / total) * 100), 
        color: '#CD853F' 
      }
    ];
  };

  const calculateDailyBookings = () => {
    const dailyCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get bookings from last 7 days
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    bookings.forEach(booking => {
      if (booking.createdAt) {
        const bookingDate = new Date(booking.createdAt);
        if (bookingDate >= lastWeek) {
          const dayName = dayNames[bookingDate.getDay()];
          dailyCounts[dayName]++;
        }
      }
    });
    
    return [
      { day: 'Mon', bookings: dailyCounts.Mon },
      { day: 'Tue', bookings: dailyCounts.Tue },
      { day: 'Wed', bookings: dailyCounts.Wed },
      { day: 'Thu', bookings: dailyCounts.Thu },
      { day: 'Fri', bookings: dailyCounts.Fri },
      { day: 'Sat', bookings: dailyCounts.Sat },
      { day: 'Sun', bookings: dailyCounts.Sun }
    ];
  };

  // Real analytics data
  const revenueData = calculateRevenueData();
  const bookingTypeData = calculateBookingTypeData();
  const dailyBookings = calculateDailyBookings();

  // Filtered bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.bookingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesType = filterType === 'all' || booking.accommodationType === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate metrics from real data
  const calculateMetrics = () => {
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month data
    const currentMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= currentMonth;
    });

    // Last month data
    const lastMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= lastMonth && bookingDate <= lastMonthEnd;
    });

    // Calculate totals
    const totalRevenue = bookings.reduce((sum, booking) => {
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        return sum + (booking.totalAmount || 0);
      }
      return sum;
    }, 0);
    
    const totalBookings = bookings.length;
    const avgBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
    
    // Calculate occupancy rate (assuming max 10 bookings per day capacity)
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const maxCapacity = daysInMonth * 10;
    const occupancyRate = Math.min(Math.round((totalBookings / maxCapacity) * 100), 100);

    // Calculate month-over-month changes
    const currentRevenue = currentMonthBookings.reduce((sum, booking) => {
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        return sum + (booking.totalAmount || 0);
      }
      return sum;
    }, 0);
    
    const lastRevenue = lastMonthBookings.reduce((sum, booking) => {
      if (booking.status === 'confirmed' || booking.status === 'completed') {
        return sum + (booking.totalAmount || 0);
      }
      return sum;
    }, 0);

    const revenueChange = lastRevenue > 0 ? 
      Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100) : 0;
    
    const bookingChange = lastMonthBookings.length > 0 ? 
      Math.round(((currentMonthBookings.length - lastMonthBookings.length) / lastMonthBookings.length) * 100) : 0;

    const lastAvgValue = lastMonthBookings.length > 0 ? 
      lastRevenue / lastMonthBookings.length : 0;
    const currentAvgValue = currentMonthBookings.length > 0 ? 
      currentRevenue / currentMonthBookings.length : 0;
    const avgValueChange = lastAvgValue > 0 ? 
      Math.round(((currentAvgValue - lastAvgValue) / lastAvgValue) * 100) : 0;

    return {
      totalRevenue,
      totalBookings,
      avgBookingValue,
      occupancyRate,
      revenueChange,
      bookingChange,
      avgValueChange,
      occupancyChange: Math.max(-50, Math.min(50, bookingChange)) // Cap occupancy change
    };
  };

  const metrics = calculateMetrics();
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;

  const handleSettingsChange = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const saveSettings = async () => {
    try {
      const token = user?.token;
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      // For now, we'll save settings to localStorage since there's no backend endpoint
      // In a production app, you'd want to create a settings API endpoint
      localStorage.setItem('resortSettings', JSON.stringify(settings));
      
      setEditingSettings(false);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };


  const exportData = async (type, format = 'csv') => {
    try {
      const token = user?.token;
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      if (type === 'bookings') {
        // Get current bookings data
        const dataToExport = bookings.length > 0 ? bookings : [];
        
        if (dataToExport.length === 0) {
          alert('No booking data to export.');
          return;
        }

        if (format === 'csv') {
          // Create CSV content
          const csvHeaders = ['Booking ID', 'Guest Name', 'Email', 'Phone', 'Check-in', 'Check-out', 'Guests', 'Accommodation', 'Amount', 'Status', 'Created Date'];
          const csvRows = dataToExport.map(booking => [
            booking.bookingId || booking._id,
            booking.guestName || '',
            booking.email || '',
            booking.phone || '',
            booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '',
            booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '',
            booking.guests || 0,
            booking.accommodationType || '',
            `₱${booking.totalAmount || 0}`,
            booking.status || '',
            booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''
          ]);

          const csvContent = [csvHeaders, ...csvRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

          // Download CSV file
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          alert('CSV export completed successfully!');
        } else if (format === 'excel') {
          // For Excel format, we'll create a more detailed CSV that can be opened in Excel
          const excelHeaders = ['Booking ID', 'Guest Name', 'Email', 'Phone', 'Check-in Date', 'Check-out Date', 'Number of Guests', 'Accommodation Type', 'Total Amount', 'Status', 'Special Requests', 'Created Date'];
          const excelRows = dataToExport.map(booking => [
            booking.bookingId || booking._id,
            booking.guestName || '',
            booking.email || '',
            booking.phone || '',
            booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : '',
            booking.checkOut ? new Date(booking.checkOut).toLocaleDateString() : '',
            booking.guests || 0,
            booking.accommodationType === 'day' ? 'Day Cottage' : booking.accommodationType === 'overnight' ? 'Overnight Stay' : booking.accommodationType,
            booking.totalAmount || 0,
            booking.status || '',
            booking.specialRequests || '',
            booking.createdAt ? new Date(booking.createdAt).toLocaleDateString() : ''
          ]);

          const excelContent = [excelHeaders, ...excelRows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

          // Download Excel-compatible CSV file
          const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `bookings_detailed_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          alert('Excel-compatible export completed successfully!');
        }
      } else if (type === 'revenue') {
        // Export revenue data
        const revenueData = [
          ['Date', 'Total Bookings', 'Revenue', 'Average Booking Value'],
          [new Date().toLocaleDateString(), dashboardStats.totalBookings || 0, `₱${dashboardStats.totalRevenue || 0}`, `₱${dashboardStats.averageBookingValue || 0}`]
        ];

        const csvContent = revenueData
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Revenue report exported successfully!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const createBackup = async () => {
    try {
      const token = user?.token;
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      // Create a comprehensive backup with all data
      const backupData = {
        exportDate: new Date().toISOString(),
        bookings: bookings,
        contacts: contacts,
        dashboardStats: dashboardStats,
        settings: settings
      };

      // Convert to JSON and create downloadable file
      const jsonContent = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `resort_backup_${new Date().toISOString().split('T')[0]}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Backup created and downloaded successfully!');
    } catch (error) {
      console.error('Backup creation failed:', error);
      alert('Backup creation failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/admin/login');
    }
  };

  const openMessageDetails = (message) => {
    setSelectedMessage(message);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMessage(null);
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      const token = user?.token;
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`/api/contacts/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update message status');
      }

      if (data.success) {
        // Update local state
        setContacts(prevContacts => 
          prevContacts.map(contact => 
            contact._id === messageId ? { ...contact, status: newStatus } : contact
          )
        );
        
        // Update selected message if it's the one being updated
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage(prev => ({ ...prev, status: newStatus }));
        }
        
        alert(`Message status updated to ${newStatus} successfully!`);
      } else {
        throw new Error(data.message || 'Failed to update message status');
      }
    } catch (error) {
      console.error('Error updating message status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedBooking(null);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = user?.token;
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update booking status');
      }

      if (data.success) {
        // Update local state
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId ? { ...booking, status: newStatus } : booking
          )
        );
        
        // Update selected booking if it's the one being updated
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking(prev => ({ ...prev, status: newStatus }));
        }
        
        alert(`Booking status updated to ${newStatus} successfully!`);
      } else {
        throw new Error(data.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Testimonial functions
  const openTestimonialDetails = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setShowTestimonialModal(true);
  };

  const closeTestimonialModal = () => {
    setShowTestimonialModal(false);
    setSelectedTestimonial(null);
  };

  const updateTestimonialStatus = async (testimonialId, action) => {
    try {
      const token = user?.token;
      if (!token) {
        alert('Authentication required. Please log in again.');
        return;
      }

      const response = await fetch(`/api/testimonials/${testimonialId}/${action}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${action} testimonial`);
      }

      if (data.success) {
        // Update local state
        setTestimonials(prevTestimonials => 
          prevTestimonials.map(testimonial => 
            testimonial._id === testimonialId ? data.testimonial : testimonial
          )
        );
        
        // Update selected testimonial if it's the one being updated
        if (selectedTestimonial && selectedTestimonial._id === testimonialId) {
          setSelectedTestimonial(data.testimonial);
        }
        
        alert(`Testimonial ${action}d successfully!`);
      } else {
        throw new Error(data.message || `Failed to ${action} testimonial`);
      }
    } catch (error) {
      console.error(`Error ${action}ing testimonial:`, error);
      alert(`Error: ${error.message}`);
    }
  };

  const FormField = ({ label, value, onChange, disabled, type = "text", prefix, placeholder, rows }) => (
    <div>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px'
      }}>{label}</label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280',
            zIndex: 1
          }}>{prefix}</span>
        )}
        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={onChange}
            disabled={disabled}
            rows={rows || 3}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: prefix ? '12px 16px 12px 40px' : '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              background: disabled ? '#f9fafb' : 'white',
              color: disabled ? '#6b7280' : '#111827',
              cursor: disabled ? 'not-allowed' : 'text',
              resize: 'vertical',
              minHeight: '80px'
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: prefix ? '12px 16px 12px 40px' : '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              background: disabled ? '#f9fafb' : 'white',
              color: disabled ? '#6b7280' : '#111827',
              cursor: disabled ? 'not-allowed' : 'text'
            }}
            onFocus={(e) => {
              if (!disabled) {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = 'none';
            }}
          />
        )}
      </div>
    </div>
  );

  const MetricCard = ({ title, value, change, icon: Icon, color }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid #f3f4f6',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>{title}</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{value}</p>
          {change && (
            <p style={{ fontSize: '14px', fontWeight: '500', color: '#059669', margin: '4px 0 0 0' }}>
              ↗ {change}
            </p>
          )}
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: color === 'emerald' ? '#059669' : 
                     color === 'blue' ? '#3b82f6' : 
                     color === 'purple' ? '#8b5cf6' : '#f97316'
        }}>
          <Icon style={{ width: '24px', height: '24px', color: 'white' }} />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div>
      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <MetricCard
          title="Total Revenue"
          value={`₱${metrics.totalRevenue.toLocaleString()}`}
          change={`${metrics.revenueChange >= 0 ? '+' : ''}${metrics.revenueChange}% from last month`}
          icon={DollarSign}
          color="emerald"
        />
        <MetricCard
          title="Total Bookings"
          value={metrics.totalBookings.toString()}
          change={`${metrics.bookingChange >= 0 ? '+' : ''}${metrics.bookingChange}% from last month`}
          icon={Calendar}
          color="blue"
        />
        <MetricCard
          title="Avg Booking Value"
          value={`₱${metrics.avgBookingValue.toLocaleString()}`}
          change={`${metrics.avgValueChange >= 0 ? '+' : ''}${metrics.avgValueChange}% from last month`}
          icon={TrendingUp}
          color="purple"
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${metrics.occupancyRate}%`}
          change={`${metrics.occupancyChange >= 0 ? '+' : ''}${metrics.occupancyChange}% from last month`}
          icon={Users}
          color="orange"
        />
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Monthly Revenue</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Revenue trends over the past 9 months</p>
            </div>
            <button 
              onClick={() => exportData('revenue')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'none',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'none';
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Export
            </button>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="revenue" fill="url(#colorRevenue)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 4px 0' }}>Booking Types</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Distribution of accommodation types</p>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={bookingTypeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                label={({ name, value }) => `${name}: ${value}%`}
                labelLine={false}
                stroke="#fff"
                strokeWidth={2}
              >
                {bookingTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Bookings Trend */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-900">Weekly Booking Trend</h3>
          <p className="text-sm text-gray-500 mt-1">Daily booking patterns throughout the week</p>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={dailyBookings}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb', 
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="bookings" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#f59e0b', strokeWidth: 2, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Real-time Status Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        {/* Booking Status Summary */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 1rem 0' }}>
            Booking Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Pending</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b'
                }}></div>
                <span style={{ fontWeight: '600', color: '#111827' }}>{pendingCount}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Confirmed</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <span style={{ fontWeight: '600', color: '#111827' }}>{confirmedCount}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Completed</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6'
                }}></div>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {bookings.filter(b => b.status === 'completed').length}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Cancelled</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444'
                }}></div>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {bookings.filter(b => b.status === 'cancelled').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Status Summary */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 1rem 0' }}>
            Message Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>New Messages</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b'
                }}></div>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {contacts.filter(c => c.status === 'new').length}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Read</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981'
                }}></div>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {contacts.filter(c => c.status === 'read').length}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Replied</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6'
                }}></div>
                <span style={{ fontWeight: '600', color: '#111827' }}>
                  {contacts.filter(c => c.status === 'replied').length}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#6b7280', fontSize: '14px' }}>Total Messages</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#6b7280'
                }}></div>
                <span style={{ fontWeight: '600', color: '#111827' }}>{contacts.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid #f3f4f6',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', margin: '0 0 1rem 0' }}>
            Recent Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bookings.slice(0, 3).map((booking, index) => (
              <div key={booking._id || index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem',
                backgroundColor: '#f9fafb',
                borderRadius: '6px'
              }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0 }}>
                    {booking.guestName}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    {booking.accommodationType} - ₱{booking.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500',
                  backgroundColor: booking.status === 'confirmed' ? '#dcfce7' :
                                 booking.status === 'pending' ? '#fef3c7' :
                                 booking.status === 'completed' ? '#dbeafe' : '#fee2e2',
                  color: booking.status === 'confirmed' ? '#166534' :
                         booking.status === 'pending' ? '#92400e' :
                         booking.status === 'completed' ? '#1e40af' : '#991b1b'
                }}>
                  {booking.status}
                </span>
              </div>
            ))}
            {bookings.length === 0 && (
              <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', margin: 0 }}>
                No recent bookings
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div>
      {/* Search and Filters */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
            <Search style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '16px',
              height: '16px',
              color: '#9ca3af'
            }} />
            <input
              type="text"
              placeholder="Search bookings by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.outline = 'none';
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Types</option>
              <option value="day">Day Cottage</option>
              <option value="overnight">Overnight</option>
            </select>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => exportData('bookings')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#059669',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#047857';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#059669';
                }}
              >
                <Download style={{ width: '16px', height: '16px' }} />
                Export CSV
              </button>
              <button 
                onClick={() => exportData('bookings', 'excel')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#3b82f6';
                }}
              >
                <FileText style={{ width: '16px', height: '16px' }} />
                Export Excel
              </button>
              <button 
                onClick={createBackup}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#8b5cf6',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#7c3aed';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#8b5cf6';
                }}
              >
                <Download style={{ width: '16px', height: '16px' }} />
                Backup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb' }}>
              <tr>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>ID</th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Customer</th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Type</th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Date</th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Amount</th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Guests</th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Status</th>
                <th style={{
                  padding: '12px 24px',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  borderBottom: '1px solid #e5e7eb'
                }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ background: 'white' }}>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} style={{
                  borderBottom: '1px solid #f3f4f6',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#111827',
                    whiteSpace: 'nowrap',
                    fontWeight: '500'
                  }}>{booking.bookingId}</td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#111827',
                    whiteSpace: 'nowrap'
                  }}>{booking.guestName}</td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#111827',
                    whiteSpace: 'nowrap',
                    textTransform: 'capitalize'
                  }}>{booking.accommodationType}</td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#111827',
                    whiteSpace: 'nowrap'
                  }}>{new Date(booking.checkIn).toLocaleDateString()}</td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#111827',
                    whiteSpace: 'nowrap',
                    fontWeight: '500'
                  }}>₱{booking.totalAmount?.toLocaleString() || 0}</td>
                  <td style={{
                    padding: '16px 24px',
                    fontSize: '14px',
                    color: '#111827',
                    whiteSpace: 'nowrap'
                  }}>{booking.guests}</td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: '500',
                      border: '1px solid',
                      background: booking.status === 'confirmed' ? '#dcfce7' :
                                 booking.status === 'pending' ? '#fef3c7' :
                                 booking.status === 'completed' ? '#dbeafe' : '#fee2e2',
                      color: booking.status === 'confirmed' ? '#166534' :
                             booking.status === 'pending' ? '#92400e' :
                             booking.status === 'completed' ? '#1e40af' : '#991b1b',
                      borderColor: booking.status === 'confirmed' ? '#bbf7d0' :
                                  booking.status === 'pending' ? '#fde68a' :
                                  booking.status === 'completed' ? '#bfdbfe' : '#fecaca'
                    }}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => openBookingDetails(booking)}
                        style={{
                          padding: '6px 8px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="View Details"
                      >
                        <Eye style={{ width: '14px', height: '14px' }} />
                      </button>
                      {booking.status === 'pending' && (
                        <button 
                          onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Confirm Booking"
                        >
                          <Edit style={{ width: '14px', height: '14px' }} />
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => updateBookingStatus(booking._id, 'completed')}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Mark as Completed"
                        >
                          <Edit style={{ width: '14px', height: '14px' }} />
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button 
                          onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Cancel Booking"
                        >
                          <X style={{ width: '14px', height: '14px' }} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTestimonials = () => (
    <div>
      {/* Testimonials Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>Customer Testimonials</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Manage customer feedback and reviews</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={() => {
              const csvContent = testimonials.map(t => 
                `"${t.name}","${t.email}","${t.rating}","${t.message}","${t.visitType}","${t.status}","${new Date(t.createdAt).toLocaleDateString()}"`
              ).join('\n');
              const blob = new Blob([`Name,Email,Rating,Message,Visit Type,Status,Date\n${csvContent}`], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'testimonials.csv';
              a.click();
            }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Export Testimonials
          </button>
        </div>
      </div>

      {/* Testimonials List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0 }}>
            All Testimonials ({testimonials.length})
          </h3>
        </div>
        
        {testimonials.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Star style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 1rem' }} />
            <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>No testimonials yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Rating</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Message</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Visit Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.map((testimonial, index) => (
                  <tr key={testimonial._id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '14px' }}>
                          {testimonial.name}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '12px' }}>
                          {testimonial.email}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} style={{ width: '14px', height: '14px', fill: '#f59e0b', color: '#f59e0b' }} />
                        ))}
                        {[...Array(5 - testimonial.rating)].map((_, i) => (
                          <Star key={i} style={{ width: '14px', height: '14px', color: '#d1d5db' }} />
                        ))}
                        <span style={{ marginLeft: '4px', fontSize: '12px', color: '#6b7280' }}>
                          ({testimonial.rating}/5)
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', maxWidth: '300px' }}>
                      <div style={{ 
                        fontSize: '14px', 
                        color: '#374151',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        "{testimonial.message}"
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {testimonial.visitType}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: testimonial.status === 'approved' ? '#dcfce7' :
                                       testimonial.status === 'pending' ? '#fef3c7' : '#fee2e2',
                        color: testimonial.status === 'approved' ? '#166534' :
                               testimonial.status === 'pending' ? '#92400e' : '#991b1b'
                      }}>
                        {testimonial.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '14px', color: '#6b7280' }}>
                        {new Date(testimonial.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => openTestimonialDetails(testimonial)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          title="View Details"
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                        </button>
                        {testimonial.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateTestimonialStatus(testimonial._id, 'approve')}
                              style={{
                                padding: '6px 8px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              title="Approve"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => updateTestimonialStatus(testimonial._id, 'reject')}
                              style={{
                                padding: '6px 8px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                              title="Reject"
                            >
                              ✗
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Testimonials Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Testimonials</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {testimonials.length}
              </p>
            </div>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#dbeafe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Pending Review</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', margin: 0 }}>
                {testimonials.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#fef3c7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Approved</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669', margin: 0 }}>
                {testimonials.filter(t => t.status === 'approved').length}
              </p>
            </div>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#dcfce7',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%' }} />
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Average Rating</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>
                {testimonials.length > 0 ? 
                  (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1) : 
                  '0.0'
                }
              </p>
            </div>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#ede9fe',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Star style={{ width: '12px', height: '12px', fill: '#8b5cf6', color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 4px 0' }}>Resort Settings</h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>Manage your resort configuration</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {editingSettings ? (
            <>
              <button
                onClick={() => setEditingSettings(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                <X style={{ width: '16px', height: '16px' }} />
                Cancel
              </button>
              <button
                onClick={saveSettings}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: '#059669',
                  border: '1px solid #059669',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#047857';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#059669';
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingSettings(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: '#3b82f6',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3b82f6';
              }}
            >
              <Edit style={{ width: '16px', height: '16px' }} />
              Edit Settings
            </button>
          )}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '2rem'
      }}>
        {/* Pricing Settings */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #059669, #047857)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <DollarSign style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Pricing Configuration</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Set your resort pricing structure</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <FormField
              label="Day Cottage (per day)"
              type="number"
              value={settings.pricing.dayCottage}
              onChange={(e) => handleSettingsChange('pricing', 'dayCottage', parseInt(e.target.value) || 0)}
              disabled={!editingSettings}
              prefix="₱"
              placeholder="500"
            />
            
            <FormField
              label="Overnight Stay (per night)"
              type="number"
              value={settings.pricing.overnightStay}
              onChange={(e) => handleSettingsChange('pricing', 'overnightStay', parseInt(e.target.value) || 0)}
              disabled={!editingSettings}
              prefix="₱"
              placeholder="1000"
            />
            
            <FormField
              label="Karaoke (per session)"
              type="number"
              value={settings.pricing.karaoke}
              onChange={(e) => handleSettingsChange('pricing', 'karaoke', parseInt(e.target.value) || 0)}
              disabled={!editingSettings}
              prefix="₱"
              placeholder="500"
            />
            
            <FormField
              label="Entrance Fee (per person)"
              type="number"
              value={settings.pricing.entranceFee}
              onChange={(e) => handleSettingsChange('pricing', 'entranceFee', parseInt(e.target.value) || 0)}
              disabled={!editingSettings}
              prefix="₱"
              placeholder="100"
            />
            
            <FormField
              label="Peak Season Multiplier"
              type="number"
              value={settings.pricing.seasonalMultiplier}
              onChange={(e) => handleSettingsChange('pricing', 'seasonalMultiplier', parseFloat(e.target.value) || 1)}
              disabled={!editingSettings}
              placeholder="1.2"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overnight Stay (per night)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  value={settings.pricing.overnightStay}
                  onChange={(e) => handleSettingsChange('pricing', 'overnightStay', parseInt(e.target.value) || 0)}
                  disabled={!editingSettings}
                  className="pl-8 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Karaoke (per session)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  value={settings.pricing.karaoke}
                  onChange={(e) => handleSettingsChange('pricing', 'karaoke', parseInt(e.target.value) || 0)}
                  disabled={!editingSettings}
                  className="pl-8 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entrance Fee (per person)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                <input
                  type="number"
                  value={settings.pricing.entranceFee}
                  onChange={(e) => handleSettingsChange('pricing', 'entranceFee', parseInt(e.target.value) || 0)}
                  disabled={!editingSettings}
                  className="pl-8 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peak Season Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={settings.pricing.seasonalMultiplier}
                onChange={(e) => handleSettingsChange('pricing', 'seasonalMultiplier', parseFloat(e.target.value) || 1)}
                disabled={!editingSettings}
                className="px-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <Settings style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Business Information</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Manage your resort details</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <FormField
              label="Resort Name"
              value={settings.business.name}
              onChange={(e) => handleSettingsChange('business', 'name', e.target.value)}
              disabled={!editingSettings}
              placeholder="Minnie's Farm Resort"
            />
            
            <FormField
              label="Phone Number"
              value={settings.business.phone}
              onChange={(e) => handleSettingsChange('business', 'phone', e.target.value)}
              disabled={!editingSettings}
              placeholder="09666619229"
            />
            
            <FormField
              label="Email Address"
              type="email"
              value={settings.business.email}
              onChange={(e) => handleSettingsChange('business', 'email', e.target.value)}
              disabled={!editingSettings}
              placeholder="info@minniesfarmresort.com"
            />
            
            <FormField
              label="Business Hours"
              value={settings.business.hours}
              onChange={(e) => handleSettingsChange('business', 'hours', e.target.value)}
              disabled={!editingSettings}
              placeholder="8:00 AM - 8:00 PM"
            />
            
            <FormField
              label="Address"
              type="textarea"
              value={settings.business.address}
              onChange={(e) => handleSettingsChange('business', 'address', e.target.value)}
              disabled={!editingSettings}
              placeholder="Purok 1, Matnog, Basud, 4608 Camarines Norte"
              rows={3}
            />
          </div>
        </div>

        {/* Booking Rules */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <Calendar style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Booking Configuration</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Configure booking rules and policies</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <FormField
              label="Max Advance Booking (days)"
              type="number"
              value={settings.booking.maxAdvanceDays}
              onChange={(e) => handleSettingsChange('booking', 'maxAdvanceDays', parseInt(e.target.value) || 0)}
              disabled={!editingSettings}
              placeholder="90"
            />
            
            <FormField
              label="Cancellation Notice (hours)"
              type="number"
              value={settings.booking.cancellationHours}
              onChange={(e) => handleSettingsChange('booking', 'cancellationHours', parseInt(e.target.value) || 0)}
              disabled={!editingSettings}
              placeholder="24"
            />
            
            <FormField
              label="Required Deposit (%)"
              type="number"
              value={settings.booking.depositPercentage}
              onChange={(e) => handleSettingsChange('booking', 'depositPercentage', parseInt(e.target.value) || 0)}
              disabled={!editingSettings}
              placeholder="30"
            />
            
            <FormField
              label="Maximum Guests"
              type="number"
              value={settings.booking.maxGuests}
              onChange={(e) => handleSettingsChange('booking', 'maxGuests', parseInt(e.target.value) || 0)}
              disabled={!editingSettings}
              placeholder="20"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderMessages = () => (
    <div>
      {/* Messages Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>Contact Messages</h2>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>Manage customer inquiries and messages</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => {
              // Export contacts to CSV
              if (contacts.length === 0) {
                alert('No contact messages to export.');
                return;
              }
              
              const csvHeaders = ['Name', 'Email', 'Subject', 'Message', 'Status', 'Date'];
              const csvRows = contacts.map(contact => [
                contact.name || '',
                contact.email || '',
                contact.subject || '',
                contact.message || '',
                contact.status || '',
                contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : ''
              ]);

              const csvContent = [csvHeaders, ...csvRows]
                .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
                .join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
              const link = document.createElement('a');
              const url = URL.createObjectURL(blob);
              link.setAttribute('href', url);
              link.setAttribute('download', `contact_messages_${new Date().toISOString().split('T')[0]}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              
              alert('Contact messages exported successfully!');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Download style={{ width: '16px', height: '16px' }} />
            Export Messages
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {dataLoading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            Loading messages...
          </div>
        ) : contacts.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
            <Bell style={{ width: '48px', height: '48px', margin: '0 auto 1rem', opacity: 0.5 }} />
            <p style={{ fontSize: '16px', margin: 0 }}>No contact messages found</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact, index) => (
                  <tr key={contact._id || index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                      {contact.name}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                      {contact.email}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#374151' }}>
                      {contact.subject}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: contact.status === 'new' ? '#fef3c7' : contact.status === 'replied' ? '#dbeafe' : '#d1fae5',
                        color: contact.status === 'new' ? '#92400e' : contact.status === 'replied' ? '#1e40af' : '#065f46'
                      }}>
                        {contact.status || 'new'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>
                      {contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openMessageDetails(contact)}
                          style={{
                            padding: '6px 8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="View Details"
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                        </button>
                        {contact.status === 'new' && (
                          <button
                            onClick={() => updateMessageStatus(contact._id, 'read')}
                            style={{
                              padding: '6px 8px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Mark as Read"
                          >
                            <Edit style={{ width: '14px', height: '14px' }} />
                          </button>
                        )}
                        {contact.status === 'read' && (
                          <button
                            onClick={() => updateMessageStatus(contact._id, 'replied')}
                            style={{
                              padding: '6px 8px',
                              backgroundColor: '#8b5cf6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Mark as Replied"
                          >
                            <Edit style={{ width: '14px', height: '14px' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Messages Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Messages</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: 0 }}>
                {contacts.length}
              </p>
            </div>
            <Bell style={{ width: '24px', height: '24px', color: '#6b7280' }} />
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>New Messages</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#dc2626', margin: 0 }}>
                {contacts.filter(c => c.status === 'new').length}
              </p>
            </div>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#fee2e2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#dc2626', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 4px 0' }}>Replied</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: '#059669', margin: 0 }}>
                {contacts.filter(c => c.status === 'replied').length}
              </p>
            </div>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#d1fae5',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const dashboardStyle = {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: '#111827',
    display: 'flex'
  };

  const sidebarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '256px',
    background: 'white',
    borderRight: '1px solid #e5e7eb',
    zIndex: 40,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  };

  const mainContentStyle = {
    marginLeft: '256px',
    flex: 1,
    minHeight: '100vh'
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'messages', label: 'Messages', icon: Bell },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
    { id: 'settings', label: 'Settings', icon: Cog },
  ];

  return (
    <>
      <style>{`
        .admin-dashboard-override {
          min-height: 100vh !important;
          background: #f8fafc !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
          color: #111827 !important;
          display: flex !important;
          position: relative !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .admin-sidebar-override {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          height: 100vh !important;
          width: 256px !important;
          background: white !important;
          border-right: 1px solid #e5e7eb !important;
          z-index: 40 !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .admin-main-override {
          margin-left: 256px !important;
          flex: 1 !important;
          min-height: 100vh !important;
        }
      `}</style>
      <div className="admin-dashboard-override" style={dashboardStyle}>
        {/* Sidebar */}
        <div className="admin-sidebar-override" style={sidebarStyle}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#059669',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>M</span>
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Minnie's Resort</h1>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Admin Dashboard</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1.5rem 1rem' }}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px',
                  marginBottom: '8px',
                  background: isActive ? '#dcfce7' : 'transparent',
                  border: isActive ? '1px solid #bbf7d0' : '1px solid transparent',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: isActive ? '#059669' : '#6b7280',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.color = '#111827';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#6b7280';
                  }
                }}
              >
                <Icon style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#d1d5db',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '12px'
            }}>
              <Users style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '14px', fontWeight: '500', color: '#111827', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Admin User'}
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'admin@resort.com'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '8px 12px',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#dc2626',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'none';
            }}
          >
            <LogOut style={{ width: '16px', height: '16px', marginRight: '12px' }} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="admin-main-override" style={mainContentStyle}>
        {/* Header */}
        <header style={{
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>
              {sidebarItems.find(item => item.id === activeTab)?.label}
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
              <Bell style={{ width: '20px', height: '20px' }} />
            </button>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ padding: '1.5rem' }}>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'messages' && renderMessages()}
          {activeTab === 'testimonials' && renderTestimonials()}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>
    </div>

    {/* Booking Details Modal */}
    {showBookingModal && selectedBooking && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '700px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Booking Details
            </h2>
            <button
              onClick={closeBookingModal}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            </button>
          </div>

          {/* Booking Content */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Booking ID
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', fontWeight: '500' }}>
                  {selectedBooking.bookingId || selectedBooking._id}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Guest Name
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', fontWeight: '500' }}>
                  {selectedBooking.guestName}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                  {selectedBooking.email}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phone
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                  {selectedBooking.phone}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Check-in Date
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', fontWeight: '500' }}>
                  {selectedBooking.checkIn ? new Date(selectedBooking.checkIn).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Check-out Date
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                  {selectedBooking.checkOut ? new Date(selectedBooking.checkOut).toLocaleDateString() : 'Same day'}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Guests
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', fontWeight: '500' }}>
                  {selectedBooking.guests} people
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Accommodation
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', fontWeight: '500', textTransform: 'capitalize' }}>
                  {selectedBooking.accommodationType}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Amount
                </label>
                <p style={{ fontSize: '18px', color: '#059669', margin: '4px 0 0 0', fontWeight: '700' }}>
                  ₱{selectedBooking.totalAmount?.toLocaleString() || 0}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </label>
                <span style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: selectedBooking.status === 'confirmed' ? '#dcfce7' :
                                 selectedBooking.status === 'pending' ? '#fef3c7' :
                                 selectedBooking.status === 'completed' ? '#dbeafe' : '#fee2e2',
                  color: selectedBooking.status === 'confirmed' ? '#166534' :
                         selectedBooking.status === 'pending' ? '#92400e' :
                         selectedBooking.status === 'completed' ? '#1e40af' : '#991b1b'
                }}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            {selectedBooking.specialRequests && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Special Requests
                </label>
                <div style={{
                  marginTop: '8px',
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Booking Date
              </label>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb',
            flexWrap: 'wrap'
          }}>
            {selectedBooking.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking._id, 'confirmed');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Edit style={{ width: '16px', height: '16px' }} />
                  Confirm Booking
                </button>
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking._id, 'cancelled');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                  Cancel Booking
                </button>
              </>
            )}
            {selectedBooking.status === 'confirmed' && (
              <>
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking._id, 'completed');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Edit style={{ width: '16px', height: '16px' }} />
                  Mark as Completed
                </button>
                <button
                  onClick={() => {
                    updateBookingStatus(selectedBooking._id, 'cancelled');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                  Cancel Booking
                </button>
              </>
            )}
            <button
              onClick={closeBookingModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Message Details Modal */}
    {showMessageModal && selectedMessage && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
              Message Details
            </h2>
            <button
              onClick={closeMessageModal}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X style={{ width: '16px', height: '16px', color: '#6b7280' }} />
            </button>
          </div>

          {/* Message Content */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Name
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', fontWeight: '500' }}>
                  {selectedMessage.name}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0' }}>
                  {selectedMessage.email}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Subject
                </label>
                <p style={{ fontSize: '14px', color: '#111827', margin: '4px 0 0 0', fontWeight: '500' }}>
                  {selectedMessage.subject}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </label>
                <span style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: selectedMessage.status === 'new' ? '#fef3c7' : selectedMessage.status === 'replied' ? '#dbeafe' : '#d1fae5',
                  color: selectedMessage.status === 'new' ? '#92400e' : selectedMessage.status === 'replied' ? '#1e40af' : '#065f46'
                }}>
                  {selectedMessage.status || 'new'}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Message
              </label>
              <div style={{
                marginTop: '8px',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <p style={{ fontSize: '14px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                  {selectedMessage.message}
                </p>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Date Received
              </label>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {selectedMessage.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            paddingTop: '1rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            {selectedMessage.status === 'new' && (
              <button
                onClick={() => {
                  updateMessageStatus(selectedMessage._id, 'read');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Edit style={{ width: '16px', height: '16px' }} />
                Mark as Read
              </button>
            )}
            {selectedMessage.status === 'read' && (
              <button
                onClick={() => {
                  updateMessageStatus(selectedMessage._id, 'replied');
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Edit style={{ width: '16px', height: '16px' }} />
                Mark as Replied
              </button>
            )}
            <button
              onClick={closeMessageModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Testimonial Details Modal */}
    {showTestimonialModal && selectedTestimonial && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Modal Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>
              Testimonial Details
            </h2>
            <button
              onClick={closeTestimonialModal}
              style={{
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '18px',
                color: '#6b7280'
              }}
            >
              ×
            </button>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  Customer Name
                </label>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0
                }}>
                  {selectedTestimonial.name}
                </p>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  Email
                </label>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  margin: 0
                }}>
                  {selectedTestimonial.email}
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  Visit Type
                </label>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  margin: 0
                }}>
                  {selectedTestimonial.visitType}
                </p>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  Rating
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {[...Array(selectedTestimonial.rating)].map((_, i) => (
                    <Star key={i} style={{ width: '16px', height: '16px', fill: '#f59e0b', color: '#f59e0b' }} />
                  ))}
                  {[...Array(5 - selectedTestimonial.rating)].map((_, i) => (
                    <Star key={i} style={{ width: '16px', height: '16px', color: '#d1d5db' }} />
                  ))}
                  <span style={{ marginLeft: '4px', fontSize: '14px', color: '#6b7280' }}>
                    ({selectedTestimonial.rating}/5)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                marginBottom: '4px'
              }}>
                Status
              </label>
              <span style={{
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: selectedTestimonial.status === 'approved' ? '#dcfce7' :
                               selectedTestimonial.status === 'pending' ? '#fef3c7' : '#fee2e2',
                color: selectedTestimonial.status === 'approved' ? '#166534' :
                       selectedTestimonial.status === 'pending' ? '#92400e' : '#991b1b'
              }}>
                {selectedTestimonial.status}
              </span>
            </div>
          </div>

          {/* Testimonial Message */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '8px'
            }}>
              Customer Experience
            </label>
            <div style={{
              padding: '1rem',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#374151',
                lineHeight: '1.6',
                margin: 0,
                fontStyle: 'italic'
              }}>
                "{selectedTestimonial.message}"
              </p>
            </div>
          </div>

          {/* Submission Info */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  marginBottom: '4px'
                }}>
                  Submitted On
                </label>
                <p style={{
                  fontSize: '14px',
                  color: '#374151',
                  margin: 0
                }}>
                  {new Date(selectedTestimonial.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              {selectedTestimonial.approvedAt && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    marginBottom: '4px'
                  }}>
                    {selectedTestimonial.status === 'approved' ? 'Approved On' : 'Reviewed On'}
                  </label>
                  <p style={{
                    fontSize: '14px',
                    color: '#374151',
                    margin: 0
                  }}>
                    {new Date(selectedTestimonial.approvedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={closeTestimonialModal}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            {selectedTestimonial.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    updateTestimonialStatus(selectedTestimonial._id, 'approve');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Star style={{ width: '16px', height: '16px' }} />
                  Approve & Publish
                </button>
                <button
                  onClick={() => {
                    updateTestimonialStatus(selectedTestimonial._id, 'reject');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AdminDashboard;
