import React from 'react';

const About = () => {
  return (
    <>
      {/* About Hero */}
      <section className="page-hero">
        <div className="container">
          <h1>About Minnie's Farm Resort</h1>
          <p>Discover our story and what makes us special</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="our-story">
        <div className="container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>Welcome to Minnie's Farm Resort, a hidden gem in the peaceful town of Basud, Camarines Norte. Our story began with a simple idea: to create a place where families and friends could escape the hustle of city life and reconnect with nature.</p>
              
              <p>We envisioned a tranquil retreat where the air is cool, the scenery is beautiful, and the atmosphere is filled with genuine relaxation. Today, Minnie's Farm Resort stands as a testament to that vision. We invite you to experience our charming blend of rustic farm life and comfortable, modern amenities, making it the perfect destination for both adventure and rest.</p>
              
              <p>We are a family-run business, and we pour our hearts into every detail to ensure your stay is unforgettable. From the fresh-picked produce to the serene landscapes, every part of our resort is designed to make you feel at home.</p>
            </div>
            <div className="story-image">
              <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                   alt="Beautiful farm resort landscape" />
              <div className="image-overlay-text">
                <i className="fas fa-seedling"></i>
                <p>Farm Resort View</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values">
        <div className="container">
          <div className="section-header">
            <h2>What We Stand For</h2>
          </div>
          <div className="values-grid">
            <div className="value-card">
              <i className="fas fa-heart"></i>
              <h3>Hospitality</h3>
              <p>We treat every guest like family, ensuring warm and personalized service throughout your stay.</p>
            </div>
            <div className="value-card">
              <i className="fas fa-leaf"></i>
              <h3>Sustainability</h3>
              <p>We're committed to preserving the natural beauty of our surroundings for future generations.</p>
            </div>
            <div className="value-card">
              <i className="fas fa-star"></i>
              <h3>Quality</h3>
              <p>From our facilities to our service, we maintain the highest standards in everything we do.</p>
            </div>
            <div className="value-card">
              <i className="fas fa-handshake"></i>
              <h3>Community</h3>
              <p>We're proud to be part of the Basud community and support local initiatives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team">
        <div className="container">
          <div className="section-header">
            <h2>Meet Our Team</h2>
            <p>The people who make your stay memorable</p>
          </div>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">
                <i className="fas fa-user"></i>
              </div>
              <h3>The Minnie's Family</h3>
              <p className="role">Resort Owners & Operators</p>
              <p>Dedicated to providing you with the best farm resort experience in Camarines Norte.</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <i className="fas fa-laptop-code"></i>
              </div>
              <h3>Mick Daniel Q. Morales</h3>
              <p className="role">IT Developer</p>
              <p>Ensuring your digital experience is as smooth and pleasant as your stay with us.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;