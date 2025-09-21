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
import AdminDashboard from './AdminDashboard';
import SuperAdminLogin from './SuperAdminLogin';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminTest from './AdminTest';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // No backend connection needed - using local authentication

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
          <Route path="/admin/bookings" element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute><ContactMessages /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireSuperAdmin={true}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/login" element={<SuperAdminLogin />} />
          <Route path="/admin/super-dashboard" element={<ProtectedRoute requireSuperAdmin={true}><SuperAdminDashboard /></ProtectedRoute>} />
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