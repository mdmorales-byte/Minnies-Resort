import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ResortImageManager from './ResortImageManager';

const SuperAdminDashboard = () => {
  const { user, logout, isAuthenticated, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/admin/login');
      } else if (!isSuperAdmin) {
        navigate('/admin/login');
      }
    }
  }, [isAuthenticated, isSuperAdmin, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="super-admin-dashboard">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#4a7c59'
        }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: '1rem' }}></i>
          Loading...
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRevenue: 0,
    todayBookings: 0,
    monthlyRevenue: 0,
    occupancyRate: 0,
    averageStayDuration: 0,
    totalImages: 0,
    heroImages: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Load bookings from localStorage
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Load resort images from localStorage
    const storedImages = JSON.parse(localStorage.getItem('resortImages') || '[]');

    // Calculate statistics
    const today = new Date().toDateString();
    const currentMonth = new Date().getMonth();

    const stats = {
      totalBookings: storedBookings.length,
      pendingBookings: storedBookings.filter(b => b.status === 'pending').length,
      confirmedBookings: storedBookings.filter(b => b.status === 'confirmed').length,
      totalRevenue: storedBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0),
      todayBookings: storedBookings.filter(b =>
        new Date(b.createdAt).toDateString() === today
      ).length,
      monthlyRevenue: storedBookings
        .filter(b => new Date(b.checkIn).getMonth() === currentMonth)
        .reduce((sum, b) => sum + (b.totalCost || 0), 0),
      occupancyRate: calculateOccupancyRate(storedBookings),
      averageStayDuration: calculateAverageStayDuration(storedBookings),
      totalImages: storedImages.length,
      heroImages: storedImages.filter(img => img.isHero).length
    };

    setStats(stats);

    // Generate recent activities
    const activities = generateRecentActivities(storedBookings, storedImages);
    setRecentActivities(activities);

    // Generate revenue chart data
    const chartData = generateRevenueChartData(storedBookings);
    setRevenueChart(chartData);
  };

  const calculateOccupancyRate = (bookings) => {
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const totalCapacity = 30; // Assuming 30 units available per month
    return Math.round((confirmed / totalCapacity) * 100);
  };

  const calculateAverageStayDuration = (bookings) => {
    const bookingsWithDuration = bookings.filter(b => b.checkOut);
    if (bookingsWithDuration.length === 0) return 0;

    const totalDays = bookingsWithDuration.reduce((sum, b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return (totalDays / bookingsWithDuration.length).toFixed(1);
  };

  const generateRecentActivities = (bookings, images) => {
    const bookingActivities = bookings
      .slice(-3)
      .reverse()
      .map(booking => ({
        id: booking.id,
        type: 'booking',
        description: `New booking from ${booking.name}`,
        time: new Date(booking.createdAt || Date.now()).toLocaleString(),
        status: booking.status
      }));

    const imageActivities = images
      .slice(-2)
      .reverse()
      .map(image => ({
        id: image.id,
        type: 'image',
        description: `Image "${image.name}" uploaded`,
        time: new Date(image.uploadDate).toLocaleString(),
        status: 'uploaded'
      }));

    return [...imageActivities, ...bookingActivities].slice(0, 5);
  };

  const generateRevenueChartData = (bookings) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthBookings = bookings.filter(b => {
        const bookingMonth = new Date(b.checkIn).getMonth();
        return bookingMonth === monthIndex;
      });

      chartData.push({
        month: months[monthIndex],
        revenue: monthBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0)
      });
    }

    return chartData;
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const quickActions = [
    {
      title: 'Manage Bookings',
      icon: 'fa-calendar-check',
      link: '/admin/bookings',
      color: 'primary',
      description: 'View and manage all reservations'
    },
    {
      title: 'Resort Images',
      icon: 'fa-images',
      action: () => setActiveSection('images'),
      color: 'secondary',
      description: 'Upload and manage resort photos'
    },
    {
      title: 'User Management',
      icon: 'fa-users-cog',
      link: '/admin/users',
      color: 'success',
      description: 'Manage staff and admin accounts'
    },
    {
      title: 'Analytics',
      icon: 'fa-chart-line',
      link: '/admin/analytics',
      color: 'info',
      description: 'View detailed reports and insights'
    },
    {
      title: 'Settings',
      icon: 'fa-cog',
      link: '/admin/settings',
      color: 'warning',
      description: 'Configure system settings'
    }
  ];

  return (
    <div className="super-admin-dashboard">
      {/* Header */}
      <header className="admin-header-bar">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1>
                <i className="fas fa-shield-alt"></i>
                Super Admin Dashboard
              </h1>
              <p>Welcome back, {user?.username}</p>
            </div>
            <div className="header-right">
              <span className="user-info">
                <i className="fas fa-user-shield"></i>
                {user?.email}
              </span>
              <button onClick={handleLogout} className="btn btn-logout">
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Breadcrumb */}
      {activeSection !== 'dashboard' && (
        <section className="breadcrumb-section">
          <div className="container">
            <div className="breadcrumb">
              <button 
                onClick={() => setActiveSection('dashboard')}
                className="breadcrumb-item"
              >
                <i className="fas fa-home"></i>
                Dashboard
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">
                {activeSection === 'images' && 'Image Manager'}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Conditional Content */}
      {activeSection === 'dashboard' ? (
        <>
          {/* Stats Overview */}
          <section className="stats-overview">
        <div className="container">
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#4CAF50' }}>
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.totalBookings}</h3>
                <p>Total Bookings</p>
                <span className="stat-change positive">
                  <i className="fas fa-arrow-up"></i> {stats.todayBookings} today
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#FF9800' }}>
                <i className="fas fa-hourglass-half"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.pendingBookings}</h3>
                <p>Pending Bookings</p>
                <span className="stat-change">Awaiting confirmation</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#2196F3' }}>
                <i className="fas fa-peso-sign"></i>
              </div>
              <div className="stat-content">
                <h3>₱{stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
                <span className="stat-change positive">
                  ₱{stats.monthlyRevenue.toLocaleString()} this month
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#9C27B0' }}>
                <i className="fas fa-bed"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.occupancyRate}%</h3>
                <p>Occupancy Rate</p>
                <span className="stat-change">
                  Avg stay: {stats.averageStayDuration} days
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: '#E91E63' }}>
                <i className="fas fa-images"></i>
              </div>
              <div className="stat-content">
                <h3>{stats.totalImages}</h3>
                <p>Resort Images</p>
                <span className="stat-change">
                  {stats.heroImages} hero images
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <div className="container">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            {quickActions.map((action, index) => (
              action.link ? (
                <Link to={action.link} key={index} className={`action-card action-${action.color}`}>
                  <div className="action-icon">
                    <i className={`fas ${action.icon}`}></i>
                  </div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <span className="action-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </Link>
              ) : (
                <button 
                  key={index} 
                  onClick={action.action}
                  className={`action-card action-${action.color}`}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', width: '100%' }}
                >
                  <div className="action-icon">
                    <i className={`fas ${action.icon}`}></i>
                  </div>
                  <h3>{action.title}</h3>
                  <p>{action.description}</p>
                  <span className="action-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </span>
                </button>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Revenue Chart & Recent Activities */}
      <section className="dashboard-widgets">
        <div className="container">
          <div className="widgets-grid">
            {/* Revenue Chart */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>
                  <i className="fas fa-chart-bar"></i>
                  Revenue Trend (Last 6 Months)
                </h3>
              </div>
              <div className="widget-content">
                <div className="simple-chart">
                  {revenueChart.map((data, index) => (
                    <div key={index} className="chart-bar-container">
                      <div
                        className="chart-bar"
                        style={{
                          height: `${Math.max(20, (data.revenue / 50000) * 100)}%`,
                          backgroundColor: '#6ba644'
                        }}
                      >
                        <span className="bar-value">₱{(data.revenue / 1000).toFixed(0)}k</span>
                      </div>
                      <span className="bar-label">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>
                  <i className="fas fa-history"></i>
                  Recent Activities
                </h3>
              </div>
              <div className="widget-content">
                <div className="activities-list">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon">
                          <i className={`fas ${activity.type === 'booking' ? 'fa-calendar-plus' : 'fa-image'}`}></i>
                        </div>
                        <div className="activity-content">
                          <p>{activity.description}</p>
                          <span className="activity-time">{activity.time}</span>
                        </div>
                        <span className={`status-badge status-${activity.status}`}>
                          {activity.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="no-activities">No recent activities</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="system-status">
        <div className="container">
          <div className="status-card">
            <h3>
              <i className="fas fa-server"></i>
              System Status
            </h3>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-indicator status-online"></span>
                <span>Database: Online</span>
              </div>
              <div className="status-item">
                <span className="status-indicator status-online"></span>
                <span>Web Server: Online</span>
              </div>
              <div className="status-item">
                <span className="status-indicator status-online"></span>
                <span>Payment Gateway: Online</span>
              </div>
              <div className="status-item">
                <span className="status-indicator status-online"></span>
                <span>Email Service: Online</span>
              </div>
            </div>
            <p className="last-backup">
              <i className="fas fa-database"></i>
              Last backup: {new Date().toLocaleString()}
            </p>
          </div>
        </div>
      </section>
        </>
      ) : activeSection === 'images' ? (
        <ResortImageManager />
      ) : null}
    </div>
  );
};

export default SuperAdminDashboard;