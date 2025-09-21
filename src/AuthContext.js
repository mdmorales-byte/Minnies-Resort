import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext({});

// Demo admin credentials - works completely offline
const DEMO_CREDENTIALS = {
  'admin@minniesfarmresort.com': {
    password: 'admin123',
    role: 'admin',
    name: 'Admin User',
    email: 'admin@minniesfarmresort.com'
  },
  'superadmin@minniesfarmresort.com': {
    password: 'superadmin123',
    role: 'super_admin',
    name: 'Super Admin',
    email: 'superadmin@minniesfarmresort.com'
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authData = localStorage.getItem('authData');
        if (authData) {
          const userData = JSON.parse(authData);
          setIsAuthenticated(true);
          setIsSuperAdmin(userData.role === 'super_admin');
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authData');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    try {
      // Make API call to backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: username, // Backend expects username field
          password: password 
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      if (result.success) {
        // Store token and user data
        const userData = {
          ...result.user,
          token: result.token,
          loginTime: new Date().toISOString()
        };

        localStorage.setItem('authData', JSON.stringify(userData));
        localStorage.setItem('authToken', result.token);
        
        // Update state
        setIsAuthenticated(true);
        setIsSuperAdmin(userData.role === 'superadmin');
        setUser(userData);
        
        return { 
          success: true, 
          isSuperAdmin: userData.role === 'superadmin',
          user: userData
        };
      } else {
        throw new Error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please check your credentials and try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Clear localStorage
      localStorage.removeItem('authData');
      localStorage.removeItem('authToken');
      
      // Reset state
      setIsAuthenticated(false);
      setIsSuperAdmin(false);
      setUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear state even if there's an error
      localStorage.removeItem('authData');
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setIsSuperAdmin(false);
      setUser(null);
      
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      // For demo purposes, just return success
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Password changed successfully (demo mode)' };
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
    changePassword,
    // Helper function to get demo credentials
    getDemoCredentials: () => DEMO_CREDENTIALS
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