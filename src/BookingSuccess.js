import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const BookingSuccess = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // Fetch booking from MongoDB API
        const response = await fetch(`/api/bookings/${id}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          const bookingData = result.booking;
          setBooking({
            id: bookingData._id,
            bookingId: bookingData.bookingId,
            name: bookingData.guestName,
            email: bookingData.email,
            phone: bookingData.phone,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            guests: bookingData.guests,
            accommodationType: bookingData.accommodationType,
            addOns: bookingData.addOns || [],
            totalCost: bookingData.totalAmount || 0,
            specialRequests: bookingData.specialRequests,
            status: bookingData.status,
            createdAt: bookingData.createdAt
          });
        } else {
          console.error('Booking not found:', result.message);
        }
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="error-container">
        <h2>Booking not found</h2>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <>
      {/* Success Hero */}
      <section className="page-hero success-hero">
        <div className="container">
          <div className="success-content">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h1>Booking Request Submitted!</h1>
            <p>Thank you for choosing Minnie's Farm Resort</p>
          </div>
        </div>
      </section>

      {/* Booking Details */}
      <section className="booking-confirmation">
        <div className="container">
          <div className="confirmation-card">
            <h2>Booking Confirmation</h2>
            <div className="booking-details">
              <div className="detail-row">
                <span className="label">Booking ID:</span>
                <span className="value"><strong>#{booking.id}</strong></span>
              </div>
              <div className="detail-row">
                <span className="label">Name:</span>
                <span className="value">{booking.name}</span>
              </div>
              <div className="detail-row">
                <span className="label">Email:</span>
                <span className="value">{booking.email}</span>
              </div>
              <div className="detail-row">
                <span className="label">Phone:</span>
                <span className="value">{booking.phone}</span>
              </div>
              <div className="detail-row">
                <span className="label">Check-in Date:</span>
                <span className="value">{new Date(booking.checkIn).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
              </div>
              {booking.checkOut && (
                <div className="detail-row">
                  <span className="label">Check-out Date:</span>
                  <span className="value">{new Date(booking.checkOut).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                </div>
              )}
              <div className="detail-row">
                <span className="label">Accommodation:</span>
                <span className="value">{booking.accommodationType.charAt(0).toUpperCase() + booking.accommodationType.slice(1)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Guests:</span>
                <span className="value">{booking.guests}</span>
              </div>
              {booking.addOns.length > 0 && (
                <div className="detail-row">
                  <span className="label">Add-ons:</span>
                  <span className="value">{booking.addOns.join(', ')}</span>
                </div>
              )}
              <div className="detail-row total">
                <span className="label">Total Cost:</span>
                <span className="value">₱{booking.totalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="next-steps">
              <h3>What Happens Next?</h3>
              <div className="steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Confirmation Call</h4>
                    <p>We'll contact you within 24 hours to confirm your booking details.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Payment Instructions</h4>
                    <p>Our team will provide you with payment options and instructions.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Final Confirmation</h4>
                    <p>Once payment is received, your booking will be confirmed.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-urgent">
              <p><i className="fas fa-phone"></i> For urgent inquiries, call us at <strong>09666619229</strong></p>
            </div>

            <div className="action-buttons">
              <Link to="/" className="btn btn-primary">Back to Home</Link>
              <Link to="/contact" className="btn btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BookingSuccess;