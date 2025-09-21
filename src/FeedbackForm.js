import React, { useState } from 'react';

const FeedbackForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    message: '',
    visitType: 'family_vacation'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const visitTypes = [
    { value: 'family_vacation', label: 'Family Vacation' },
    { value: 'corporate_event', label: 'Corporate Event' },
    { value: 'weekend_getaway', label: 'Weekend Getaway' },
    { value: 'birthday_party', label: 'Birthday Party' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Please share your experience';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Please write at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        onSubmit && onSubmit(result);
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        throw new Error(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('😔 Oops! We couldn\'t submit your feedback right now. Please check your internet connection and try again. If the problem persists, you can contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#111827',
            margin: 0
          }}>
            Share Your Experience
          </h2>
          <button
            onClick={onClose}
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

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Your Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.email ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Visit Type */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Visit Type
            </label>
            <select
              name="visitType"
              value={formData.visitType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
            >
              {visitTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Rating *
            </label>
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '24px',
                    color: star <= formData.rating ? '#f59e0b' : '#d1d5db',
                    transition: 'color 0.2s'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Click to rate your experience
            </p>
          </div>

          {/* Message */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Your Experience *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${errors.message ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              placeholder="Tell us about your experience at Minnie's Farm Resort..."
            />
            {errors.message && (
              <p style={{ color: '#ef4444', fontSize: '12px', margin: '0.25rem 0 0 0' }}>
                {errors.message}
              </p>
            )}
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
              {formData.message.length}/500 characters
            </p>
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                padding: '12px 24px',
                backgroundColor: isSubmitting ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>

        <p style={{
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          margin: '1rem 0 0 0'
        }}>
          Your feedback will be reviewed before being published on our website.
        </p>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(16, 185, 129, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20px',
          color: 'white',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            animation: 'bounce 1s infinite'
          }}>
            🌟
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 1rem 0'
          }}>
            Thank you, {formData.name}!
          </h3>
          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            margin: '0 0 1rem 0',
            maxWidth: '400px'
          }}>
            Your wonderful feedback means the world to us at Minnie's Farm Resort.
          </p>
          <div style={{
            fontSize: '14px',
            opacity: 0.9,
            marginBottom: '1.5rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              ✅ Your testimonial has been received
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              📝 Currently under review for publication
            </div>
            <div>
              💚 We appreciate you sharing your experience
            </div>
          </div>
          <p style={{
            fontSize: '14px',
            fontWeight: '600',
            margin: 0,
            opacity: 0.8
          }}>
            We look forward to welcoming you back soon!
          </p>
          <div style={{
            marginTop: '1rem',
            fontSize: '12px',
            opacity: 0.7
          }}>
            This window will close automatically...
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;
