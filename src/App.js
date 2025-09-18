import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import { NotificationProvider } from './components/NotificationSystem';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import About from './About';
import Accommodations from './Accommodations';
import Booking from './Booking';
import BookingSuccess from './BookingSuccess';
import Contact from './Contact';
import AdminBookings from './AdminBookings';
import ContactMessages from './ContactMessages';
import UserManagement from './UserManagement';
import SimpleAdminLogin from './SimpleAdminLogin';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminTest from './AdminTest';
import { testBackendConnection } from './test-integration';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // Test backend connection on app load
  useEffect(() => {
    testBackendConnection();
  }, []);

  return (
    <div className="App">
      {!isAdminPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/accommodations" element={<Accommodations />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking-success/:id" element={<BookingSuccess />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/messages" element={<ContactMessages />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/login" element={<SimpleAdminLogin />} />
          <Route path="/admin/super-dashboard" element={<SuperAdminDashboard />} />
          <Route path="/admin/test" element={<AdminTest />} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            <Router>
              <AppContent />
            </Router>
          </div>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;