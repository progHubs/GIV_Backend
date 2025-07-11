const { body, param, query, validationResult } = require('express-validator');
const { isValidSlug, isValidUrl, isValidDate } = require('../../utils/validation.util');
const Joi = require('joi');

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
 * Campaign category validation
 */
const isValidCampaignCategory = (category) => {
  const validCategories = [
    'healthcare',
    'education',
    'community_development',
    'emergency_relief',
    'youth_development',
    'mental_health',
    'disease_prevention',
    'environmental',
    'other'
  ];
  return validCategories.includes(category);
};

/**
 * Language validation
 */
const isValidLanguage = (language) => {
  const validLanguages = ['en', 'am'];
  return validLanguages.includes(language);
};

/**
 * Progress bar color validation
 */
const isValidProgressBarColor = (color) => {
  const validColors = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark'
  ];
  return validColors.includes(color);
};

/**
 * Campaign Validation Schemas for GIV Society Backend
 */

// Base campaign schema
const baseCampaignSchema = {
  title: Joi.string()
    .min(3)
    .max(255)
    .required()
    .messages({
      'string.min': 'Campaign title must be at least 3 characters long',
      'string.max': 'Campaign title cannot exceed 255 characters',
      'any.required': 'Campaign title is required'
    }),

  slug: Joi.string()
    .min(3)
    .max(255)
    .pattern(/^[a-z0-9-]+$/)
    .optional()
    .messages({
      'string.min': 'Campaign slug must be at least 3 characters long',
      'string.max': 'Campaign slug cannot exceed 255 characters',
      'string.pattern.base': 'Campaign slug can only contain lowercase letters, numbers, and hyphens'
    }),

  description: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Campaign description must be at least 10 characters long',
      'string.max': 'Campaign description cannot exceed 2000 characters',
      'any.required': 'Campaign description is required'
    }),

  goal_amount: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.base': 'Goal amount must be a valid number',
      'number.positive': 'Goal amount must be positive',
      'number.precision': 'Goal amount can have maximum 2 decimal places',
      'any.required': 'Goal amount is required'
    }),

  start_date: Joi.date()
    .iso()
    .min('now')
    .required()
    .messages({
      'date.base': 'Start date must be a valid date',
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'Start date cannot be in the past',
      'any.required': 'Start date is required'
    }),

  end_date: Joi.date()
    .iso()
    .min(Joi.ref('start_date'))
    .optional()
    .messages({
      'date.base': 'End date must be a valid date',
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
      'date.min': 'End date must be after start date'
    }),

  category: Joi.string()
    .valid(
      'medical_outreach',
      'mental_health',
      'youth_development',
      'disease_prevention',
      'education',
      'emergency_relief',
      'community_development',
      'environmental',
      'other'
    )
    .required()
    .messages({
      'any.only': 'Category must be one of the valid options',
      'any.required': 'Category is required'
    }),

  progress_bar_color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Progress bar color must be a valid hex color (e.g., #FF5733)'
    }),

  image_url: Joi.string()
    .uri()
    .max(512)
    .optional()
    .messages({
      'string.uri': 'Image URL must be a valid URL',
      'string.max': 'Image URL cannot exceed 512 characters'
    }),

  video_url: Joi.string()
    .uri()
    .max(512)
    .allow('', null)
    .optional()
    .messages({
      'string.uri': 'Video URL must be a valid URL',
      'string.max': 'Video URL cannot exceed 512 characters'
    }),

  success_stories: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().max(255).required(),
        description: Joi.string().max(1000).required(),
        image_url: Joi.string().uri().optional(),
        date: Joi.date().iso().optional()
      })
    )
    .max(10)
    .optional()
    .messages({
      'array.max': 'Cannot have more than 10 success stories',
      'object.unknown': 'Invalid success story format'
    }),

  language: Joi.string()
    .valid('en', 'am')
    .default('en')
    .messages({
      'any.only': 'Language must be either "en" or "am"'
    }),

  translation_group_id: Joi.string()
    .uuid()
    .optional()
    .messages({
      'string.guid': 'Translation group ID must be a valid UUID'
    }),

  is_active: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': 'is_active must be a boolean value'
    }),

  is_featured: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'is_featured must be a boolean value'
    })
};

// Create campaign schema
const createCampaignSchema = Joi.object(baseCampaignSchema);

// Update campaign schema (all fields optional)
const updateCampaignSchema = Joi.object({
  title: baseCampaignSchema.title.optional(),
  slug: baseCampaignSchema.slug.optional(),
  description: baseCampaignSchema.description.optional(),
  goal_amount: baseCampaignSchema.goal_amount.optional(),
  start_date: baseCampaignSchema.start_date.optional(),
  end_date: baseCampaignSchema.end_date.optional(),
  category: baseCampaignSchema.category.optional(),
  progress_bar_color: baseCampaignSchema.progress_bar_color.optional(),
  image_url: baseCampaignSchema.image_url.optional(),
  video_url: baseCampaignSchema.video_url.optional(),
  success_stories: baseCampaignSchema.success_stories.optional(),
  language: baseCampaignSchema.language.optional(),
  translation_group_id: baseCampaignSchema.translation_group_id.optional(),
  is_active: baseCampaignSchema.is_active.optional(),
  is_featured: baseCampaignSchema.is_featured.optional()
});

// Query parameters schema for filtering campaigns
const campaignQuerySchema = Joi.object({
  search: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Search query must be at least 2 characters long',
      'string.max': 'Search query cannot exceed 100 characters'
    }),

  category: Joi.string()
    .valid(
      'medical_outreach',
      'mental_health',
      'youth_development',
      'disease_prevention',
      'education',
      'emergency_relief',
      'community_development',
      'environmental',
      'other'
    )
    .optional()
    .messages({
      'any.only': 'Category must be one of the valid options'
    }),

  language: Joi.string()
    .valid('en', 'am')
    .optional()
    .messages({
      'any.only': 'Language must be either "en" or "am"'
    }),

  is_active: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'is_active must be a boolean value'
    }),

  is_featured: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'is_featured must be a boolean value'
    }),

  start_date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'Start date must be in ISO format (YYYY-MM-DD)'
    }),

  end_date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.format': 'End date must be in ISO format (YYYY-MM-DD)'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),

  sortBy: Joi.string()
    .valid('created_at', 'title', 'goal_amount', 'current_amount', 'start_date', 'end_date')
    .default('created_at')
    .optional()
    .messages({
      'any.only': 'sortBy must be one of the valid options'
    }),

  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .optional()
    .messages({
      'any.only': 'sortOrder must be either "asc" or "desc"'
    })
});

// Search query schema
const searchQuerySchema = Joi.object({
  q: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Search query must be at least 2 characters long',
      'string.max': 'Search query cannot exceed 100 characters',
      'any.required': 'Search query is required'
    }),

  language: Joi.string()
    .valid('en', 'am')
    .optional()
    .messages({
      'any.only': 'Language must be either "en" or "am"'
    })
});

// Campaign ID parameter schema
const campaignIdSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Campaign ID must be a number',
      'number.integer': 'Campaign ID must be an integer',
      'number.positive': 'Campaign ID must be positive',
      'any.required': 'Campaign ID is required'
    })
});

// Donation query schema
const donationQuerySchema = Joi.object({
  payment_status: Joi.string()
    .valid('pending', 'completed', 'failed')
    .optional()
    .messages({
      'any.only': 'Payment status must be one of: pending, completed, failed'
    }),

  donation_type: Joi.string()
    .valid('one_time', 'recurring', 'in_kind')
    .optional()
    .messages({
      'any.only': 'Donation type must be one of: one_time, recurring, in_kind'
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 50'
    })
});

// Translation schema
const translationSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(),
  slug: Joi.string().min(3).max(255).pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().min(10).max(2000).required(),
  goal_amount: Joi.number().positive().precision(2).required(),
  start_date: Joi.date().iso().min('now').required(),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).optional(),
  category: Joi.string().valid(
    'medical_outreach',
    'mental_health',
    'youth_development',
    'disease_prevention',
    'education',
    'emergency_relief',
    'community_development',
    'environmental',
    'other'
  ).required(),
  language: Joi.string().valid('en', 'am').required(),
  progress_bar_color: Joi.string().max(20).optional(),
  image_url: Joi.string().uri().optional(),
  video_url: Joi.string().uri().allow('', null).optional(),
  donor_count: Joi.number().integer().min(0).optional(),
  success_stories: Joi.any().optional(),
  current_amount: Joi.number().precision(2).optional(),
  is_active: Joi.boolean().optional(),
  is_featured: Joi.boolean().optional(),
  created_by: Joi.any().optional(),
  created_at: Joi.any().optional(),
  progress_percentage: Joi.number().optional(),
});

