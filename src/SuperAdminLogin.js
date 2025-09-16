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

    if (!username || !password) {
      setError('Please enter both username and password');
      setLoading(false);
      return;
    }

    const result = login(username, password);

    if (result.success) {
      if (result.isSuperAdmin) {
        navigate('/admin/super-dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } else {
      setError(result.error || 'Invalid credentials');
      setPassword('');
    }

    setLoading(false);
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <img
              src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=200&h=200&fit=crop"
              alt="Minnie's Farm Resort"
              className="login-logo"
            />
            <h1>Admin Portal</h1>
            <p>Minnie's Farm Resort Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
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
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
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
              </div>
              <div className="credential-box">
                <p><strong>Regular Admin:</strong></p>
                <p>Username: admin</p>
                <p>Password: admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminLogin;