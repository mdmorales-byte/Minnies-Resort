// Global error handling utilities

export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const ErrorMessages = {
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTH_ERROR: 'Authentication failed. Please log in again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

export class AppError extends Error {
  constructor(message, type = ErrorTypes.UNKNOWN_ERROR, statusCode = 500, details = null) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

export const handleApiError = (error) => {
  console.error('API Error:', error);

  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return new AppError(
          data.message || 'Invalid request',
          ErrorTypes.VALIDATION_ERROR,
          status,
          data
        );
      case 401:
        return new AppError(
          'Authentication required',
          ErrorTypes.AUTH_ERROR,
          status,
          data
        );
      case 403:
        return new AppError(
          'Access denied',
          ErrorTypes.AUTH_ERROR,
          status,
          data
        );
      case 404:
        return new AppError(
          'Resource not found',
          ErrorTypes.VALIDATION_ERROR,
          status,
          data
        );
      case 422:
        return new AppError(
          data.message || 'Validation failed',
          ErrorTypes.VALIDATION_ERROR,
          status,
          data
        );
      case 500:
        return new AppError(
          'Internal server error',
          ErrorTypes.SERVER_ERROR,
          status,
          data
        );
      default:
        return new AppError(
          data.message || 'Server error occurred',
          ErrorTypes.SERVER_ERROR,
          status,
          data
        );
    }
  } else if (error.request) {
    // Network error
    return new AppError(
      'Unable to connect to the server',
      ErrorTypes.NETWORK_ERROR,
      0,
      { originalError: error.message }
    );
  } else {
    // Other error
    return new AppError(
      error.message || 'An unexpected error occurred',
      ErrorTypes.UNKNOWN_ERROR,
      0,
      { originalError: error }
    );
  }
};

export const getErrorMessage = (error) => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error.type && ErrorMessages[error.type]) {
    return ErrorMessages[error.type];
  }
  
  return ErrorMessages.UNKNOWN_ERROR;
};

export const getErrorType = (error) => {
  if (error instanceof AppError) {
    return error.type;
  }
  
  return ErrorTypes.UNKNOWN_ERROR;
};

export const shouldRetry = (error) => {
  if (error instanceof AppError) {
    return error.type === ErrorTypes.NETWORK_ERROR || 
           error.type === ErrorTypes.SERVER_ERROR;
  }
  
  return false;
};

export const logError = (error, context = {}) => {
  const errorLog = {
    message: error.message,
    type: getErrorType(error),
    timestamp: new Date().toISOString(),
    context,
    stack: error.stack,
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  console.error('Error logged:', errorLog);
  
  // In production, you might want to send this to an error reporting service
  // Example: errorReportingService.captureException(error, { extra: context });
};

export const showErrorNotification = (error, showNotification) => {
  const message = getErrorMessage(error);
  const type = getErrorType(error);
  
  showNotification({
    type: 'error',
    title: 'Error',
    message: message,
    duration: type === ErrorTypes.NETWORK_ERROR ? 0 : 5000, // Network errors stay longer
    action: shouldRetry(error) ? {
      label: 'Retry',
      onClick: () => window.location.reload()
    } : null
  });
};

export const showSuccessNotification = (message, showNotification) => {
  showNotification({
    type: 'success',
    title: 'Success',
    message: message,
    duration: 3000
  });
};

export const showWarningNotification = (message, showNotification) => {
  showNotification({
    type: 'warning',
    title: 'Warning',
    message: message,
    duration: 4000
  });
};

export const showInfoNotification = (message, showNotification) => {
  showNotification({
    type: 'info',
    title: 'Info',
    message: message,
    duration: 3000
  });
};

