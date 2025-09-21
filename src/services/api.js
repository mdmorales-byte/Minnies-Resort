// API configuration and service functions
import { handleApiError, AppError, ErrorTypes } from '../utils/errorHandler';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  // Try to get token from authToken first (direct storage)
  const directToken = localStorage.getItem('authToken');
  if (directToken) {
    return directToken;
  }
  
  // Fallback to authData (JSON storage)
  try {
    const authData = localStorage.getItem('authData');
    if (authData) {
      const userData = JSON.parse(authData);
      return userData.token;
    }
    return null;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      throw handleApiError({
        response: {
          status: response.status,
          data: data
        }
      });
    }

    return data;
  } catch (error) {
    // If it's already an AppError, re-throw it
    if (error instanceof AppError) {
      throw error;
    }
    
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw handleApiError({
        request: true,
        message: error.message
      });
    }
    
    // Handle other errors
    throw handleApiError({
      message: error.message || 'An unexpected error occurred'
    });
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  verifyToken: async () => {
    return apiRequest('/auth/verify');
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Bookings API
export const bookingsAPI = {
  create: async (bookingData) => {
    return apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/bookings${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/bookings/${id}`);
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id) => {
    return apiRequest(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin API
export const adminAPI = {
  getStats: async () => {
    return apiRequest('/admin/stats');
  },

  getUsers: async () => {
    return apiRequest('/admin/users');
  },

  createUser: async (userData) => {
    return apiRequest('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id, userData) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id) => {
    return apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Contact API
export const contactAPI = {
  submit: async (messageData) => {
    return apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/contacts${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/contacts/${id}`);
  },

  updateStatus: async (id, status) => {
    return apiRequest(`/contacts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id) => {
    return apiRequest(`/contacts/${id}`, {
      method: 'DELETE',
    });
  },
};

// Images API
export const imagesAPI = {
  upload: async (formData) => {
    const token = getAuthToken();
    const url = `${API_BASE_URL}/images/upload`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed');
    }
    return data;
  },

  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/images${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return apiRequest(`/images/${id}`);
  },

  update: async (id, imageData) => {
    return apiRequest(`/images/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(imageData),
    });
  },

  delete: async (id) => {
    return apiRequest(`/images/${id}`, {
      method: 'DELETE',
    });
  },

  setHero: async (id, isHero) => {
    return apiRequest(`/images/${id}/hero`, {
      method: 'PATCH',
      body: JSON.stringify({ is_hero: isHero }),
    });
  },
};

// Export API
export const exportAPI = {
  exportBookingsCSV: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/export/bookings/csv${queryString ? `?${queryString}` : ''}`;
    const token = getAuthToken();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export CSV');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  exportBookingsExcel: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/export/bookings/excel${queryString ? `?${queryString}` : ''}`;
    const token = getAuthToken();
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export Excel');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `bookings-export-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  createBackup: async () => {
    const url = `${API_BASE_URL}/export/backup`;
    const token = getAuthToken();
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create backup');
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `minnies-resort-backup-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  },

  getExportStats: async () => {
    return apiRequest('/export/stats');
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return apiRequest('/health');
  },
};

export default {
  authAPI,
  bookingsAPI,
  adminAPI,
  contactAPI,
  imagesAPI,
  exportAPI,
  healthAPI,
};

