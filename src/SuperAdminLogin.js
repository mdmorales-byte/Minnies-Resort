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

    // Simulate loading time for better UX
    setTimeout(() => {
      const result = login(username.trim(), password);

      if (result.success) {
        if (result.isSuperAdmin) {
          navigate('/admin/super-dashboard');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        setError(result.error || 'Invalid username or password. Please check your credentials and try again.');
        setPassword(''); // Clear password on error
      }

      setLoading(false);
    }, 1000); // 1 second delay for demo purposes
  };

  const handleDemoLogin = (demoUsername, demoPassword) => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&h=200&fit=crop&crop=center"
              alt="Minnie's Farm Resort"
              className="login-logo"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200x200/4a7c59/ffffff?text=MFR';
              }}
            />
            <h1>Admin Portal</h1>
            <p>Minnie's Farm Resort Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="username">
                <i className="fas fa-user"></i>
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-login"
              disabled={loading}
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

          <div className="login-footer">
            <div className="login-info">
              <h3>Access Levels:</h3>
              <div className="access-level">
                <strong>Super Admin:</strong>
                <ul>
                  <li>Full system access</li>
                  <li>User management</li>
                  <li>Analytics & reports</li>
                  <li>System settings</li>
                </ul>
              </div>
              <div className="access-level">
                <strong>Admin:</strong>
                <ul>
                  <li>Booking management</li>
                  <li>Basic reports</li>
                </ul>
              </div>
            </div>
            <div className="demo-credentials">
              <h3>Demo Credentials:</h3>
              <div className="credential-box">
                <p><strong>Super Admin:</strong></p>
                <p>Username: superadmin</p>
                <p>Password: MinniesFarm2025!</p>
                <button 
                  className="demo-login-btn"
                  onClick={() => handleDemoLogin('superadmin', 'MinniesFarm2025!')}
                  disabled={loading}
                >
                  <i className="fas fa-play"></i>
                  Try Super Admin
                </button>
              </div>
              <div className="credential-box">
                <p><strong>Regular Admin:</strong></p>
                <p>Username: admin</p>
                <p>Password: admin123</p>
                <button 
                  className="demo-login-btn"
                  onClick={() => handleDemoLogin('admin', 'admin123')}
                  disabled={loading}
                >
                  <i className="fas fa-play"></i>
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