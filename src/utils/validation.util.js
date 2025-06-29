const { validatePasswordStrength } = require('./password.util');

/**
 * Validation Utilities for GIV Society Backend
 */

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Phone number validation regex (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Name validation regex (letters, spaces, hyphens, apostrophes)
 */
const NAME_REGEX = /^[a-zA-Z\s\-'\.]+$/;

/**
 * Slug validation regex (lowercase, hyphens, numbers)
 */
const SLUG_REGEX = /^[a-z0-9-]+$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  return EMAIL_REGEX.test(email.trim().toLowerCase());
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return PHONE_REGEX.test(cleanPhone);
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name format
 */
const isValidName = (name) => {
  if (!name || typeof name !== 'string') {
    return false;
  }
  
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 100 && NAME_REGEX.test(trimmedName);
};

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid slug format
 */
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return false;
  }
  
  return slug.length >= 3 && slug.length <= 255 && SLUG_REGEX.test(slug);
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/\s+/g, ' '); // Normalize whitespace
};

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate and sanitize
 * @returns {Object} - Validation result
 */
const validateEmail = (email) => {
  const sanitized = sanitizeString(email);
  
  if (!sanitized) {
    return {
      isValid: false,
      errors: ['Email is required'],
      sanitized: ''
    };
  }
  
  if (!isValidEmail(sanitized)) {
    return {
      isValid: false,
      errors: ['Invalid email format'],
      sanitized: ''
    };
  }
  
  return {
    isValid: true,
    errors: [],
    sanitized: sanitized.toLowerCase()
  };
};

/**
 * Validate and sanitize name
 * @param {string} name - Name to validate and sanitize
 * @returns {Object} - Validation result
 */
const validateName = (name) => {
  const sanitized = sanitizeString(name);
  
  if (!sanitized) {
    return {
      isValid: false,
      errors: ['Name is required'],
      sanitized: ''
    };
  }
  
  if (!isValidName(sanitized)) {
    return {
      isValid: false,
      errors: ['Name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes'],
      sanitized: ''
    };
  }
  
  return {
    isValid: true,
    errors: [],
    sanitized: sanitized
  };
};

/**
 * Validate and sanitize phone number
 * @param {string} phone - Phone number to validate and sanitize
 * @returns {Object} - Validation result
 */
const validatePhone = (phone) => {
  const sanitized = sanitizeString(phone);
  
  if (!sanitized) {
    return {
      isValid: false,
      errors: ['Phone number is required'],
      sanitized: ''
    };
  }
  
  if (!isValidPhone(sanitized)) {
    return {
      isValid: false,
      errors: ['Invalid phone number format. Please use international format (e.g., +1234567890)'],
      sanitized: ''
    };
  }
  
  return {
    isValid: true,
    errors: [],
    sanitized: sanitized.replace(/[\s\-\(\)]/g, '')
  };
};

/**
 * Validate registration data
 * @param {Object} data - Registration data
 * @returns {Object} - Validation result
 */
