import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3><i className="fas fa-seedling"></i> Minnie's Farm Resort</h3>
            <p>Your peaceful retreat in the heart of Camarines Norte. Experience the perfect blend of rustic charm and modern comfort.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Contact Info</h4>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>Purok 1, Matnog, Basud, 4608 Camarines Norte</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <span>09666619229</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>info@minniesfarmresort.com</span>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/accommodations">Accommodations</Link></li>
              <li><Link to="/booking">Book Now</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Stay updated with our latest offers and news</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit"><i className="fas fa-paper-plane"></i></button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Minnie's Farm Resort. All rights reserved. | Developed by Mick Daniel Q. Morales</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
