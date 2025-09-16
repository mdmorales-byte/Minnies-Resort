import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Welcome to Minnie's Farm Resort</h1>
          <p>Escape to tranquility in the heart of Camarines Norte</p>
          <p className="hero-subtitle">Where rustic charm meets modern comfort</p>
          <div className="hero-buttons">
            <Link to="/booking" className="btn btn-primary">Book Your Stay</Link>
            <Link to="/accommodations" className="btn btn-secondary">View Accommodations</Link>
          </div>
        </div>
        <div className="hero-scroll">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Minnie's Farm Resort?</h2>
            <p>Experience the perfect blend of nature, comfort, and relaxation</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-leaf"></i>
              </div>
              <h3>Natural Setting</h3>
              <p>Surrounded by lush greenery and fresh mountain air, perfect for reconnecting with nature.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-home"></i>
              </div>
              <h3>Comfortable Accommodations</h3>
              <p>Modern amenities combined with rustic charm in our well-appointed cottages.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Family-Friendly</h3>
              <p>Perfect for family gatherings, celebrations, and creating lasting memories together.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-microphone"></i>
              </div>
              <h3>Entertainment</h3>
              <p>Karaoke facilities available for those fun-filled evenings with friends and family.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Accommodations Preview */}
      <section className="accommodations-preview">
        <div className="container">
          <div className="section-header">
            <h2>Our Accommodations</h2>
            <p>Choose from our range of comfortable and affordable options</p>
          </div>
          <div className="accommodations-grid">
            <div className="accommodation-card">
              <div className="accommodation-image">
                <i className="fas fa-home accommodation-icon"></i>
              </div>
              <div className="accommodation-content">
                <h3>Day Cottage</h3>
                <p className="price">₱500 <span>per day</span></p>
                <p>Perfect for day trips and family gatherings. Enjoy our facilities from morning till evening.</p>
                <ul className="amenities">
                  <li><i className="fas fa-check"></i> Comfortable seating area</li>
                  <li><i className="fas fa-check"></i> Access to farm grounds</li>
                  <li><i className="fas fa-check"></i> Clean restroom facilities</li>
                </ul>
              </div>
            </div>
            <div className="accommodation-card featured">
              <div className="featured-badge">Most Popular</div>
              <div className="accommodation-image">
                <i className="fas fa-bed accommodation-icon"></i>
              </div>
              <div className="accommodation-content">
                <h3>Overnight Stay</h3>
                <p className="price">₱1,000 <span>per night</span></p>
                <p>Extended stay option with comfortable sleeping arrangements and full access to amenities.</p>
                <ul className="amenities">
                  <li><i className="fas fa-check"></i> Comfortable bedding</li>
                  <li><i className="fas fa-check"></i> 24-hour facility access</li>
                  <li><i className="fas fa-check"></i> Breakfast option available</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="text-center">
            <Link to="/accommodations" className="btn btn-outline">View All Accommodations</Link>
          </div>
        </div>
      </section>

      {/* Image Gallery */}
      <section className="gallery">
        <div className="container">
          <div className="section-header">
            <h2>Experience Our Beautiful Resort</h2>
            <p>Take a visual journey through our peaceful farm retreat</p>
          </div>
          <div className="gallery-grid">
            <div className="gallery-item large">
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                   alt="Beautiful farm landscape" />
              <div className="gallery-overlay">
                <h3>Peaceful Farm Views</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                   alt="Cozy cottage accommodation" />
              <div className="gallery-overlay">
                <h3>Cozy Cottages</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                   alt="Comfortable overnight stay" />
              <div className="gallery-overlay">
                <h3>Overnight Stays</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                   alt="Nature and relaxation" />
              <div className="gallery-overlay">
                <h3>Nature & Relaxation</h3>
              </div>
            </div>
            <div className="gallery-item">
              <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                   alt="Family activities" />
              <div className="gallery-overlay">
                <h3>Family Activities</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready for Your Farm Getaway?</h2>
            <p>Book your stay today and experience the tranquil beauty of Minnie's Farm Resort</p>
            <div className="cta-info">
              <div className="cta-item">
                <i className="fas fa-phone"></i>
                <span>09666619229</span>
              </div>
              <div className="cta-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Basud, Camarines Norte</span>
              </div>
            </div>
            <Link to="/booking" className="btn btn-primary btn-large">Book Now</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;