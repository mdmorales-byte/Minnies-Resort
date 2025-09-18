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
              <img src="https://scontent.fmnl13-2.fna.fbcdn.net/v/t39.30808-6/473332773_1162408192555544_5085407468956494349_n.jpg?_nc_cat=106&ccb=1-7&_nc_sid=833d8c&_nc_eui2=AeEpHuuuo4hZ58UfGFljQCdD1IEvZT4276nUgS9lPjbvqehEnbqW2hug8HjPZM-75fvCNheGacts-LoGT5E3LCM0&_nc_ohc=Y0NRs_7ccc4Q7kNvwHCqQJy&_nc_oc=AdknfBqeG1kD6iXXjx7haor84_VED1C9EaqdOfB1-VgR9lyPekd-abN1ZKpHbg_5w98&_nc_zt=23&_nc_ht=scontent.fmnl13-2.fna&_nc_gid=C1SvSLPjYNg6ZzBT150EBA&oh=00_AfayoX2o3DMOZwx7YOC3H3_mPqqxpgwqRc-iLPx1c7cBGA&oe=68D14135" 
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
                <img 
                  src="https://scontent.fmnl13-1.fna.fbcdn.net/v/t39.30808-6/471431895_961606479169963_2367039667313892006_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeGIHPoUE7XvPsmpt3eViAiWm1OWd6RfMSObU5Z3pF8xI6t4cZhoePPrzg5SleTDssIhJafESXjyBT8oAT2epeJu&_nc_ohc=Sdm9ftCFxuEQ7kNvwErv1Ag&_nc_oc=AdmxdKkoxd5eeNCzBYiusM5AmK5iec1xHt0W0eZnXsM4SGvaSGR25H0ALhp3dt7Xck4&_nc_zt=23&_nc_ht=scontent.fmnl13-1.fna&_nc_gid=aSmPwxaehJhALTN6cXA17g&oh=00_AfahsgXIpnBNnMDD7uvxIp7jfdFEgoopkN-aFxJ0TVfXGw&oe=68D11CB2" 
                  alt="Maximina Morales - Resort Owners" 
                />
              </div>
              <h3>Maximina Morales </h3>
              <p className="role">Resort Owners & Operators</p>
              <p>Dedicated to providing you with the best farm resort experience in Basud Camarines Norte.</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">
                <img 
                  src="https://scontent.fmnl13-2.fna.fbcdn.net/v/t39.30808-6/482221285_2348571822179779_7550504095444498560_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeHgF8zWZwAXSt-IupzjQGrxxCSxZ-wOcsjEJLFn7A5yyDWLw5h2U2DahIGu6Gy4AIKXkulgyW08mA4JptmaXmo6&_nc_ohc=NhnfGkCKG_YQ7kNvwFIvI0h&_nc_oc=Adk2Vgdn7NNlO-6KuCbVM4RtktrevzGzRnc8qQZXO2roNGWG7UxX7cAXYrLF-1Mcx-0&_nc_zt=23&_nc_ht=scontent.fmnl13-2.fna&_nc_gid=wTQwgQEABvYqEfEMy_a5oQ&oh=00_AfbNk02ESSPSSVy5lIssxVbTEcpEML7VdHZu41HgPiYL8g&oe=68D12C7E" 
                  alt="Mick Daniel Q. Morales - IT Developer" 
                />
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