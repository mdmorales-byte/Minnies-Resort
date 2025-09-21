import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FeedbackForm from './FeedbackForm';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [testimonials, setTestimonials] = useState([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);
  
  const heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1920&h=1080&fit=crop',
      title: 'Welcome to Minnie\'s Farm Resort',
      subtitle: 'Your Perfect Getaway in Basud, Camarines Norte'
    },
    {
      url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=1080&fit=crop',
      title: 'Cozy Cottages & Comfortable Stays',
      subtitle: 'Experience rustic charm with modern amenities'
    },
    {
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop',
      title: 'Perfect for Family Gatherings',
      subtitle: 'Create unforgettable memories with your loved ones'
    }
  ];

  // Fetch testimonials from API
  const fetchTestimonials = async () => {
    try {
      const response = await fetch('/api/testimonials/public?limit=6');
      const result = await response.json();
      
      if (result.success) {
        setTestimonials(result.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback to default testimonials if API fails
      setTestimonials([
        {
          id: '1',
          name: 'Maria Santos',
          initials: 'MS',
          rating: 5,
          message: 'Amazing place for family bonding! The cottages are clean and comfortable. The staff is very accommodating. We\'ll definitely come back!',
          visitType: 'Family Vacation'
        },
        {
          id: '2',
          name: 'Juan Dela Cruz',
          initials: 'JD',
          rating: 5,
          message: 'Perfect venue for our company outing! Great facilities, beautiful surroundings, and excellent service. Highly recommended!',
          visitType: 'Corporate Event'
        },
        {
          id: '3',
          name: 'Ana Rodriguez',
          initials: 'AR',
          rating: 5,
          message: 'Peaceful and relaxing environment. Great for unwinding from city stress. The karaoke was a hit with the kids!',
          visitType: 'Weekend Getaway'
        }
      ]);
    } finally {
      setTestimonialsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    
    // Fetch testimonials on component mount
    fetchTestimonials();
    
    return () => clearInterval(timer);
  }, []);

  const handleFeedbackSubmit = (result) => {
    // Refresh testimonials after successful submission
    fetchTestimonials();
  };

  const getAvatarColor = (initials) => {
    const colors = [
      'linear-gradient(135deg, #ff7675 0%, #d63031 100%)',
      'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      'linear-gradient(135deg, #55a3ff 0%, #003d82 100%)',
      'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
      'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
      'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)'
    ];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
      `}</style>
      
      {/* Enhanced Hero Section with Slideshow */}
      <section className="hero" style={{
        backgroundImage: `url(${heroImages[currentSlide].url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        transition: 'background-image 1s ease-in-out'
      }}>
        <div className="hero-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
          zIndex: 1
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-content" style={{
            textAlign: 'center',
            color: 'white',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 'bold',
              marginBottom: '1.5rem',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              animation: 'fadeInUp 1s ease-out'
            }}>
              {heroImages[currentSlide].title}
            </h1>
            <p style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              marginBottom: '2rem',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              animation: 'fadeInUp 1s ease-out 0.3s both'
            }}>
              {heroImages[currentSlide].subtitle}
            </p>
            <div className="hero-buttons" style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              animation: 'fadeInUp 1s ease-out 0.6s both'
            }}>
              <Link to="/booking" className="btn btn-primary" style={{
                background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(230, 126, 34, 0.4)'
              }}>
                <i className="fas fa-calendar-alt" style={{ marginRight: '0.5rem' }}></i>
                Book Your Stay
              </Link>
              <Link to="/accommodations" className="btn btn-secondary" style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                border: '2px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}>
                <i className="fas fa-home" style={{ marginRight: '0.5rem' }}></i>
                View Accommodations
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 2
        }}>
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features" style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
      }}>
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Minnie's Farm Resort?</h2>
            <p>Experience the perfect blend of nature, comfort, and relaxation</p>
          </div>
          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            marginTop: '4rem'
          }}>
            <div className="feature-card" style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}>
              <div className="feature-icon" style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: 'white'
              }}>
                <i className="fas fa-leaf"></i>
              </div>
              <h3 style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '1.5rem' }}>Natural Setting</h3>
              <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>Surrounded by lush greenery and fresh mountain air, perfect for reconnecting with nature.</p>
            </div>
            
            <div className="feature-card" style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}>
              <div className="feature-icon" style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: 'white'
              }}>
                <i className="fas fa-home"></i>
              </div>
              <h3 style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '1.5rem' }}>Comfortable Accommodations</h3>
              <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>Modern amenities combined with rustic charm in our well-appointed cottages.</p>
            </div>
            
            <div className="feature-card" style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}>
              <div className="feature-icon" style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: 'white'
              }}>
                <i className="fas fa-users"></i>
              </div>
              <h3 style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '1.5rem' }}>Family-Friendly</h3>
              <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>Perfect for family gatherings, celebrations, and creating lasting memories together.</p>
            </div>
            
            <div className="feature-card" style={{
              background: 'white',
              padding: '2.5rem',
              borderRadius: '20px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}>
              <div className="feature-icon" style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: 'white'
              }}>
                <i className="fas fa-microphone"></i>
              </div>
              <h3 style={{ color: '#2c3e50', marginBottom: '1rem', fontSize: '1.5rem' }}>Entertainment</h3>
              <p style={{ color: '#7f8c8d', lineHeight: '1.6' }}>Karaoke facilities available for those fun-filled evenings with friends and family.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing" style={{
        padding: '6rem 0',
        background: 'white'
      }}>
        <div className="container">
          <div className="section-header">
            <h2>Our Affordable Rates</h2>
            <p>Choose the perfect package for your getaway</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '4rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
              color: 'white',
              padding: '3rem 2rem',
              borderRadius: '20px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Day Cottage</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ₱500
                <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/day</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ 8 hours usage</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Basic amenities</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Up to 8 guests</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Free parking</li>
              </ul>
              <Link to="/booking" style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.8rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 'bold',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'inline-block',
                transition: 'all 0.3s ease'
              }}>
                Book Now
              </Link>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
              color: 'white',
              padding: '3rem 2rem',
              borderRadius: '20px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              transform: 'scale(1.05)',
              border: '3px solid #f39c12'
            }}>
              <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: '#f39c12',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                POPULAR
              </div>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Overnight Stay</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                ₱1,000
                <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/night</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ 24 hours usage</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Full amenities</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Up to 10 guests</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Free breakfast</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Free WiFi</li>
              </ul>
              <Link to="/booking" style={{
                background: 'white',
                color: '#e84393',
                padding: '0.8rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
                transition: 'all 0.3s ease'
              }}>
                Book Now
              </Link>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
              color: 'white',
              padding: '3rem 2rem',
              borderRadius: '20px',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Add-Ons</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                Extra Services
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>• Karaoke: ₱500</li>
                <li style={{ marginBottom: '0.5rem' }}>• Entrance Fee: ₱100/person</li>
                <li style={{ marginBottom: '0.5rem' }}>• Extra Mattress: ₱200</li>
                <li style={{ marginBottom: '0.5rem' }}>• Catering Service: Available</li>
              </ul>
              <Link to="/contact" style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.8rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: 'bold',
                border: '2px solid rgba(255,255,255,0.3)',
                display: 'inline-block',
                transition: 'all 0.3s ease'
              }}>
                Inquire Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Testimonials Section */}
      <section className="testimonials" style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="section-header">
            <h2 style={{ color: 'white' }}>What Our Guests Say</h2>
            <p style={{ color: 'rgba(255,255,255,0.9)' }}>Real experiences from our valued customers</p>
          </div>
          
          {/* Share Experience Button */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => setShowFeedbackForm(true)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '50px',
                border: '2px solid rgba(255,255,255,0.3)',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.2)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <i className="fas fa-star" style={{ color: '#f39c12' }}></i>
              Share Your Experience
            </button>
          </div>

          {testimonialsLoading ? (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <div style={{ 
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '3px solid rgba(255,255,255,0.3)',
                borderTop: '3px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.8)' }}>Loading testimonials...</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              marginTop: '4rem'
            }}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '2rem',
                  borderRadius: '20px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'transform 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fas fa-star" style={{ color: '#f39c12', marginRight: '0.2rem' }}></i>
                    ))}
                    {[...Array(5 - testimonial.rating)].map((_, i) => (
                      <i key={i} className="far fa-star" style={{ color: 'rgba(255,255,255,0.5)', marginRight: '0.2rem' }}></i>
                    ))}
                  </div>
                  <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                    "{testimonial.message}"
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      background: getAvatarColor(testimonial.initials),
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '1rem',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>
                      {testimonial.initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{testimonial.name}</div>
                      <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{testimonial.visitType}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {testimonials.length === 0 && !testimonialsLoading && (
            <div style={{ textAlign: 'center', marginTop: '4rem' }}>
              <i className="fas fa-comments" style={{ fontSize: '3rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}></i>
              <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)' }}>
                Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </section>


      {/* Call to Action Section */}
      <section className="cta" style={{
        padding: '6rem 0',
        background: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <div className="container">
          <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
            Ready for Your Perfect Getaway?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            Book your stay at Minnie's Farm Resort today and create unforgettable memories with your loved ones.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/booking" style={{
              background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
              color: 'white',
              padding: '1rem 2.5rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(230, 126, 34, 0.4)'
            }}>
              <i className="fas fa-calendar-check"></i>
              Book Now
            </Link>
            <Link to="/contact" style={{
              background: 'transparent',
              color: 'white',
              padding: '1rem 2.5rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              border: '2px solid white',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease'
            }}>
              <i className="fas fa-phone"></i>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <FeedbackForm
          onClose={() => setShowFeedbackForm(false)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </>
  );
};

export default Home;
