import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          <i className="fas fa-seedling"></i>
          <span>Minnie's Farm Resort</span>
        </Link>
        
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`} id="navMenu">
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Home
          </Link>
          <Link to="/about" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            About
          </Link>
          <Link to="/accommodations" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Accommodations
          </Link>
          <Link to="/booking" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Book Now
          </Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsMenuOpen(false)}>
            Contact
          </Link>
          <Link to="/admin/login" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
            <i className="fas fa-user-shield"></i>
            Admin
          </Link>
        </div>
        
        <div 
          className={`nav-toggle ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;