import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const SimpleAdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username === 'superadmin' && password === 'MinniesFarm2025!') {
      // Use AuthContext login function
      const success = login(username, password);
      if (success) {
        alert('Super Admin login successful! Redirecting to dashboard...');
        navigate('/admin/super-dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } else if (username === 'admin' && password === 'admin123') {
      // For regular admin, we'll handle it manually since AuthContext only handles super admin
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
      background: 'linear-gradient(135deg, #1a2f0d 0%, #2d5016 25%, #4a7c59 75%, #6b9b7a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        animation: 'float 6s ease-in-out infinite'
      }}></div>

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        padding: '2rem 2rem',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15), 0 8px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        width: '100%',
        maxWidth: '380px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2d5016 0%, #4a7c59 50%, #6b9b7a 100%)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
          }}>
            <span style={{
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 'bold'
            }}>🔐</span>
          </div>
          <h1 style={{
            color: '#2d5016',
            marginBottom: '0.25rem',
            fontSize: '1.8rem',
            fontWeight: '800',
            letterSpacing: '-1px'
          }}>
            Admin Login
          </h1>
          <p style={{
            color: '#5a5a5a',
            fontSize: '0.9rem',
            fontWeight: '400',
            margin: 0
          }}>
            Access the admin dashboard
          </p>
        </div>
        
        {error && (
          <div style={{
            background: 'linear-gradient(135deg, #fed7d7 0%, #fecaca 100%)',
            color: '#c53030',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            border: '1px solid #feb2b2',
            boxShadow: '0 4px 12px rgba(239, 83, 80, 0.1)'
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              color: '#2c3e50',
              fontWeight: '700',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <span style={{ color: '#4a7c59', fontSize: '1rem' }}>👤</span>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '2px solid #e8f0fe',
                borderRadius: '12px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                background: '#fafbfc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4a7c59';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(74, 124, 89, 0.1), 0 3px 15px rgba(74, 124, 89, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8f0fe';
                e.target.style.background = '#fafbfc';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem',
              color: '#2c3e50',
              fontWeight: '700',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              <span style={{ color: '#4a7c59', fontSize: '1rem' }}>🔒</span>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '1rem 1.25rem',
                border: '2px solid #e8f0fe',
                borderRadius: '12px',
                fontSize: '1rem',
                boxSizing: 'border-box',
                fontWeight: '500',
                transition: 'all 0.3s ease',
                background: '#fafbfc'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4a7c59';
                e.target.style.background = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(74, 124, 89, 0.1), 0 3px 15px rgba(74, 124, 89, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8f0fe';
                e.target.style.background = '#fafbfc';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              background: 'linear-gradient(135deg, #e67e22 0%, #d2691e 50%, #c0392b 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.5rem',
              boxShadow: '0 6px 15px rgba(230, 126, 34, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(230, 126, 34, 0.4), 0 4px 12px rgba(0, 0, 0, 0.15)';
              e.target.style.background = 'linear-gradient(135deg, #f39c12 0%, #e67e22 50%, #d2691e 100%)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 15px rgba(230, 126, 34, 0.3), 0 3px 8px rgba(0, 0, 0, 0.1)';
              e.target.style.background = 'linear-gradient(135deg, #e67e22 0%, #d2691e 50%, #c0392b 100%)';
            }}
          >
            <span>🚀</span>
            Login
          </button>
        </form>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default SimpleAdminLogin;