function validateCampaignTranslation(data) {
  return translationSchema.validate(data, { abortEarly: false });
}

/**
 * Validation functions
 */

/**
 * Validate campaign creation data
 * @param {Object} data - Campaign data to validate
 * @returns {Object} - Validation result
 */
const validateCreateCampaign = (data) => {
  const { error, value } = createCampaignSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  return {
    isValid: true,
    sanitized: value
  };
};

/**
 * Validate campaign update data
 * @param {Object} data - Campaign update data to validate
 * @returns {Object} - Validation result
 */
const validateUpdateCampaign = (data) => {
  const { error, value } = updateCampaignSchema.validate(data, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  return {
    isValid: true,
    sanitized: value
  };
};

/**
 * Validate campaign query parameters
 * @param {Object} query - Query parameters to validate
 * @returns {Object} - Validation result
 */
const validateCampaignQuery = (query) => {
  const { error, value } = campaignQuerySchema.validate(query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  return {
    isValid: true,
    sanitized: value
  };
};

/**
 * Validate search query parameters
 * @param {Object} query - Search query parameters to validate
 * @returns {Object} - Validation result
 */
const validateSearchQuery = (query) => {
  const { error, value } = searchQuerySchema.validate(query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  return {
    isValid: true,
    sanitized: value
  };
};

/**
 * Validate campaign ID parameter
 * @param {Object} params - Route parameters to validate
 * @returns {Object} - Validation result
 */
const validateCampaignId = (params) => {
  const { error, value } = campaignIdSchema.validate(params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  return {
    isValid: true,
    sanitized: value
  };
};

/**
 * Validate donation query parameters
 * @param {Object} query - Donation query parameters to validate
 * @returns {Object} - Validation result
 */
const validateDonationQuery = (query) => {
  const { error, value } = donationQuerySchema.validate(query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return {
      isValid: false,
      errors: error.details.map(detail => detail.message)
    };
  }

  return {
    isValid: true,
    sanitized: value
  };
};

// Create campaign validation
const createCampaignValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Campaign title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Campaign title must be between 3 and 255 characters'),

  body('slug')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidSlug(value)) {
        throw new Error('Invalid slug format. Use only lowercase letters, numbers, and hyphens');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('goal_amount')
    .notEmpty()
    .withMessage('Goal amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Goal amount must be a positive number'),

  body('start_date')
    .notEmpty()
    .withMessage('Start date is required')
    .custom((value) => {
      if (!isValidDate(value)) {
        throw new Error('Invalid start date format');
      }
      const startDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        throw new Error('Start date cannot be in the past');
      }
      return true;
    }),

  body('end_date')
    .optional()
    .custom((value, { req }) => {
      if (value) {
        if (!isValidDate(value)) {
          throw new Error('Invalid end date format');
        }
        const endDate = new Date(value);
        const startDate = new Date(req.body.start_date);
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),

  body('category')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidCampaignCategory(value)) {
        throw new Error('Invalid campaign category');
      }
      return true;
    }),

  body('progress_bar_color')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidProgressBarColor(value)) {
        throw new Error('Invalid progress bar color');
      }
      return true;
    }),

  body('image_url')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidUrl(value)) {
        throw new Error('Invalid image URL format');
      }
      return true;
    }),

  body('video_url')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidUrl(value)) {
        throw new Error('Invalid video URL format');
      }
      return true;
    }),

  body('success_stories')
    .optional()
    .isArray()
    .withMessage('Success stories must be an array'),

  body('language')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidLanguage(value)) {
        throw new Error('Invalid language. Must be "en" or "am"');
      }
      return true;
    }),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),

  handleValidationErrors
];

