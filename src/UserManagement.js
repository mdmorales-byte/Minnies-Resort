import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { adminAPI } from './services/api';

const UserManagement = () => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!loading && (!isAuthenticated || !isSuperAdmin)) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, isSuperAdmin, loading, navigate]);

  // Fetch users from API
  useEffect(() => {
    if (isAuthenticated && isSuperAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isSuperAdmin]);

  // Filter users when search term or role filter changes
  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      setDataLoading(true);
      setError('');
      const data = await adminAPI.getUsers();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    }

    setFilteredUsers(filtered);
  };

  const createUser = async (userData) => {
    try {
      await adminAPI.createUser(userData);
      setSuccess('User created successfully!');
      await fetchUsers();
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error.message || 'Failed to create user. Please try again.');
    }
  };

  const updateUser = async (id, userData) => {
    try {
      await adminAPI.updateUser(id, userData);
      setSuccess('User updated successfully!');
      await fetchUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error.message || 'Failed to update user. Please try again.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(id);
      setSuccess('User deleted successfully!');
      await fetchUsers();
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError(error.message || 'Failed to delete user. Please try again.');
    }
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return '#9c27b0';
      case 'admin': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin': return 'fas fa-crown';
      case 'admin': return 'fas fa-user-shield';
      default: return 'fas fa-user';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="user-management">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem',
          color: '#4a7c59'
        }}>
          <i className="fas fa-spinner fa-spin" style={{ marginRight: '1rem' }}></i>
          Loading...
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not super admin
  if (!isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="admin-header-bar">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-users-cog"></i>
              User Management
            </h1>
            <p>Manage admin users and permissions</p>
          </div>
          <div className="header-right">
            <button 
              className="btn-create"
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'rgba(76, 175, 80, 0.2)',
                color: 'white',
                border: '2px solid rgba(76, 175, 80, 0.3)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginRight: '1rem'
              }}
            >
              <i className="fas fa-plus"></i>
              Create User
            </button>
            <button 
              className="btn-refresh"
              onClick={fetchUsers}
              disabled={dataLoading}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <i className={`fas fa-sync-alt ${dataLoading ? 'fa-spin' : ''}`}></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="users-filters" style={{
        background: 'white',
        padding: '2rem',
        marginBottom: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: '2rem',
          alignItems: 'end'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Search Users
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Role Filter */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Results Count */}
          <div style={{
            textAlign: 'right',
            color: '#5a5a5a',
            fontSize: '0.9rem'
          }}>
            <strong>{filteredUsers.length}</strong> users found
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: '#fed7d7',
          color: '#c53030',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          background: '#d4edda',
          color: '#155724',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}

      {/* Users Table */}
      <div className="users-table-container" style={{
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        {dataLoading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4rem',
            color: '#5a5a5a'
          }}>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '1rem' }}></i>
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#5a5a5a'
          }}>
            <i className="fas fa-users" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <h3>No users found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="users-table" style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  borderBottom: '2px solid #e2e8f0'
                }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>User</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Created</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} style={{
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${getRoleColor(user.role)} 0%, ${getRoleColor(user.role)}80 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '1.2rem'
                        }}>
                          <i className={getRoleIcon(user.role)}></i>
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#2c3e50' }}>
                            {user.name}
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#5a5a5a' }}>
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#2c3e50', fontWeight: '500' }}>
                        {user.email}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        background: `${getRoleColor(user.role)}20`,
                        color: getRoleColor(user.role),
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        width: 'fit-content',
                        textTransform: 'capitalize'
                      }}>
                        <i className={getRoleIcon(user.role)}></i>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#5a5a5a' }}>
                      {formatDate(user.created_at)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button
                        onClick={() => openUserDetails(user)}
                        style={{
                          background: '#4a7c59',
                          color: 'white',
                          border: 'none',
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2d5016'}
                        onMouseLeave={(e) => e.target.style.background = '#4a7c59'}
                      >
                        <i className="fas fa-edit" style={{ marginRight: '0.25rem' }}></i>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '2rem'
        }}>
          <div className="modal-content" style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e2e8f0'
            }}>
              <h2 style={{ margin: 0, color: '#2c3e50' }}>
                User Details
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#5a5a5a'
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {/* User Information */}
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>User Information</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Name:</strong> {selectedUser.name}</div>
                  <div><strong>Email:</strong> {selectedUser.email}</div>
                  <div><strong>Role:</strong> 
                    <span style={{
                      background: `${getRoleColor(selectedUser.role)}20`,
                      color: getRoleColor(selectedUser.role),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginLeft: '0.5rem',
                      textTransform: 'capitalize'
                    }}>
                      {selectedUser.role.replace('_', ' ')}
                    </span>
                  </div>
                  <div><strong>Created:</strong> {formatDate(selectedUser.created_at)}</div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '2px solid #e2e8f0'
              }}>
                <button
                  onClick={() => deleteUser(selectedUser.id)}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    flex: 1
                  }}
                >
                  <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i>
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal 
          onClose={closeCreateModal}
          onCreate={createUser}
        />
      )}
    </div>
  );
};

// Create User Modal Component
const CreateUserModal = ({ onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      await onCreate(formData);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'admin'
      });
    } catch (error) {
      console.error('Create user error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div className="modal-content" style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>
            Create New User
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#5a5a5a'
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${errors.name ? '#f44336' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            {errors.name && (
              <div style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${errors.email ? '#f44336' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            {errors.email && (
              <div style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.email}
              </div>
            )}
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter password (min 6 characters)"
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${errors.password ? '#f44336' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            />
            {errors.password && (
              <div style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.password}
              </div>
            )}
          </div>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Role *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              style={{
                width: '100%',
                padding: '1rem',
                border: `2px solid ${errors.role ? '#f44336' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            {errors.role && (
              <div style={{ color: '#f44336', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {errors.role}
              </div>
            )}
          </div>

          <div style={{
            display: 'flex',
            gap: '1rem',
            paddingTop: '1rem',
            borderTop: '2px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                flex: 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                flex: 1,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i>
                  Creating...
                </>
              ) : (
                <>
                  <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;

