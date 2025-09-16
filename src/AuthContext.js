import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the authentication context
const AuthContext = createContext({});

// Super Admin credentials (In production, this should be in a secure backend)
const SUPER_ADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'MinniesFarm2025!', // Default password - should be changed
  email: 'admin@minniesfarmresort.com'
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('minniesAuth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.expiry > Date.now()) {
          setIsAuthenticated(true);
          setIsSuperAdmin(authData.isSuperAdmin);
          setUser(authData.user);
        } else {
          localStorage.removeItem('minniesAuth');
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
        localStorage.removeItem('minniesAuth');
      }
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Check super admin credentials
    if (username === SUPER_ADMIN_CREDENTIALS.username &&
        password === SUPER_ADMIN_CREDENTIALS.password) {
      const authData = {
        user: {
          username: SUPER_ADMIN_CREDENTIALS.username,
          email: SUPER_ADMIN_CREDENTIALS.email,
          role: 'superadmin',
          loginTime: Date.now()
        },
        isSuperAdmin: true,
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      localStorage.setItem('minniesAuth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setIsSuperAdmin(true);
      setUser(authData.user);
      return { success: true, isSuperAdmin: true };
    }

    // Check regular admin credentials (can be extended)
    if (username === 'admin' && password === 'admin123') {
      const authData = {
        user: {
          username: 'admin',
          email: 'staff@minniesfarmresort.com',
          role: 'admin',
          loginTime: Date.now()
        },
        isSuperAdmin: false,
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };

      localStorage.setItem('minniesAuth', JSON.stringify(authData));
      setIsAuthenticated(true);
      setIsSuperAdmin(false);
      setUser(authData.user);
      return { success: true, isSuperAdmin: false };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    localStorage.removeItem('minniesAuth');
    setIsAuthenticated(false);
    setIsSuperAdmin(false);
    setUser(null);
  };

  const changePassword = (currentPassword, newPassword) => {
    if (isSuperAdmin && currentPassword === SUPER_ADMIN_CREDENTIALS.password) {
      // In production, this would update the password in the backend
      alert('Password change would be processed in production environment');
      return { success: true };
    }
    return { success: false, error: 'Current password is incorrect' };
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