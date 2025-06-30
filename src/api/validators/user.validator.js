const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./auth.validator');

/**
 * User Validation Schemas for GIV Society Backend
 */

// User update validation
const userUpdateValidation = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),

  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Phone number must be a valid international format'),

  body('language_preference')
    .optional()
    .isIn(['en', 'am'])
    .withMessage('Language preference must be either "en" or "am"'),

  body('profile_image_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile image URL must be a valid URL'),

  handleValidationErrors
];

// User ID parameter validation
const userIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('User ID is required')
    .isNumeric()
    .withMessage('User ID must be a number'),

  handleValidationErrors
];

// User search validation
const userSearchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),

  query('role')
    .optional()
    .isIn(['admin', 'volunteer', 'donor', 'editor'])
    .withMessage('Role must be one of: admin, volunteer, donor, editor'),

  query('email_verified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Email verified must be either "true" or "false"'),

  query('language_preference')
    .optional()
    .isIn(['en', 'am'])
    .withMessage('Language preference must be either "en" or "am"'),

  query('has_volunteer_profile')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Has volunteer profile must be either "true" or "false"'),

  query('has_donor_profile')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Has donor profile must be either "true" or "false"'),

  query('created_after')
    .optional()
    .isISO8601()
    .withMessage('Created after must be a valid ISO 8601 date'),

  query('created_before')
    .optional()
    .isISO8601()
    .withMessage('Created before must be a valid ISO 8601 date'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'full_name', 'email', 'role'])
    .withMessage('Sort by must be one of: created_at, updated_at, full_name, email, role'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

// User list validation (for admin)
const userListValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),

  query('role')
    .optional()
    .isIn(['admin', 'volunteer', 'donor', 'editor'])
    .withMessage('Role must be one of: admin, volunteer, donor, editor'),

  query('email_verified')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Email verified must be either "true" or "false"'),

  query('language_preference')
    .optional()
    .isIn(['en', 'am'])
    .withMessage('Language preference must be either "en" or "am"'),

  query('created_after')
    .optional()
    .isISO8601()
    .withMessage('Created after must be a valid ISO 8601 date'),

  query('created_before')
    .optional()
    .isISO8601()
    .withMessage('Created before must be a valid ISO 8601 date'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['created_at', 'updated_at', 'full_name', 'email', 'role'])
    .withMessage('Sort by must be one of: created_at, updated_at, full_name, email, role'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

// User query parameter validation
const userQueryValidation = [
  query('includeProfiles')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Include profiles must be either "true" or "false"'),

  handleValidationErrors
];

module.exports = {
  userUpdateValidation,
  userIdValidation,
  userSearchValidation,
  userListValidation,
  userQueryValidation
}; 