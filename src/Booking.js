import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Mock booking system - no backend required

const Booking = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    accommodationType: '',
    guests: 1,
    addOns: [],
    specialRequests: ''
  });
  
  const [summary, setSummary] = useState({
    baseCost: 0,
    entranceFee: 0,
    addOnsCost: 0,
    totalCost: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Calculate costs whenever form data changes
  useEffect(() => {
    calculateCosts();
  }, [formData]);

  const calculateCosts = () => {
    let baseCost = 0;
    switch(formData.accommodationType) {
      case 'day':
        baseCost = 500;
        break;
      case 'overnight':
        baseCost = 1000;
        break;
      default:
        baseCost = 0;
    }

    let addOnsCost = 0;
    if (formData.addOns.includes('karaoke')) {
      addOnsCost += 500;
    }

    const entranceFee = parseInt(formData.guests || 0) * 100;
    const totalCost = baseCost + addOnsCost + entranceFee;

    setSummary({
      baseCost,
      entranceFee,
      addOnsCost,
      totalCost
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'addOns') {
        setFormData(prev => ({
          ...prev,
          addOns: checked 
            ? [...prev.addOns, value]
            : prev.addOns.filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.checkIn) newErrors.checkIn = 'Check-in date is required';
    if (!formData.accommodationType) newErrors.accommodationType = 'Please select accommodation type';
    if (!formData.guests || formData.guests < 1) newErrors.guests = 'Number of guests is required';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Date validation
    const today = new Date().toISOString().split('T')[0];
    if (formData.checkIn && formData.checkIn < today) {
      newErrors.checkIn = 'Check-in date cannot be in the past';
    }
    
    if (formData.checkOut && formData.checkOut <= formData.checkIn) {
      newErrors.checkOut = 'Check-out date must be after check-in date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Prepare booking data for the API
      const bookingData = {
        guestName: formData.name,
        email: formData.email,
        phone: formData.phone,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut || null,
        guests: parseInt(formData.guests),
        accommodationType: formData.accommodationType,
        addOns: formData.addOns || [],
        totalAmount: parseFloat(summary.totalCost),
        specialRequests: formData.specialRequests || ''
      };

      // Submit booking to MongoDB API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors && Array.isArray(result.errors)) {
          // Show validation errors
          const errorMessages = result.errors.map(err => err.msg).join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        throw new Error(result.message || 'Failed to submit booking');
      }

      if (result.success) {
        // Navigate to success page with the booking ID
        navigate(`/booking-success/${result.booking.bookingId}`);
      } else {
        throw new Error(result.message || 'Booking submission failed');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message || 'Failed to submit booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAccommodationName = (type) => {
    switch(type) {
      case 'day': return 'Day Cottage';
      case 'overnight': return 'Overnight Stay';
      default: return '';
    }
  };

  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <h1>Book Your Stay</h1>
          <p>Reserve your perfect farm getaway today</p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="booking-section">
        <div className="container">
          <div className="booking-container">
            <div className="booking-form-section">
              <h2>Reservation Details</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleInputChange}
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={errors.phone ? 'error' : ''}
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="checkIn">Check-in Date *</label>
                    <input 
                      type="date" 
                      id="checkIn" 
                      name="checkIn" 
                      value={formData.checkIn}
                      onChange={handleInputChange}
                      className={errors.checkIn ? 'error' : ''}
                    />
                    {errors.checkIn && <span className="error-message">{errors.checkIn}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="checkOut">Check-out Date</label>
                    <input 
                      type="date" 
                      id="checkOut" 
                      name="checkOut" 
                      value={formData.checkOut}
                      onChange={handleInputChange}
                      className={errors.checkOut ? 'error' : ''}
                    />
                    <small>Leave blank for day trips</small>
                    {errors.checkOut && <span className="error-message">{errors.checkOut}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="accommodationType">Accommodation Type *</label>
                    <select 
                      id="accommodationType" 
                      name="accommodationType" 
                      value={formData.accommodationType}
                      onChange={handleInputChange}
                      className={errors.accommodationType ? 'error' : ''}
                    >
                      <option value="">Select accommodation</option>
                      <option value="day">Day Cottage - ₱500</option>
                      <option value="overnight">Overnight Stay - ₱1,000</option>
                    </select>
                    {errors.accommodationType && <span className="error-message">{errors.accommodationType}</span>}
                  </div>
                  <div className="form-group">
                    <label htmlFor="guests">Number of Guests *</label>
                    <input 
                      type="number" 
                      id="guests" 
                      name="guests" 
                      min="1" 
                      max="20" 
                      value={formData.guests}
                      onChange={handleInputChange}
                      className={errors.guests ? 'error' : ''}
                    />
                    <small>Entrance fee: ₱100 per person</small>
                    {errors.guests && <span className="error-message">{errors.guests}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Add-ons</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="addOns" 
                        value="karaoke"
                        checked={formData.addOns.includes('karaoke')}
                        onChange={handleInputChange}
                      />
                      <span className="checkbox-custom"></span>
                      Karaoke - ₱500
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="specialRequests">Special Requests</label>
                  <textarea 
                    id="specialRequests" 
                    name="specialRequests" 
                    rows="4" 
                    value={formData.specialRequests}
                    onChange={handleInputChange}
                    placeholder="Any special requests or requirements..."
                  />
                </div>

                <div className="form-group">
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-large"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Booking Request'}
                  </button>
                </div>

                <div className="booking-note">
                  <p><i className="fas fa-info-circle"></i> This is a booking request. We'll contact you within 24 hours to confirm your reservation and provide payment instructions.</p>
                </div>
              </form>
            </div>

            <div className="booking-summary-section">
                              <div className="booking-summary">
                  <h3>Booking Summary</h3>
                  {formData.accommodationType && formData.guests ? (
                    <div>
                      <div className="summary-item">
                        <span>Accommodation:</span>
                        <span>{getAccommodationName(formData.accommodationType)}</span>
                      </div>
                      <div className="summary-item">
                        <span>Base Cost:</span>
                        <span>₱{summary.baseCost.toLocaleString()}</span>
                      </div>
                      <div className="summary-item">
                        <span>Guests ({formData.guests}):</span>
                        <span>₱{summary.entranceFee.toLocaleString()}</span>
                      </div>
                      {summary.addOnsCost > 0 && (
                        <div className="summary-item">
                          <span>Add-ons:</span>
                          <span>₱{summary.addOnsCost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="summary-item total">
                        <span>Total:</span>
                        <span>₱{summary.totalCost.toLocaleString()}</span>
                      </div>
                      {formData.checkIn && (
                        <div className="summary-dates">
                          <p><strong>Check-in:</strong> {new Date(formData.checkIn).toLocaleDateString()}</p>
                          {formData.checkOut && (
                            <p><strong>Check-out:</strong> {new Date(formData.checkOut).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="summary-placeholder">Fill out the form to see your booking summary</p>
                  )}
                  
                  <div className="contact-info">
                    <h4>Need Help?</h4>
                    <div className="contact-item">
                      <i className="fas fa-phone"></i>
                      <span>09666619229</span>
                    </div>
                    <div className="contact-item">
                      <i className="fas fa-envelope"></i>
                      <span>info@minniesfarmresort.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>
    </>
  );
};

export default Booking;