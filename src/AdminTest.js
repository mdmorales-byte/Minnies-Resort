import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AdminTest = () => {
  const { isAuthenticated, isSuperAdmin, user, loading } = useAuth();
  const [apiTests, setApiTests] = useState({});
  const [testingApi, setTestingApi] = useState(false);

  const testApiEndpoints = async () => {
    if (!user?.token) {
      console.log('No token available for testing');
      return;
    }

    setTestingApi(true);
    const results = {};
    const headers = {
      'Authorization': `Bearer ${user.token}`,
      'Content-Type': 'application/json'
    };

    // Test dashboard endpoint
    try {
      const response = await fetch('/api/admin/dashboard', { headers });
      const data = await response.json();
      results.dashboard = {
        status: response.status,
        success: data.success,
        message: data.message || 'OK',
        hasData: !!data.stats
      };
    } catch (error) {
      results.dashboard = { error: error.message };
    }

    // Test bookings endpoint
    try {
      const response = await fetch('/api/bookings', { headers });
      const data = await response.json();
      results.bookings = {
        status: response.status,
        success: data.success,
        message: data.message || 'OK',
        count: data.bookings?.length || 0
      };
    } catch (error) {
      results.bookings = { error: error.message };
    }

    // Test contacts endpoint
    try {
      const response = await fetch('/api/contacts', { headers });
      const data = await response.json();
      results.contacts = {
        status: response.status,
        success: data.success,
        message: data.message || 'OK',
        count: data.contacts?.length || 0
      };
    } catch (error) {
      results.contacts = { error: error.message };
    }

    // Test users endpoint (should fail for regular admin)
    try {
      const response = await fetch('/api/users', { headers });
      const data = await response.json();
      results.users = {
        status: response.status,
        success: data.success,
        message: data.message || 'OK',
        shouldFail: !isSuperAdmin
      };
    } catch (error) {
      results.users = { error: error.message };
    }

    setApiTests(results);
    setTestingApi(false);
  };

  useEffect(() => {
    if (isAuthenticated && user?.token) {
      testApiEndpoints();
    }
  }, [isAuthenticated, user?.token]);

  const getStatusColor = (test) => {
    if (test.error) return '#f44336';
    if (test.success) return '#4caf50';
    return '#ff9800';
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: 'white', margin: '2rem', borderRadius: '10px' }}>
      <h2>🧪 Admin System Diagnostic</h2>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>Authentication Status</h3>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Loading:</strong> <span style={{ color: loading ? '#ff9800' : '#4caf50' }}>{loading ? 'Yes' : 'No'}</span>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Is Authenticated:</strong> <span style={{ color: isAuthenticated ? '#4caf50' : '#f44336' }}>{isAuthenticated ? 'Yes' : 'No'}</span>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Is Super Admin:</strong> <span style={{ color: isSuperAdmin ? '#2196f3' : '#ff9800' }}>{isSuperAdmin ? 'Yes' : 'No'}</span>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>User Role:</strong> <span style={{ color: '#333' }}>{user?.role || 'None'}</span>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>User Email:</strong> <span style={{ color: '#333' }}>{user?.email || 'None'}</span>
        </div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Has Token:</strong> <span style={{ color: user?.token ? '#4caf50' : '#f44336' }}>{user?.token ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>API Endpoint Tests</h3>
        {testingApi ? (
          <p>Testing API endpoints...</p>
        ) : (
          <div>
            <button 
              onClick={testApiEndpoints}
              style={{ 
                padding: '0.5rem 1rem', 
                backgroundColor: '#2196f3', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px',
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh API Tests
            </button>
            
            {Object.keys(apiTests).length > 0 && (
              <div>
                {Object.entries(apiTests).map(([endpoint, test]) => (
                  <div key={endpoint} style={{ 
                    marginBottom: '1rem', 
                    padding: '0.5rem', 
                    border: `2px solid ${getStatusColor(test)}`,
                    borderRadius: '5px'
                  }}>
                    <strong>{endpoint.toUpperCase()}:</strong>
                    <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      {test.error ? (
                        <span style={{ color: '#f44336' }}>❌ Error: {test.error}</span>
                      ) : (
                        <>
                          <span style={{ color: getStatusColor(test) }}>
                            {test.success ? '✅' : '❌'} Status: {test.status} - {test.message}
                          </span>
                          {test.count !== undefined && (
                            <span style={{ marginLeft: '1rem' }}>📊 Count: {test.count}</span>
                          )}
                          {test.hasData && (
                            <span style={{ marginLeft: '1rem' }}>📈 Has Data: Yes</span>
                          )}
                          {test.shouldFail && !test.success && (
                            <span style={{ marginLeft: '1rem', color: '#4caf50' }}>🔒 Correctly Restricted</span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>Local Storage Debug</h3>
        <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', backgroundColor: 'white', padding: '1rem', borderRadius: '3px' }}>
          <strong>authData:</strong><br />
          {localStorage.getItem('authData') || 'None'}
        </div>
      </div>
    </div>
  );
};

export default AdminTest;
