import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from './services/api';

// Create the authentication context
const AuthContext = createContext({});

// Default admin credentials (these are now handled by the backend)
const DEFAULT_CREDENTIALS = {
  admin: { email: 'admin@minniesfarm.com', password: 'admin123' },
  superAdmin: { email: 'superadmin@minniesfarm.com', password: 'superadmin123' }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await authAPI.verifyToken();
          if (response.valid) {
            setIsAuthenticated(true);
            setIsSuperAdmin(response.user.role === 'super_admin');
            setUser(response.user);
          } else {
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('authToken');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Store token in localStorage
      localStorage.setItem('authToken', response.token);
      
      // Update state
      setIsAuthenticated(true);
      setIsSuperAdmin(response.user.role === 'super_admin');
      setUser(response.user);
      
      return { success: true, isSuperAdmin: response.user.role === 'super_admin' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setIsSuperAdmin(false);
      setUser(null);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      // This would be implemented in the backend API
      // For now, return a placeholder response
      return { success: false, error: 'Password change feature coming soon' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.message || 'Password change failed' };
    }
  };

  const value = {
    isAuthenticated,
    isSuperAdmin,
    user,
    loading,
    login,
    logout,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;