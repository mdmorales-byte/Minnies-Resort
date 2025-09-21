import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import ResortImageManager from './ResortImageManager';
import UserManagement from './UserManagement';
import Reports from './Reports';
// Mock admin system - uses localStorage

const SuperAdminDashboard = () => {
  const { user, logout, isAuthenticated, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Fetch dashboard data
  const fetchDashboardData = async () => {
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

      // Fetch dashboard stats
      const response = await fetch('/api/admin/dashboard', { headers });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDashboardData(result);
        }
      } else {
        console.error('Failed to fetch dashboard data:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        navigate('/admin/login');
      } else if (!isSuperAdmin) {
        navigate('/admin/login');
      } else {
        // Fetch dashboard data when authenticated
        fetchDashboardData();
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

  // Show loading while fetching dashboard data
  if (dataLoading) {
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
          Loading dashboard data...
        </div>
      </div>
    );
  }

  // Get stats from API data or use defaults
  const stats = dashboardData && dashboardData.stats ? {
    totalBookings: dashboardData.stats.totalBookings || 0,
    pendingBookings: (dashboardData.stats.bookingStats && dashboardData.stats.bookingStats.pending) || 0,
    confirmedBookings: (dashboardData.stats.bookingStats && dashboardData.stats.bookingStats.confirmed) || 0,
    totalRevenue: dashboardData.stats.totalRevenue || 0,
    todayBookings: 0, // This would need to be calculated from recent bookings
    monthlyRevenue: 0, // This would need to be calculated from monthly trends
    occupancyRate: 0,
    averageStayDuration: 0,
    totalImages: 0,
    heroImages: 0
  } : {
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
  };

  const recentActivities = dashboardData && dashboardData.recentBookings ? dashboardData.recentBookings.map(booking => ({
    id: booking.id,
    type: 'booking',
    title: `New booking from ${booking.guest_name}`,
    description: `${booking.accommodation_type} - ${booking.guests} guests`,
    time: booking.created_at,
    status: booking.status
  })) : [];

  const revenueChart = dashboardData && dashboardData.monthlyTrends ? dashboardData.monthlyTrends.map(trend => ({
    month: new Date(trend.month + '-01').toLocaleString('default', { month: 'short' }),
    revenue: trend.revenue || 0
  })) : [];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const quickActions = [
    {
      id: 'manage-bookings',
      title: 'Manage Bookings',
      description: 'View and manage all resort bookings',
      icon: 'fas fa-calendar-check',
      action: () => navigate('/admin/bookings')
    },
    {
      id: 'manage-messages',
      title: 'Contact Messages',
      description: 'View and manage customer inquiries',
      icon: 'fas fa-envelope',
      action: () => navigate('/admin/messages')
    },
    {
      id: 'manage-users',
      title: 'User Management',
      description: 'Manage admin users and permissions',
      icon: 'fas fa-users-cog',
      action: () => setActiveSection('users')
    },
    {
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      description: 'View reports, analytics, and business insights',
      icon: 'fas fa-chart-line',
      action: () => setActiveSection('analytics')
    },
    {
      id: 'manage-images',
      title: 'Manage Images',
      description: 'Upload and organize resort images',
      icon: 'fas fa-images',
      action: () => setActiveSection('images')
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Generate and view business reports',
      icon: 'fas fa-chart-bar',
      action: () => setActiveSection('reports')
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'Add and manage admin users',
      icon: 'fas fa-users-cog',
      action: () => setActiveSection('users')
    }
  ];

  // If a specific section is active, render that component
  if (activeSection === 'users') {
    return <UserManagement onBackToDashboard={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'reports') {
    return <Reports onBackToDashboard={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'analytics') {
    return <Reports onBackToDashboard={() => setActiveSection('dashboard')} />;
  }

  if (activeSection === 'images') {
    return (
      <div className="super-admin-dashboard">
        <div className="admin-header-bar">
          <div className="header-content">
            <div className="header-left">
              <h1>
                <i className="fas fa-images"></i>
                Resort Image Manager
              </h1>
              <p>Upload and manage resort images</p>
            </div>
            <div className="header-right">
              <div className="user-info">
                <i className="fas fa-user-circle"></i>
                <span>{user?.name || 'Super Admin'}</span>
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="breadcrumb-section">
          <div className="container">
            <div className="breadcrumb">
              <button 
                className="breadcrumb-item"
                onClick={() => setActiveSection('dashboard')}
              >
                <i className="fas fa-home"></i>
                Dashboard
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Image Manager</span>
            </div>
          </div>
        </div>

        <ResortImageManager onBackToDashboard={() => setActiveSection('dashboard')} />
      </div>
    );
  }

  return (
    <div className="super-admin-dashboard">
      {/* Header */}
      <div className="admin-header-bar">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-tachometer-alt"></i>
              Super Admin Dashboard
            </h1>
            <p>Welcome back, {user?.name || 'Super Admin'}</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <i className="fas fa-user-circle"></i>
              <span>{user?.name || 'Super Admin'}</span>
            </div>
            <button className="btn-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <h2>Dashboard Overview</h2>
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
            <div className="stat-icon" style={{ backgroundColor: '#2196F3' }}>
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.pendingBookings}</h3>
              <p>Pending Bookings</p>
              <span className="stat-change">
                <i className="fas fa-hourglass-half"></i> Awaiting confirmation
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#FF9800' }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{stats.confirmedBookings}</h3>
              <p>Confirmed Bookings</p>
              <span className="stat-change positive">
                <i className="fas fa-check"></i> Ready for guests
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#9C27B0' }}>
              <i className="fas fa-dollar-sign"></i>
            </div>
            <div className="stat-content">
              <h3>₱{stats.totalRevenue.toLocaleString()}</h3>
              <p>Total Revenue</p>
              <span className="stat-change positive">
                <i className="fas fa-arrow-up"></i> ₱{stats.monthlyRevenue.toLocaleString()} this month
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          {quickActions.map(action => (
            <div 
              key={action.id}
              className={`action-card action-${action.id.split('-')[1]}`}
              onClick={action.action}
            >
              <div className="action-icon">
                <i className={action.icon}></i>
              </div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <div className="action-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="dashboard-widgets">
        <div className="widgets-grid">
          {/* Recent Activities */}
          <div className="widget-card">
            <div className="widget-header">
              <h3>
                <i className="fas fa-history"></i>
                Recent Activities
              </h3>
            </div>
            <div className="widget-content">
              {recentActivities.length > 0 ? (
                recentActivities.map(activity => (
                  <div key={activity.id} className="activity-item">
                    <div className={`activity-icon ${activity.type}`}>
                      <i className={activity.type === 'booking' ? 'fas fa-calendar-plus' : 'fas fa-image'}></i>
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                  No recent activities
                </p>
              )}
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="widget-card">
            <div className="widget-header">
              <h3>
                <i className="fas fa-chart-line"></i>
                Revenue Trends
              </h3>
            </div>
            <div className="widget-content">
              <div className="simple-chart">
                {revenueChart.length > 0 ? revenueChart.map((item, index) => {
                  const maxRevenue = Math.max(...revenueChart.map(r => r.revenue), 1);
                  const heightPercentage = Math.max(20, (item.revenue / maxRevenue) * 100);
                  return (
                    <div key={index} className="chart-bar-container">
                      <div 
                        className="chart-bar" 
                        style={{ height: `${heightPercentage}%` }}
                      >
                        <span className="bar-value">₱{item.revenue.toLocaleString()}</span>
                      </div>
                      <div className="bar-label">{item.month}</div>
                    </div>
                  );
                }) : (
                  <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                    No revenue data available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <h2>System Status</h2>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-indicator"></div>
            <div className="status-content">
              <h4>Database</h4>
              <p>Connected</p>
            </div>
          </div>
          <div className="status-item">
            <div className="status-indicator"></div>
            <div className="status-content">
              <h4>API Server</h4>
              <p>Running</p>
            </div>
          </div>
          <div className="status-item">
            <div className="status-indicator"></div>
            <div className="status-content">
              <h4>Authentication</h4>
              <p>Active</p>
            </div>
          </div>
          <div className="status-item">
            <div className="status-indicator"></div>
            <div className="status-content">
              <h4>File Storage</h4>
              <p>Available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;