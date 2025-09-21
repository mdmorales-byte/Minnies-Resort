import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const SuperAdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuthenticated, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      if (isSuperAdmin) {
        navigate('/admin/super-dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!username.trim()) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (!password) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      const result = await login(username.trim(), password);

      if (result.success) {
        if (result.isSuperAdmin) {
          navigate('/admin/super-dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(result.error || 'Invalid email or password. Please check your credentials and try again.');
        setPassword(''); // Clear password on error
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail, demoPassword) => {
    setUsername(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="admin-login-page" style={{ minHeight: '100vh', backgroundColor: '#1a2f0d', padding: '2rem' }}>
      <div className="login-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="login-card" style={{ backgroundColor: 'white', borderRadius: '24px', padding: '2rem' }}>
          <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <img
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&h=200&fit=crop&crop=center"
              alt="Minnie's Farm Resort"
              className="login-logo"
              style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '1rem' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x200/4a7c59/ffffff?text=MFR';
              }}
            />
            <h1 style={{ color: '#2d5016', marginBottom: '0.5rem' }}>Admin Portal</h1>
            <p style={{ color: '#5a5a5a' }}>Minnie's Farm Resort Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" style={{ marginBottom: '2rem' }}>
            {error && (
              <div className="error-message" style={{ 
                backgroundColor: '#fed7d7', 
                color: '#c53030', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="username" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                <i className="fas fa-user" style={{ marginRight: '0.5rem' }}></i>
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                disabled={loading}
                required
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid #e8f0fe',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="password" style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '600',
                color: '#2c3e50'
              }}>
                <i className="fas fa-lock" style={{ marginRight: '0.5rem' }}></i>
                Password
              </label>
              <div className="password-input-container" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #e8f0fe',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box',
                    paddingRight: '3rem'
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#a0aec0'
                  }}
                >
                  <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem 2rem',
                backgroundColor: '#e67e22',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Login
                </>
              )}
            </button>
          </form>

          <div className="login-footer" style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px',
            marginTop: '1rem'
          }}>
            <div className="login-info" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#2d5016', marginBottom: '1rem', fontSize: '1.1rem' }}>Access Levels:</h3>
              <div className="access-level" style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <strong style={{ color: '#4a7c59', display: 'block', marginBottom: '0.5rem' }}>Super Admin:</strong>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ padding: '0.2rem 0', color: '#5a5a5a' }}>• Full system access</li>
                  <li style={{ padding: '0.2rem 0', color: '#5a5a5a' }}>• User management</li>
                  <li style={{ padding: '0.2rem 0', color: '#5a5a5a' }}>• Analytics & reports</li>
                  <li style={{ padding: '0.2rem 0', color: '#5a5a5a' }}>• System settings</li>
                </ul>
              </div>
              <div className="access-level" style={{ 
                marginBottom: '1rem', 
                padding: '1rem', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <strong style={{ color: '#4a7c59', display: 'block', marginBottom: '0.5rem' }}>Admin:</strong>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ padding: '0.2rem 0', color: '#5a5a5a' }}>• Booking management</li>
                  <li style={{ padding: '0.2rem 0', color: '#5a5a5a' }}>• Basic reports</li>
                </ul>
              </div>
            </div>
            <div className="demo-credentials" style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ color: '#2d5016', marginBottom: '1rem', fontSize: '1.1rem' }}>Demo Credentials:</h3>
              <div className="credential-box" style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                border: '1px solid #dee2e6'
              }}>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#5a5a5a' }}>
                  <strong style={{ color: '#2d5016' }}>Super Admin:</strong>
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#5a5a5a' }}>Email: superadmin@minniesfarmresort.com</p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#5a5a5a' }}>Password: superadmin123</p>
                <button 
                  className="demo-login-btn"
                  onClick={() => handleDemoLogin('superadmin@minniesfarmresort.com', 'superadmin123')}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #4a7c59 0%, #6b9b7a 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.75rem',
                    width: '100%',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <i className="fas fa-play" style={{ marginRight: '0.5rem' }}></i>
                  Try Super Admin
                </button>
              </div>
              <div className="credential-box" style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '1rem', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                border: '1px solid #dee2e6'
              }}>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#5a5a5a' }}>
                  <strong style={{ color: '#2d5016' }}>Regular Admin:</strong>
                </p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#5a5a5a' }}>Email: admin@minniesfarmresort.com</p>
                <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#5a5a5a' }}>Password: admin123</p>
                <button 
                  className="demo-login-btn"
                  onClick={() => handleDemoLogin('admin@minniesfarmresort.com', 'admin123')}
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #4a7c59 0%, #6b9b7a 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '0.75rem',
                    width: '100%',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  <i className="fas fa-play" style={{ marginRight: '0.5rem' }}></i>
                  Try Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;