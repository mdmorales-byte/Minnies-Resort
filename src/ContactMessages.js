import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { contactAPI } from './services/api';

const ContactMessages = () => {
  const { isAuthenticated, isSuperAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, loading, navigate]);

  // Fetch messages from API
  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  // Filter messages when search term or status filter changes
  useEffect(() => {
    filterMessages();
  }, [messages, statusFilter, searchTerm]);

  const fetchMessages = async () => {
    try {
      setDataLoading(true);
      setError('');
      const data = await contactAPI.getAll();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];

    // Filter by status
    if (statusFilter) {
      filtered = filtered.filter(message => message.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(message => 
        message.name.toLowerCase().includes(term) ||
        message.email.toLowerCase().includes(term) ||
        message.subject.toLowerCase().includes(term) ||
        message.message.toLowerCase().includes(term)
      );
    }

    setFilteredMessages(filtered);
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      await contactAPI.updateStatus(messageId, newStatus);
      // Refresh messages list
      await fetchMessages();
      setShowModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error updating message status:', error);
      setError('Failed to update message status. Please try again.');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      return;
    }

    try {
      await contactAPI.delete(messageId);
      // Refresh messages list
      await fetchMessages();
      setShowModal(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message. Please try again.');
    }
  };

  const openMessageDetails = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return '#ff9800';
      case 'read': return '#4caf50';
      case 'replied': return '#2196f3';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'unread': return 'fas fa-envelope';
      case 'read': return 'fas fa-envelope-open';
      case 'replied': return 'fas fa-reply';
      default: return 'fas fa-question-circle';
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
      <div className="contact-messages">
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

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="contact-messages">
      {/* Header */}
      <div className="admin-header-bar">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <i className="fas fa-envelope"></i>
              Contact Messages
            </h1>
            <p>Manage customer inquiries and messages</p>
          </div>
          <div className="header-right">
            <button 
              className="btn-refresh"
              onClick={fetchMessages}
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
      <div className="messages-filters" style={{
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
              Search Messages
            </label>
            <input
              type="text"
              placeholder="Search by name, email, subject, or message..."
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

          {/* Status Filter */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: '600',
              color: '#2c3e50'
            }}>
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem'
              }}
            >
              <option value="">All Statuses</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
            </select>
          </div>

          {/* Results Count */}
          <div style={{
            textAlign: 'right',
            color: '#5a5a5a',
            fontSize: '0.9rem'
          }}>
            <strong>{filteredMessages.length}</strong> messages found
          </div>
        </div>
      </div>

      {/* Error Message */}
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

      {/* Messages List */}
      <div className="messages-list" style={{
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
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#5a5a5a'
          }}>
            <i className="fas fa-envelope-open" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
            <h3>No messages found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="messages-grid" style={{
            display: 'grid',
            gap: '1rem',
            padding: '1rem'
          }}>
            {filteredMessages.map((message) => (
              <div 
                key={message.id} 
                className="message-card"
                onClick={() => openMessageDetails(message)}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  background: message.status === 'unread' ? '#f8f9fa' : 'white'
                }}
                onMouseEnter={(e) => e.target.style.borderColor = '#4a7c59'}
                onMouseLeave={(e) => e.target.style.borderColor = '#e2e8f0'}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem'
                    }}>
                      <h3 style={{ margin: 0, color: '#2c3e50' }}>
                        {message.subject}
                      </h3>
                      {message.status === 'unread' && (
                        <span style={{
                          background: '#ff9800',
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          NEW
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#5a5a5a', fontSize: '0.9rem' }}>
                      From: <strong>{message.name}</strong> ({message.email})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      background: `${getStatusColor(message.status)}20`,
                      color: getStatusColor(message.status),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginBottom: '0.5rem'
                    }}>
                      <i className={getStatusIcon(message.status)}></i>
                      {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                    </div>
                    <div style={{ color: '#5a5a5a', fontSize: '0.8rem' }}>
                      {formatDate(message.created_at)}
                    </div>
                  </div>
                </div>
                <div style={{
                  color: '#5a5a5a',
                  lineHeight: '1.5',
                  maxHeight: '3em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {message.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Details Modal */}
      {showModal && selectedMessage && (
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
            maxWidth: '700px',
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
                Message Details
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
              {/* Sender Information */}
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Sender Information</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <div><strong>Name:</strong> {selectedMessage.name}</div>
                  <div><strong>Email:</strong> {selectedMessage.email}</div>
                  <div><strong>Subject:</strong> {selectedMessage.subject}</div>
                  <div><strong>Date:</strong> {formatDate(selectedMessage.created_at)}</div>
                  <div><strong>Status:</strong> 
                    <span style={{
                      background: `${getStatusColor(selectedMessage.status)}20`,
                      color: getStatusColor(selectedMessage.status),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      marginLeft: '0.5rem'
                    }}>
                      {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Message</h3>
                <div style={{
                  background: '#f8f9fa',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6'
                }}>
                  {selectedMessage.message}
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                paddingTop: '1rem',
                borderTop: '2px solid #e2e8f0'
              }}>
                {selectedMessage.status === 'unread' && (
                  <button
                    onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                    style={{
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      flex: 1
                    }}
                  >
                    <i className="fas fa-envelope-open" style={{ marginRight: '0.5rem' }}></i>
                    Mark as Read
                  </button>
                )}
                
                {selectedMessage.status === 'read' && (
                  <button
                    onClick={() => updateMessageStatus(selectedMessage.id, 'replied')}
                    style={{
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      flex: 1
                    }}
                  >
                    <i className="fas fa-reply" style={{ marginRight: '0.5rem' }}></i>
                    Mark as Replied
                  </button>
                )}

                <button
                  onClick={() => deleteMessage(selectedMessage.id)}
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
                  Delete Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;

