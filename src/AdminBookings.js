import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { bookingsAPI } from './services/api';

const AdminBookings = () => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch bookings from API
  useEffect(() => {
    if (isAuthenticated) {
    fetchBookings();
    }
  }, [isAuthenticated]);

  // Filter bookings when search term or status filter changes
  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, searchTerm]);

  const fetchBookings = async () => {
    try {
      setDataLoading(true);
      setError('');
      
      // Get auth token from localStorage
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      const token = authData.token;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch bookings');
      }

      if (data.success) {
        setBookings(data.bookings || []);
        setError('');
      } else {
        throw new Error(data.message || 'Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError(`Failed to load bookings: ${error.message}`);
    } finally {
      setDataLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.guestName.toLowerCase().includes(term) ||
        booking.email.toLowerCase().includes(term) ||
        booking.phone.includes(term) ||
        booking.accommodationType.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      // Get auth token from localStorage
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      const token = authData.token;
      
      if (!token) {
        throw new Error('No authentication token found');
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
        // Update local state with the updated booking
        setBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === bookingId ? { ...booking, status: newStatus } : booking
          )
        );
        
        setShowModal(false);
        setSelectedBooking(null);
        
        // Show success message
        alert(`Booking status updated to ${newStatus} successfully!`);
      } else {
        throw new Error(data.message || 'Failed to update booking status');
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError(`Failed to update booking status: ${error.message}`);
      alert(`Error: ${error.message}`);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      // Get auth token from localStorage
      const authData = JSON.parse(localStorage.getItem('authData') || '{}');
      const token = authData.token;
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete booking');
      }

      if (data.success) {
        // Remove booking from local state
        setBookings(prevBookings => prevBookings.filter(booking => booking._id !== bookingId));
        
        setShowModal(false);
        setSelectedBooking(null);
        
        // Show success message
        alert('Booking deleted successfully!');
      } else {
        throw new Error(data.message || 'Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      setError(`Failed to delete booking: ${error.message}`);
      alert(`Error: ${error.message}`);
    }
  };

  const openBookingDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#4caf50';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'fas fa-clock';
      case 'confirmed': return 'fas fa-check-circle';
      case 'cancelled': return 'fas fa-times-circle';
      case 'completed': return 'fas fa-check-double';
      default: return 'fas fa-question-circle';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="admin-bookings">
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
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="admin-bookings">
      {/* Header */}
      <div className="admin-header-bar">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-calendar-check"></i>
              Booking Management
            </h1>
            <p>Manage all resort bookings and reservations</p>
          </div>
          <div className="header-right">
            <button 
              className="btn-refresh"
              onClick={fetchBookings}
              disabled={dataLoading}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className={`fas fa-sync-alt ${dataLoading ? 'fa-spin' : ''}`}></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bookings-filters" style={{
        background: 'white',
        padding: '2rem',
        marginBottom: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: '2rem',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Search Bookings
            </label>
            <input
              type="text"
              placeholder="Search by name, email, phone, or accommodation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
        </div>

          {/* Status Filter */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Filter by Status
            </label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
              </select>
          </div>

          {/* Results Count */}
          <div style={{
            textAlign: 'right',
            color: '#5a5a5a',
            fontSize: '0.9rem'
          }}>
            <strong>{filteredBookings.length}</strong> bookings found
          </div>
            </div>
          </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fed7d7',
          color: '#c53030',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="bookings-table-container" style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {dataLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            color: '#5a5a5a'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '1rem' }}></i>
            Loading bookings...
          </div>
        ) : filteredBookings.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#5a5a5a'
          }}>
            <i className="fas fa-calendar-times" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <h3>No bookings found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="bookings-table" style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
                <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Guest</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Dates</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Accommodation</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Guests</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                          {booking.guestName}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#5a5a5a' }}>
                          {booking.email}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#5a5a5a' }}>
                          {booking.phone}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {formatDate(booking.checkIn)}
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#5a5a5a' }}>
                          to {formatDate(booking.checkOut)}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: '#e8f5e8',
                        color: '#2d5016',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        textTransform: 'capitalize'
                      }}>
                        {booking.accommodationType}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        background: '#e3f2fd',
                        color: '#1976d2',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        {booking.guests}
                      </span>
                      </td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#2d5016' }}>
                      {formatCurrency(booking.totalAmount)}
                      </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: `${getStatusColor(booking.status)}20`,
                        color: getStatusColor(booking.status),
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        width: 'fit-content'
                      }}>
                        <i className={getStatusIcon(booking.status)}></i>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button 
                        onClick={() => openBookingDetails(booking)}
                        style={{
                          background: '#4a7c59',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2d5016'}
                        onMouseLeave={(e) => e.target.style.background = '#4a7c59'}
                      >
                        <i className="fas fa-eye" style={{ marginRight: '0.25rem' }}></i>
                        View
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>
                Booking Details
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#5a5a5a'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* Guest Information */}
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Guest Information</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Name:</strong> {selectedBooking.guestName}</div>
                  <div><strong>Email:</strong> {selectedBooking.email}</div>
                  <div><strong>Phone:</strong> {selectedBooking.phone}</div>
                </div>
              </div>

              {/* Booking Information */}
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Booking Information</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Check-in:</strong> {formatDate(selectedBooking.checkIn)}</div>
                  <div><strong>Check-out:</strong> {formatDate(selectedBooking.checkOut)}</div>
                  <div><strong>Guests:</strong> {selectedBooking.guests}</div>
                  <div><strong>Accommodation:</strong> {selectedBooking.accommodationType}</div>
                  <div><strong>Total Amount:</strong> {formatCurrency(selectedBooking.totalAmount)}</div>
                  <div><strong>Status:</strong> 
                    <span style={{
                      background: `${getStatusColor(selectedBooking.status)}20`,
                      color: getStatusColor(selectedBooking.status),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginLeft: '0.5rem'
                    }}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div>
                  <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Special Requests</h3>
                  <div style={{
                    background: '#f8f9fa',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {selectedBooking.specialRequests}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '2px solid #e2e8f0'
              }}>
                {selectedBooking.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateBookingStatus(selectedBooking._id, 'confirmed')}
                      style={{
                        background: '#4caf50',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        flex: 1
                      }}
                    >
                      <i className="fas fa-check" style={{ marginRight: '0.5rem' }}></i>
                      Confirm Booking
                    </button>
                    <button
                      onClick={() => updateBookingStatus(selectedBooking._id, 'cancelled')}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        flex: 1
                      }}
                    >
                      <i className="fas fa-times" style={{ marginRight: '0.5rem' }}></i>
                      Cancel Booking
                    </button>
                  </>
                )}
                
                {selectedBooking.status === 'confirmed' && (
                  <button
                    onClick={() => updateBookingStatus(selectedBooking._id, 'completed')}
                    style={{
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      flex: 1
                    }}
                  >
                    <i className="fas fa-check-double" style={{ marginRight: '0.5rem' }}></i>
                    Mark as Completed
                  </button>
                )}

                <button
                  onClick={() => deleteBooking(selectedBooking._id)}
                  style={{
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: 1
                  }}
                >
                  <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                  Delete Booking
                </button>
              </div>
            </div>
          </div>
            </div>
          )}
        </div>
  );
};

export default AdminBookings;