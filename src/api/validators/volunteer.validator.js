const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./auth.validator');

/**
 * Volunteer Validation Schemas for GIV Society Backend
 */

// Volunteer profile validation
const volunteerValidation = [
  body('area_of_expertise')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Area of expertise must be between 2 and 100 characters'),

  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),

  body('availability')
    .optional()
    .isObject()
    .withMessage('Availability must be a valid JSON object'),

  body('motivation')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Motivation must be between 10 and 1000 characters'),

  body('emergency_contact_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Emergency contact name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Emergency contact name can only contain letters and spaces'),

  body('emergency_contact_phone')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Emergency contact phone must be a valid international format'),

  body('certificate_url')
    .optional()
    .trim()
    .isURL()
    .withMessage('Certificate URL must be a valid URL'),

  handleValidationErrors
];

// Volunteer ID parameter validation
const volunteerIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Volunteer ID is required')
    .isNumeric()
    .withMessage('Volunteer ID must be a number'),

  handleValidationErrors
];

// Volunteer search validation
const volunteerSearchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),

  query('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),

  query('area_of_expertise')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Area of expertise must be between 2 and 100 characters'),

  query('background_check_status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Background check status must be one of: pending, approved, rejected'),

  query('training_completed')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Training completed must be either "true" or "false"'),

  query('has_skills')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Has skills must be either "true" or "false"'),

  query('min_hours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum hours must be a non-negative integer'),

  query('max_hours')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum hours must be a non-negative integer'),

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
    .isIn(['created_at', 'updated_at', 'total_hours', 'rating', 'background_check_status'])
    .withMessage('Sort by must be one of: created_at, updated_at, total_hours, rating, background_check_status'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

// Volunteer list validation (for admin)
const volunteerListValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),

  query('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Location must be between 2 and 255 characters'),

  query('area_of_expertise')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Area of expertise must be between 2 and 100 characters'),

  query('background_check_status')
    .optional()
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Background check status must be one of: pending, approved, rejected'),

  query('training_completed')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Training completed must be either "true" or "false"'),

  query('availability')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Availability must be between 2 and 100 characters'),

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
    .isIn(['created_at', 'updated_at', 'total_hours', 'rating', 'background_check_status'])
    .withMessage('Sort by must be one of: created_at, updated_at, total_hours, rating, background_check_status'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

// Background check status validation
const backgroundCheckValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Status must be one of: pending, approved, rejected'),

  handleValidationErrors
];

// Add hours validation
const addHoursValidation = [
  body('hours')
    .notEmpty()
    .withMessage('Hours is required')
    .isFloat({ min: 0.1, max: 24 })
    .withMessage('Hours must be between 0.1 and 24'),

  handleValidationErrors
];

module.exports = {
  volunteerValidation,
  volunteerIdValidation,
  volunteerSearchValidation,
  volunteerListValidation,
  backgroundCheckValidation,
  addHoursValidation
}; 