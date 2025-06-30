const { body, param, query } = require('express-validator');
const { handleValidationErrors } = require('./auth.validator');

/**
 * Donor Validation Schemas for GIV Society Backend
 */

// Donor profile validation
const donorValidation = [
  body('is_recurring_donor')
    .optional()
    .isBoolean()
    .withMessage('is_recurring_donor must be a boolean'),

  body('preferred_payment_method')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Preferred payment method must be between 2 and 50 characters'),

  body('donation_frequency')
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Donation frequency must be one of: monthly, quarterly, yearly'),

  body('tax_receipt_email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Tax receipt email must be a valid email address'),

  body('is_anonymous')
    .optional()
    .isBoolean()
    .withMessage('is_anonymous must be a boolean'),

  body('donation_tier')
    .optional()
    .isIn(['bronze', 'silver', 'gold', 'platinum'])
    .withMessage('Donation tier must be one of: bronze, silver, gold, platinum'),

  handleValidationErrors
];

// Donor ID parameter validation
const donorIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Donor ID is required')
    .isNumeric()
    .withMessage('Donor ID must be a number'),

  handleValidationErrors
];

// Donor search validation
const donorSearchValidation = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),

  query('donation_tier')
    .optional()
    .isIn(['bronze', 'silver', 'gold', 'platinum'])
    .withMessage('Donation tier must be one of: bronze, silver, gold, platinum'),

  query('is_recurring_donor')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_recurring_donor must be either "true" or "false"'),

  query('donation_frequency')
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Donation frequency must be one of: monthly, quarterly, yearly'),

  query('min_total_donated')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum total donated must be a non-negative number'),

  query('max_total_donated')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum total donated must be a non-negative number'),

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
    .isIn(['created_at', 'updated_at', 'total_donated', 'donation_tier', 'last_donation_date'])
    .withMessage('Sort by must be one of: created_at, updated_at, total_donated, donation_tier, last_donation_date'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

// Donor list validation (for admin)
const donorListValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search term must be between 2 and 100 characters'),

  query('donation_tier')
    .optional()
    .isIn(['bronze', 'silver', 'gold', 'platinum'])
    .withMessage('Donation tier must be one of: bronze, silver, gold, platinum'),

  query('is_recurring_donor')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_recurring_donor must be either "true" or "false"'),

  query('donation_frequency')
    .optional()
    .isIn(['monthly', 'quarterly', 'yearly'])
    .withMessage('Donation frequency must be one of: monthly, quarterly, yearly'),

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
    .isIn(['created_at', 'updated_at', 'total_donated', 'donation_tier', 'last_donation_date'])
    .withMessage('Sort by must be one of: created_at, updated_at, total_donated, donation_tier, last_donation_date'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

// Donation tier validation
const donationTierValidation = [
  body('tier')
    .notEmpty()
    .withMessage('Tier is required')
    .isIn(['bronze', 'silver', 'gold', 'platinum'])
    .withMessage('Tier must be one of: bronze, silver, gold, platinum'),

  handleValidationErrors
];

// Year parameter validation
const yearValidation = [
  param('year')
    .notEmpty()
    .withMessage('Year is required')
    .isInt({ min: 2000, max: new Date().getFullYear() })
    .withMessage('Year must be between 2000 and current year'),

  handleValidationErrors
];

// Donation history pagination validation
const donationHistoryValidation = [
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
    .isIn(['donated_at', 'amount', 'created_at'])
    .withMessage('Sort by must be one of: donated_at, amount, created_at'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either "asc" or "desc"'),

  handleValidationErrors
];

module.exports = {
  donorValidation,
  donorIdValidation,
  donorSearchValidation,
  donorListValidation,
  donationTierValidation,
  yearValidation,
  donationHistoryValidation
}; 