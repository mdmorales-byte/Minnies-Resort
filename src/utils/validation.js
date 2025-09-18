// Comprehensive validation utilities

export const ValidationRules = {
  // Email validation
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },

  // Password validation
  password: {
    required: true,
    minLength: 6,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    message: 'Password must be at least 6 characters with uppercase, lowercase, and number'
  },

  // Phone validation (Philippines format)
  phone: {
    required: true,
    pattern: /^(\+63|0)?[0-9]{10}$/,
    message: 'Please enter a valid Philippine phone number'
  },

  // Name validation
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
  },

  // Date validation
  date: {
    required: true,
    future: true,
    message: 'Please select a future date'
  },

  // Number validation
  number: {
    required: true,
    min: 1,
    max: 100,
    message: 'Please enter a valid number between 1 and 100'
  },

  // Text validation
  text: {
    required: true,
    minLength: 1,
    maxLength: 1000,
    message: 'Text must be between 1 and 1000 characters'
  }
};

export class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.timestamp = new Date().toISOString();
  }
}

export const validateField = (value, rules, fieldName = 'Field') => {
  const errors = [];

  // Required validation
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(`${fieldName} is required`);
    return errors;
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return errors;
  }

  const stringValue = value.toString().trim();

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters`);
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`${fieldName} must be no more than ${rules.maxLength} characters`);
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(rules.message || `${fieldName} format is invalid`);
  }

  // Min value validation (for numbers)
  if (rules.min !== undefined && !isNaN(stringValue) && parseFloat(stringValue) < rules.min) {
    errors.push(`${fieldName} must be at least ${rules.min}`);
  }

  // Max value validation (for numbers)
  if (rules.max !== undefined && !isNaN(stringValue) && parseFloat(stringValue) > rules.max) {
    errors.push(`${fieldName} must be no more than ${rules.max}`);
  }

  // Future date validation
  if (rules.future && !isNaN(Date.parse(stringValue))) {
    const inputDate = new Date(stringValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (inputDate < today) {
      errors.push(rules.message || `${fieldName} must be a future date`);
    }
  }

  return errors;
};

export const validateForm = (formData, validationSchema) => {
  const errors = {};
  let isValid = true;

  for (const [fieldName, rules] of Object.entries(validationSchema)) {
    const fieldErrors = validateField(formData[fieldName], rules, fieldName);
    
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors[0]; // Show first error
      isValid = false;
    }
  }

  return { isValid, errors };
};

export const validateBooking = (bookingData) => {
  const schema = {
    guest_name: ValidationRules.name,
    email: ValidationRules.email,
    phone: ValidationRules.phone,
    check_in: ValidationRules.date,
    check_out: ValidationRules.date,
    guests: { ...ValidationRules.number, min: 1, max: 20 },
    accommodation_type: {
      required: true,
      enum: ['cottage', 'overnight'],
      message: 'Please select a valid accommodation type'
    }
  };

  return validateForm(bookingData, schema);
};

export const validateContact = (contactData) => {
  const schema = {
    name: ValidationRules.name,
    email: ValidationRules.email,
    subject: {
      required: true,
      minLength: 5,
      maxLength: 100,
      message: 'Subject must be 5-100 characters'
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      message: 'Message must be 10-1000 characters'
    }
  };

  return validateForm(contactData, schema);
};

export const validateUser = (userData) => {
  const schema = {
    name: ValidationRules.name,
    email: ValidationRules.email,
    password: ValidationRules.password,
    role: {
      required: true,
      enum: ['admin', 'super_admin'],
      message: 'Please select a valid role'
    }
  };

  return validateForm(userData, schema);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeFormData = (formData) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(formData)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif']
  } = options;

  const errors = [];

  if (!file) {
    errors.push('No file selected');
    return errors;
  }

  // Check file size
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension must be one of: ${allowedExtensions.join(', ')}`);
  }

  return errors;
};

export const validateDateRange = (startDate, endDate) => {
  const errors = [];

  if (!startDate || !endDate) {
    errors.push('Both start and end dates are required');
    return errors;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (start < today) {
    errors.push('Start date must be in the future');
  }

  if (end <= start) {
    errors.push('End date must be after start date');
  }

  // Check if date range is not too far in the future (e.g., 1 year)
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  
  if (start > oneYearFromNow) {
    errors.push('Start date cannot be more than 1 year in the future');
  }

  return errors;
};

export const validateEmailList = (emails) => {
  const errors = [];
  
  if (!Array.isArray(emails)) {
    errors.push('Emails must be an array');
    return errors;
  }

  emails.forEach((email, index) => {
    const emailErrors = validateField(email, ValidationRules.email, `Email ${index + 1}`);
    if (emailErrors.length > 0) {
      errors.push(...emailErrors);
    }
  });

  return errors;
};

export const validatePasswordStrength = (password) => {
  const errors = [];
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };

  if (!checks.length) errors.push('Password must be at least 8 characters');
  if (!checks.lowercase) errors.push('Password must contain lowercase letters');
  if (!checks.uppercase) errors.push('Password must contain uppercase letters');
  if (!checks.number) errors.push('Password must contain numbers');
  if (!checks.special) errors.push('Password must contain special characters');

  return {
    isValid: errors.length === 0,
    errors,
    strength: Object.values(checks).filter(Boolean).length,
    maxStrength: Object.keys(checks).length
  };
};

export default {
  ValidationRules,
  ValidationError,
  validateField,
  validateForm,
  validateBooking,
  validateContact,
  validateUser,
  sanitizeInput,
  sanitizeFormData,
  validateFileUpload,
  validateDateRange,
  validateEmailList,
  validatePasswordStrength
};

