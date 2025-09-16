import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import About from './About';
import Accommodations from './Accommodations';
import Booking from './Booking';
import BookingSuccess from './BookingSuccess';
import Contact from './Contact';
import AdminBookings from './AdminBookings';
import SuperAdminLogin from './SuperAdminLogin';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminTest from './AdminTest';
import './App.css';

function App() {
  return (
    <AuthProvider>
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
                <Route path="/admin/login" element={<SuperAdminLogin />} />
                <Route path="/admin/super-dashboard" element={<SuperAdminDashboard />} />
                <Route path="/admin/test" element={<AdminTest />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;