// Update campaign validation
const updateCampaignValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid campaign ID'),

  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Campaign title must be between 3 and 255 characters'),

  body('slug')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidSlug(value)) {
        throw new Error('Invalid slug format. Use only lowercase letters, numbers, and hyphens');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must not exceed 5000 characters'),

  body('goal_amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Goal amount must be a positive number'),

  body('current_amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current amount must be a non-negative number'),

  body('start_date')
    .optional()
    .custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Invalid start date format');
      }
      return true;
    }),

  body('end_date')
    .optional()
    .custom((value, { req }) => {
      if (value) {
        if (!isValidDate(value)) {
          throw new Error('Invalid end date format');
        }
        if (req.body.start_date) {
          const endDate = new Date(value);
          const startDate = new Date(req.body.start_date);
          if (endDate <= startDate) {
            throw new Error('End date must be after start date');
          }
        }
      }
      return true;
    }),

  body('category')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidCampaignCategory(value)) {
        throw new Error('Invalid campaign category');
      }
      return true;
    }),

  body('progress_bar_color')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidProgressBarColor(value)) {
        throw new Error('Invalid progress bar color');
      }
      return true;
    }),

  body('image_url')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidUrl(value)) {
        throw new Error('Invalid image URL format');
      }
      return true;
    }),

  body('video_url')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidUrl(value)) {
        throw new Error('Invalid video URL format');
      }
      return true;
    }),

  body('success_stories')
    .optional()
    .isArray()
    .withMessage('Success stories must be an array'),

  body('language')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidLanguage(value)) {
        throw new Error('Invalid language. Must be "en" or "am"');
      }
      return true;
    }),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('is_featured must be a boolean'),

  handleValidationErrors
];

// Get campaigns validation (query parameters)
const getCampaignsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),

  query('category')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidCampaignCategory(value)) {
        throw new Error('Invalid campaign category');
      }
      return true;
    }),

  query('language')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidLanguage(value)) {
        throw new Error('Invalid language. Must be "en" or "am"');
      }
      return true;
    }),

  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_active must be "true" or "false"'),

  query('is_featured')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_featured must be "true" or "false"'),

  query('sortBy')
    .optional()
    .isIn(['title', 'goal_amount', 'current_amount', 'start_date', 'end_date', 'created_at', 'donor_count'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be "asc" or "desc"'),

  handleValidationErrors
];

// Get campaign by ID validation
const getCampaignByIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid campaign ID'),

  handleValidationErrors
];

// Delete campaign validation
const deleteCampaignValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid campaign ID'),

  handleValidationErrors
];

// Search campaigns validation
const searchCampaignsValidation = [
  query('q')
    .notEmpty()
    .withMessage('Search query is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Search query must be between 2 and 100 characters'),

  query('language')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidLanguage(value)) {
        throw new Error('Invalid language. Must be "en" or "am"');
      }
      return true;
    }),

  handleValidationErrors
];

// Get campaign statistics validation
const getCampaignStatsValidation = [
  query('start_date')
    .optional()
    .custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Invalid start date format');
      }
      return true;
    }),

  query('end_date')
    .optional()
    .custom((value) => {
      if (value && !isValidDate(value)) {
        throw new Error('Invalid end date format');
      }
      return true;
    }),

  query('category')
    .optional()
    .trim()
    .custom((value) => {
      if (value && !isValidCampaignCategory(value)) {
        throw new Error('Invalid campaign category');
      }
      return true;
    }),

  handleValidationErrors
];

// Get campaign donations validation
const getCampaignDonationsValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid campaign ID'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('payment_status')
    .optional()
    .isIn(['pending', 'completed', 'failed'])
    .withMessage('Invalid payment status'),

  query('donation_type')
    .optional()
    .isIn(['one_time', 'recurring', 'in_kind'])
    .withMessage('Invalid donation type'),

  handleValidationErrors
];

module.exports = {
  createCampaignValidation,
  updateCampaignValidation,
  getCampaignsValidation,
  getCampaignByIdValidation,
  deleteCampaignValidation,
  searchCampaignsValidation,
  getCampaignStatsValidation,
  getCampaignDonationsValidation,
  handleValidationErrors,
  validateCreateCampaign,
  validateUpdateCampaign,
  validateCampaignQuery,
  validateSearchQuery,
  validateCampaignId,
  validateDonationQuery,
  createCampaignSchema,
  updateCampaignSchema,
  campaignQuerySchema,
  searchQuerySchema,
  campaignIdSchema,
  donationQuerySchema,
  validateCampaignTranslation
};
