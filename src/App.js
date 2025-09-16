import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import About from './About';
import Accommodations from './Accommodations';
import Booking from './Booking';
import BookingSuccess from './BookingSuccess';
import Contact from './Contact';
import AdminBookings from './AdminBookings';
import './App.css';

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Router>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/accommodations" element={<Accommodations />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/booking-success/:id" element={<BookingSuccess />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </div>
  );
}

export default App;