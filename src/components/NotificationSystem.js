import React, { useState, useEffect, createContext, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, notification.duration);
      return () => clearTimeout(timer);
    }
  }, [notification.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Match CSS transition duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  const getStyles = () => {
    const baseStyles = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      marginBottom: '0.75rem',
      maxWidth: '400px',
      minWidth: '300px',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible && !isLeaving ? 1 : 0,
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    };

    switch (notification.type) {
      case 'success':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
          border: '1px solid #c3e6cb',
          color: '#155724'
        };
      case 'error':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
          border: '1px solid #f5c6cb',
          color: '#721c24'
        };
      case 'warning':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
          border: '1px solid #ffeaa7',
          color: '#856404'
        };
      case 'info':
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%)',
          border: '1px solid #bee5eb',
          color: '#0c5460'
        };
      default:
        return {
          ...baseStyles,
          background: 'linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%)',
          border: '1px solid #d6d8db',
          color: '#383d41'
        };
    }
  };

  return (
    <div style={getStyles()} onClick={handleRemove}>
      {/* Progress bar for timed notifications */}
      {notification.duration > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: 'rgba(0, 0, 0, 0.2)',
            width: '100%',
            transform: 'scaleX(1)',
            transformOrigin: 'left',
            animation: `shrink ${notification.duration}ms linear forwards`
          }}
        />
      )}
      
      <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>
        {getIcon()}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        {notification.title && (
          <div style={{
            fontWeight: '600',
            marginBottom: '0.25rem',
            fontSize: '0.9rem'
          }}>
            {notification.title}
          </div>
        )}
        <div style={{
          fontSize: '0.9rem',
          lineHeight: '1.4',
          wordBreak: 'break-word'
        }}>
          {notification.message}
        </div>
        
        {notification.action && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              notification.action.onClick();
              handleRemove();
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.1)',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '0.5rem',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.1)'}
          >
            {notification.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleRemove();
        }}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          padding: '0',
          color: 'inherit',
          opacity: 0.7,
          transition: 'opacity 0.2s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => e.target.style.opacity = '1'}
        onMouseLeave={(e) => e.target.style.opacity = '0.7'}
      >
        ×
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 3000,
      ...notification
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const showNotification = (notification) => {
    return addNotification(notification);
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    showNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  );
};

const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      maxHeight: '80vh',
      overflowY: 'auto',
      padding: '0.5rem'
    }}>
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
      
      <style jsx>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationProvider;

