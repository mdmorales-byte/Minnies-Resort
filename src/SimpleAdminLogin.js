import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SimpleAdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username === 'superadmin' && password === 'MinniesFarm2025!') {
      // Store auth in localStorage
      localStorage.setItem('minniesAuth', JSON.stringify({
        user: { username: 'superadmin', email: 'admin@minniesfarmresort.com', role: 'superadmin' },
        isSuperAdmin: true,
        expiry: Date.now() + (24 * 60 * 60 * 1000)
      }));
      alert('Super Admin login successful! Redirecting to dashboard...');
      navigate('/admin/super-dashboard');
    } else if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('minniesAuth', JSON.stringify({
        user: { username: 'admin', email: 'staff@minniesfarmresort.com', role: 'admin' },
        isSuperAdmin: false,
        expiry: Date.now() + (24 * 60 * 60 * 1000)
      }));
      alert('Admin login successful!');
      navigate('/admin/bookings');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a2f0d',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          textAlign: 'center',
          color: '#2d5016',
          marginBottom: '2rem',
          fontSize: '2rem'
        }}>
          Admin Login
        </h1>
        
        {error && (
          <div style={{
            backgroundColor: '#fed7d7',
            color: '#c53030',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Password:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#e67e22',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Login
          </button>
        </form>

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '0.9rem'
        }}>
          <h3 style={{ color: '#2d5016', marginBottom: '1rem' }}>Demo Credentials:</h3>
          <p><strong>Super Admin:</strong> superadmin / MinniesFarm2025!</p>
          <p><strong>Admin:</strong> admin / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleAdminLogin;
