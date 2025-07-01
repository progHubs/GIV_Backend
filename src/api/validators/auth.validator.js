const { body, param, query, validationResult } = require('express-validator');
const { 
  validateEmail,
  validateName,
  validatePhone,
  isValidEmail,
  isValidPhone,
  isValidName
} = require('../../utils/validation.util');
const { validatePasswordStrength } = require('../../utils/password.util');

/**
 * Validation middleware to check for validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(error => error.msg),
      code: 'VALIDATION_ERROR'
    });
  }
  next();
};

/**
 * Role validation
 */
const isValidRole = (role) => {
  const validRoles = ['admin', 'volunteer', 'donor', 'editor'];
  return validRoles.includes(role);
};

/**
 * Language preference validation
 */
const isValidLanguage = (language) => {
  const validLanguages = ['en', 'am'];
  return validLanguages.includes(language);
};

// Registration validation
const registerValidation = [
  body('full_name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .custom((value) => {
      const validation = validateName(value);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }
      return true;
    }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .custom((value) => {
      const validation = validatePasswordStrength(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),

  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value) {
        const validation = validatePhone(value);
        if (!validation.isValid) {
          throw new Error(validation.errors[0]);
        }
      }
      return true;
    }),

  body('language_preference')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidLanguage(value)) {
        throw new Error('Invalid language preference. Must be "en" or "am"');
      }
      return true;
    }),

  handleValidationErrors
];

// Login validation
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }
      return true;
    }),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors
];

// Change password validation
const changePasswordValidation = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),

  body('new_password')
    .notEmpty()
    .withMessage('New password is required')
    .custom((value) => {
      const validation = validatePasswordStrength(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),

  body('confirm_password')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),

  handleValidationErrors
];

// Request password reset validation
const requestPasswordResetValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }
      return true;
    }),

  handleValidationErrors
];

// Reset password validation
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required')
    .isString()
    .withMessage('Reset token must be a string'),

  body('new_password')
    .notEmpty()
    .withMessage('New password is required')
    .custom((value) => {
      const validation = validatePasswordStrength(value);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      return true;
    }),

  body('confirm_password')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.new_password) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    }),

  handleValidationErrors
];

// Update profile validation
const updateProfileValidation = [
  body('full_name')
    .optional()
    .trim()
    .custom((value) => {
      if (value) {
        const validation = validateName(value);
        if (!validation.isValid) {
          throw new Error(validation.errors[0]);
        }
      }
      return true;
    }),

  body('phone')
    .optional()
    .trim()
    .custom((value) => {
      if (value) {
        const validation = validatePhone(value);
        if (!validation.isValid) {
          throw new Error(validation.errors[0]);
        }
      }
      return true;
    }),

  body('language_preference')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidLanguage(value)) {
        throw new Error('Invalid language preference. Must be "en" or "am"');
      }
      return true;
    }),

  body('profile_image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image URL must be a valid URL'),

  handleValidationErrors
];

// Email verification validation
const verifyEmailValidation = [
  param('token')
    .notEmpty()
    .withMessage('Verification token is required')
    .isString()
    .withMessage('Verification token must be a string'),

  handleValidationErrors
];

// Resend verification validation
const resendVerificationValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .custom((value) => {
      const validation = validateEmail(value);
      if (!validation.isValid) {
        throw new Error(validation.errors[0]);
      }
      return true;
    }),

  handleValidationErrors
];

// Refresh token validation
const refreshTokenValidation = [
  body('refresh_token')
    .optional()
    .isString()
    .withMessage('Refresh token must be a string'),

  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  requestPasswordResetValidation,
  resetPasswordValidation,
  updateProfileValidation,
  verifyEmailValidation,
  resendVerificationValidation,
  refreshTokenValidation,
  handleValidationErrors,
  isValidRole,
  isValidLanguage
}; 