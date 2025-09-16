import React from 'react';
import { useAuth } from './AuthContext';

const AdminTest = () => {
  const { isAuthenticated, isSuperAdmin, user, loading } = useAuth();

  return (
    <div style={{ padding: '2rem', backgroundColor: 'white', margin: '2rem', borderRadius: '10px' }}>
      <h2>Admin Authentication Test</h2>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Is Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Is Super Admin:</strong> {isSuperAdmin ? 'Yes' : 'No'}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <strong>Local Storage:</strong> {localStorage.getItem('minniesAuth') ? 'Has auth data' : 'No auth data'}
      </div>
    </div>
  );
};

export default AdminTest;
