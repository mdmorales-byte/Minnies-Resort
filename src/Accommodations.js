import React from 'react';
import { Link } from 'react-router-dom';

const Accommodations = () => {
  return (
    <>
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container">
          <h1>Accommodations</h1>
          <p>Find the perfect option for your stay</p>
        </div>
      </section>

      {/* Accommodations */}
      <section className="accommodations-full">
        <div className="container">
          <div className="accommodations-grid">
            {/* Day Cottage */}
            <div className="accommodation-detail-card">
              <div className="accommodation-image-large">
                <img src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                     alt="Beautiful cottage in nature" />
                <div className="image-overlay">
                  <i className="fas fa-home accommodation-icon-large"></i>
                </div>
              </div>
              <div className="accommodation-details">
                <h2>Day Cottage</h2>
                <p className="price-large">₱500 <span>per day</span></p>
                <div className="description">
                  <p>Perfect for day trips, family gatherings, and celebrations. Our comfortable cottages provide an ideal setting for spending quality time with loved ones while enjoying the peaceful farm atmosphere.</p>
                </div>
                <div className="amenities-detailed">
                  <h4>What's Included:</h4>
                  <div className="amenities-grid">
                    <div className="amenity-item">
                      <i className="fas fa-couch"></i>
                      <span>Comfortable seating area</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-tree"></i>
                      <span>Access to farm grounds</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-restroom"></i>
                      <span>Clean restroom facilities</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-utensils"></i>
                      <span>Dining area</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-parking"></i>
                      <span>Free parking</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-wifi"></i>
                      <span>Wi-Fi access</span>
                    </div>
                  </div>
                </div>
                <div className="capacity">
                  <h4>Capacity:</h4>
                  <p><i className="fas fa-users"></i> Suitable for 6-10 people</p>
                </div>
                <Link to="/booking" className="btn btn-primary">Book Day Cottage</Link>
              </div>
            </div>

            {/* Overnight Stay */}
            <div className="accommodation-detail-card featured">
              <div className="featured-badge-large">Most Popular</div>
              <div className="accommodation-image-large">
                <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                     alt="Cozy overnight accommodation" />
                <div className="image-overlay">
                  <i className="fas fa-bed accommodation-icon-large"></i>
                </div>
              </div>
              <div className="accommodation-details">
                <h2>Overnight Stay</h2>
                <p className="price-large">₱1,000 <span>per night</span></p>
                <div className="description">
                  <p>Extend your farm experience with our overnight accommodation. Wake up to fresh mountain air and the sounds of nature. Perfect for weekend getaways and longer retreats from city life.</p>
                </div>
                <div className="amenities-detailed">
                  <h4>What's Included:</h4>
                  <div className="amenities-grid">
                    <div className="amenity-item">
                      <i className="fas fa-bed"></i>
                      <span>Comfortable bedding</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-clock"></i>
                      <span>24-hour facility access</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-coffee"></i>
                      <span>Breakfast option available</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-shower"></i>
                      <span>Private bathroom</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-air-freshener"></i>
                      <span>Fresh linens & towels</span>
                    </div>
                    <div className="amenity-item">
                      <i className="fas fa-mountain"></i>
                      <span>Scenic views</span>
                    </div>
                  </div>
                </div>
                <div className="capacity">
                  <h4>Capacity:</h4>
                  <p><i className="fas fa-users"></i> Suitable for 4-6 people</p>
                </div>
                <Link to="/booking" className="btn btn-primary">Book Overnight Stay</Link>
              </div>
            </div>
          </div>

          {/* Add-ons Section */}
          <div className="addons-section">
            <div className="section-header">
              <h2>Additional Services</h2>
              <p>Enhance your stay with our extra amenities</p>
            </div>
            <div className="addons-grid">
              <div className="addon-card">
                <div className="addon-icon">
                  <i className="fas fa-microphone"></i>
                </div>
                <h3>Karaoke</h3>
                <p className="addon-price">₱500 <span>per session</span></p>
                <p>Make your gathering more fun with our karaoke system. Perfect for parties and celebrations.</p>
                <ul>
                  <li>Latest song collection</li>
                  <li>High-quality sound system</li>
                  <li>Microphones included</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="pricing-summary">
            <div className="section-header">
              <h2>Pricing Summary</h2>
            </div>
            <div className="pricing-table">
              <div className="pricing-row">
                <span className="service">Day Cottage</span>
                <span className="price">₱500 per day</span>
              </div>
              <div className="pricing-row">
                <span className="service">Overnight Stay</span>
                <span className="price">₱1,000 per night</span>
              </div>
              <div className="pricing-row">
                <span className="service">Karaoke (Add-on)</span>
                <span className="price">₱500 per session</span>
              </div>
              <div className="pricing-row">
                <span className="service">Entrance Fee</span>
                <span className="price">₱100 per person</span>
              </div>
            </div>
            <div className="pricing-note">
              <p><i className="fas fa-info-circle"></i> All prices are subject to change. Contact us for group discounts and special packages.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Accommodations;