const validateRegistrationData = (data) => {
  const errors = [];
  const sanitized = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    sanitized.email = emailValidation.sanitized;
  }
  
  // Validate full name
  const nameValidation = validateName(data.full_name);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  } else {
    sanitized.full_name = nameValidation.sanitized;
  }
  
  // Validate password
  const passwordValidation = validatePasswordStrength(data.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  } else {
    sanitized.password = data.password; // Don't sanitize password
  }
  
  // Validate phone (optional)
  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    } else {
      sanitized.phone = phoneValidation.sanitized;
    }
  }
  
  // Validate role (optional, defaults to 'donor')
  if (data.role) {
    const validRoles = ['admin', 'volunteer', 'donor', 'editor'];
    if (!validRoles.includes(data.role)) {
      errors.push('Invalid role specified');
    } else {
      sanitized.role = data.role;
    }
  } else {
    sanitized.role = 'donor'; // Default role
  }
  
  // Validate language preference (optional, defaults to 'en')
  if (data.language_preference) {
    const validLanguages = ['en', 'am'];
    if (!validLanguages.includes(data.language_preference)) {
      errors.push('Invalid language preference');
    } else {
      sanitized.language_preference = data.language_preference;
    }
  } else {
    sanitized.language_preference = 'en'; // Default language
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate login data
 * @param {Object} data - Login data
 * @returns {Object} - Validation result
 */
const validateLoginData = (data) => {
  const errors = [];
  const sanitized = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    sanitized.email = emailValidation.sanitized;
  }
  
  // Validate password
  if (!data.password || typeof data.password !== 'string') {
    errors.push('Password is required');
  } else if (data.password.trim().length === 0) {
    errors.push('Password cannot be empty');
  } else {
    sanitized.password = data.password;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate password reset data
 * @param {Object} data - Password reset data
 * @returns {Object} - Validation result
 */
const validatePasswordResetData = (data) => {
  const errors = [];
  const sanitized = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    sanitized.email = emailValidation.sanitized;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate password change data
 * @param {Object} data - Password change data
 * @returns {Object} - Validation result
 */
const validatePasswordChangeData = (data) => {
  const errors = [];
  const sanitized = {};
  
  // Validate current password
  if (!data.current_password || typeof data.current_password !== 'string') {
    errors.push('Current password is required');
  } else {
    sanitized.current_password = data.current_password;
  }
  
  // Validate new password
  const passwordValidation = validatePasswordStrength(data.new_password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  } else {
    sanitized.new_password = data.new_password;
  }
  
  // Validate password confirmation
  if (data.new_password !== data.confirm_password) {
    errors.push('Password confirmation does not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate profile update data
 * @param {Object} data - Profile update data
 * @returns {Object} - Validation result
 */
const validateProfileUpdateData = (data) => {
  const errors = [];
  const sanitized = {};
  
  // Validate full name (optional in updates)
  if (data.full_name !== undefined) {
    const nameValidation = validateName(data.full_name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      sanitized.full_name = nameValidation.sanitized;
    }
  }
  
  // Validate phone (optional)
  if (data.phone !== undefined) {
    if (data.phone === null || data.phone === '') {
      sanitized.phone = null;
    } else {
      const phoneValidation = validatePhone(data.phone);
      if (!phoneValidation.isValid) {
        errors.push(...phoneValidation.errors);
      } else {
        sanitized.phone = phoneValidation.sanitized;
      }
    }
  }
  
  // Validate language preference
  if (data.language_preference !== undefined) {
    const validLanguages = ['en', 'am'];
    if (!validLanguages.includes(data.language_preference)) {
      errors.push('Invalid language preference');
    } else {
      sanitized.language_preference = data.language_preference;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} - Validation result
 */
const validatePagination = (query) => {
  const errors = [];
  const sanitized = {
    page: 1,
    limit: 10
  };
  
  // Validate page
  if (query.page !== undefined) {
    const page = parseInt(query.page);
    if (isNaN(page) || page < 1) {
      errors.push('Page must be a positive integer');
    } else {
      sanitized.page = page;
    }
  }
  
  // Validate limit
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push('Limit must be between 1 and 100');
    } else {
      sanitized.limit = limit;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

/**
 * Validate ID parameter
 * @param {string} id - ID to validate
 * @returns {Object} - Validation result
 */
const validateId = (id) => {
  if (!id || typeof id !== 'string') {
    return {
      isValid: false,
      errors: ['ID is required'],
      sanitized: null
    };
  }
  
  const sanitized = id.trim();
  const numId = parseInt(sanitized);
  
  if (isNaN(numId) || numId <= 0) {
    return {
      isValid: false,
      errors: ['Invalid ID format'],
      sanitized: null
    };
  }
  
  return {
    isValid: true,
    errors: [],
    sanitized: numId.toString()
  };
};

module.exports = {
  EMAIL_REGEX,
  PHONE_REGEX,
  NAME_REGEX,
  SLUG_REGEX,
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidSlug,
  sanitizeString,
  validateEmail,
  validateName,
  validatePhone,
  validateRegistrationData,
  validateLoginData,
  validatePasswordResetData,
  validatePasswordChangeData,
  validateProfileUpdateData,
  validatePagination,
  validateId
}; 