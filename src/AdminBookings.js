import React, { useState, useEffect } from 'react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/admin/bookings');
      const data = await response.json();
      
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    if (!statusFilter) {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === statusFilter));
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/booking/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        ));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const viewBooking = (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      alert(`Booking Details:\n\nID: ${booking.id}\nName: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone}\nAccommodation: ${booking.accommodationType}\nGuests: ${booking.guests}\nTotal: ₱${booking.totalCost}\nStatus: ${booking.status}\n\nSpecial Requests: ${booking.specialRequests || 'None'}`);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <h1>Booking Management</h1>
          <p>Admin panel for managing reservations</p>
        </div>
      </section>

      {/* Bookings Table */}
      <section className="admin-section">
        <div className="container">
          <div className="admin-header">
            <h2>All Bookings ({filteredBookings.length})</h2>
            <div className="admin-filters">
              <select 
                id="statusFilter" 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredBookings.length > 0 ? (
            <div className="bookings-table-container">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Dates</th>
                    <th>Accommodation</th>
                    <th>Guests</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} data-status={booking.status}>
                      <td>#{booking.id}</td>
                      <td>
                        <strong>{booking.name}</strong>
                        <br />
                        <small>{booking.email}</small>
                      </td>
                      <td>{booking.phone}</td>
                      <td>
                        <strong>In:</strong> {new Date(booking.checkIn).toLocaleDateString()}
                        {booking.checkOut && (
                          <>
                            <br /><strong>Out:</strong> {new Date(booking.checkOut).toLocaleDateString()}
                          </>
                        )}
                      </td>
                      <td>{booking.accommodationType.charAt(0).toUpperCase() + booking.accommodationType.slice(1)}</td>
                      <td>{booking.guests}</td>
                      <td>₱{booking.totalCost.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-small">
                          <button 
                            className="btn-small btn-view" 
                            onClick={() => viewBooking(booking.id)}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn-small btn-edit" 
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            title="Confirm Booking"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                          <button 
                            className="btn-small btn-delete" 
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            title="Cancel Booking"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-bookings">
              <i className="fas fa-calendar-times"></i>
              <h3>No bookings yet</h3>
              <p>Bookings will appear here once guests start making reservations.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default AdminBookings;