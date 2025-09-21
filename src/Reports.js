import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, Users, DollarSign, FileText, Filter, RefreshCw } from 'lucide-react';

const Reports = ({ onBackToDashboard }) => {
  const { isAuthenticated, isSuperAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  
  const [reportData, setReportData] = useState({
    bookings: [],
    contacts: [],
    revenue: [],
    stats: {}
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [selectedReport, setSelectedReport] = useState('overview');

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isSuperAdmin)) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isSuperAdmin, loading, navigate]);

  // Fetch report data
  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchReportData();
    }
  }, [isAuthenticated, isSuperAdmin, dateRange]);

  const fetchReportData = async () => {
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
          setReportData(prev => ({ ...prev, bookings: bookingsResult.bookings || [] }));
        }
      }

      // Fetch contacts
      const contactsResponse = await fetch('/api/contacts', { headers });
      if (contactsResponse.ok) {
        const contactsResult = await contactsResponse.json();
        if (contactsResult.success) {
          setReportData(prev => ({ ...prev, contacts: contactsResult.contacts || [] }));
        }
      }

      // Fetch dashboard stats
      const statsResponse = await fetch('/api/admin/dashboard', { headers });
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json();
        if (statsResult.success) {
          setReportData(prev => ({ ...prev, stats: statsResult.stats || {} }));
        }
      }

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Calculate report metrics
  const calculateMetrics = () => {
    const { bookings, contacts } = reportData;
    
    // Filter by date range
    const filteredBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.checkIn);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return bookingDate >= start && bookingDate <= end;
    });

    const filteredContacts = contacts.filter(contact => {
      const contactDate = new Date(contact.createdAt);
      const start = new Date(dateRange.startDate);
      const end = new Date(dateRange.endDate);
      return contactDate >= start && contactDate <= end;
    });

    // Calculate metrics
    const totalRevenue = filteredBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
    const totalBookings = filteredBookings.length;
    const totalContacts = filteredContacts.length;
    const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

    // Booking status breakdown
    const confirmedBookings = filteredBookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = filteredBookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = filteredBookings.filter(b => b.status === 'cancelled').length;

    // Accommodation type breakdown
    const dayBookings = filteredBookings.filter(b => b.accommodationType === 'day').length;
    const overnightBookings = filteredBookings.filter(b => b.accommodationType === 'overnight').length;

    // Revenue by month
    const revenueByMonth = {};
    filteredBookings.forEach(booking => {
      const month = new Date(booking.checkIn).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (booking.totalAmount || 0);
    });

    const revenueData = Object.entries(revenueByMonth).map(([month, revenue]) => ({
      month,
      revenue
    }));

    return {
      totalRevenue,
      totalBookings,
      totalContacts,
      avgBookingValue,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      dayBookings,
      overnightBookings,
      revenueData,
      filteredBookings,
      filteredContacts
    };
  };

  const metrics = calculateMetrics();

  // Chart data
  const statusData = [
    { name: 'Confirmed', value: metrics.confirmedBookings, color: '#10B981' },
    { name: 'Pending', value: metrics.pendingBookings, color: '#F59E0B' },
    { name: 'Cancelled', value: metrics.cancelledBookings, color: '#EF4444' }
  ];

  const accommodationData = [
    { name: 'Day Cottage', value: metrics.dayBookings, color: '#3B82F6' },
    { name: 'Overnight', value: metrics.overnightBookings, color: '#8B5CF6' }
  ];

  const exportToCSV = (data, filename) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || dataLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        <RefreshCw className="animate-spin mr-2" size={24} />
        {loading ? 'Loading...' : 'Fetching report data...'}
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #1a2f0d 0%, #2d5016 25%, #4a7c59 75%, #6b9b7a 100%)',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: 0, color: '#1f2937', fontSize: '28px', fontWeight: 'bold' }}>
              <FileText size={32} style={{ marginRight: '12px', verticalAlign: 'middle' }} />
              Business Reports
            </h1>
            <p style={{ margin: '8px 0 0 44px', color: '#6b7280' }}>
              Comprehensive analytics and insights for Minnie's Farm Resort
            </p>
          </div>
          <button 
            onClick={() => {
              if (onBackToDashboard) {
                onBackToDashboard();
              } else {
                navigate('/admin/super-dashboard');
              }
            }}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Date Range Filter */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} />
            <label style={{ fontWeight: '500', color: '#374151' }}>Date Range:</label>
          </div>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <span style={{ color: '#6b7280' }}>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={fetchReportData}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <DollarSign size={24} style={{ color: '#10b981', marginRight: '8px' }} />
            <h3 style={{ margin: 0, color: '#374151' }}>Total Revenue</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
            ₱{metrics.totalRevenue.toLocaleString()}
          </p>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
            Average: ₱{Math.round(metrics.avgBookingValue).toLocaleString()} per booking
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <Users size={24} style={{ color: '#3b82f6', marginRight: '8px' }} />
            <h3 style={{ margin: 0, color: '#374151' }}>Total Bookings</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#3b82f6' }}>
            {metrics.totalBookings}
          </p>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
            {metrics.confirmedBookings} confirmed, {metrics.pendingBookings} pending
          </p>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <TrendingUp size={24} style={{ color: '#f59e0b', marginRight: '8px' }} />
            <h3 style={{ margin: 0, color: '#374151' }}>Contact Inquiries</h3>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#f59e0b' }}>
            {metrics.totalContacts}
          </p>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
            Customer inquiries received
          </p>
        </div>
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* Revenue Chart */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₱${value.toLocaleString()}`, 'Revenue']} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Chart */}
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#374151' }}>Booking Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Buttons */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#374151' }}>Export Reports</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => exportToCSV(metrics.filteredBookings, 'bookings_report')}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            Export Bookings CSV
          </button>
          <button
            onClick={() => exportToCSV(metrics.filteredContacts, 'contacts_report')}
            style={{
              background: '#10b981',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={16} />
            Export Contacts CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
