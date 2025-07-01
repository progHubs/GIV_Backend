const Joi = require('joi');

// Enum values from schema.prisma
const donationTypes = ['one_time', 'recurring', 'in_kind'];
const paymentStatuses = ['pending', 'completed', 'failed'];

// Create Donation Schema
const createDonationSchema = Joi.object({
  donor_id: Joi.number().integer().min(0), // 0 for anonymous, >0 for registered
  campaign_id: Joi.number().integer().positive().required()
    .messages({ 'any.required': 'Campaign ID is required', 'number.base': 'Campaign ID must be a number' }),
  amount: Joi.number().positive().precision(2).required()
    .messages({ 'any.required': 'Amount is required', 'number.base': 'Amount must be a number', 'number.positive': 'Amount must be positive' }),
  currency: Joi.string().length(3).uppercase().default('USD')
    .messages({ 'string.length': 'Currency must be a 3-letter code' }),
  donation_type: Joi.string().valid(...donationTypes).required()
    .messages({ 'any.only': `Donation type must be one of: ${donationTypes.join(', ')}` }),
  payment_method: Joi.string().max(50),
  payment_status: Joi.string().valid(...paymentStatuses).default('pending')
    .messages({ 'any.only': `Payment status must be one of: ${paymentStatuses.join(', ')}` }),
  transaction_id: Joi.string().max(100),
  receipt_url: Joi.string().uri().max(512),
  is_acknowledged: Joi.boolean().default(false),
  is_tax_deductible: Joi.boolean().default(true),
  is_anonymous: Joi.boolean().default(false),
  notes: Joi.string().max(1000),
  donated_at: Joi.date().iso(),
});

// Update Donation Status Schema (admin only)
const updateDonationStatusSchema = Joi.object({
  payment_status: Joi.string().valid(...paymentStatuses).required()
    .messages({ 'any.only': `Payment status must be one of: ${paymentStatuses.join(', ')}` }),
  is_acknowledged: Joi.boolean(),
});

// Donation Query Schema (for filtering/searching)
const donationQuerySchema = Joi.object({
  donor_id: Joi.number().integer().min(0),
  campaign_id: Joi.number().integer().positive(),
  payment_status: Joi.string().valid(...paymentStatuses),
  donation_type: Joi.string().valid(...donationTypes),
  min_amount: Joi.number().positive(),
  max_amount: Joi.number().positive(),
  start_date: Joi.date().iso(),
  end_date: Joi.date().iso(),
  is_anonymous: Joi.boolean(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sortBy: Joi.string().valid('created_at', 'updated_at', 'amount', 'donated_at').default('created_at'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

// Validation functions
const validateCreateDonation = (data) => {
  const { error, value } = createDonationSchema.validate(data, { abortEarly: false, stripUnknown: true });
  return {
    isValid: !error,
    errors: error ? error.details.map(d => d.message) : [],
    sanitized: value
  };
};

const validateUpdateDonationStatus = (data) => {
  const { error, value } = updateDonationStatusSchema.validate(data, { abortEarly: false, stripUnknown: true });
  return {
    isValid: !error,
    errors: error ? error.details.map(d => d.message) : [],
    sanitized: value
  };
};

const validateDonationQuery = (data) => {
  const { error, value } = donationQuerySchema.validate(data, { abortEarly: false, stripUnknown: true });
  return {
    isValid: !error,
    errors: error ? error.details.map(d => d.message) : [],
    sanitized: value
  };
};

module.exports = {
  createDonationSchema,
  updateDonationStatusSchema,
  donationQuerySchema,
  validateCreateDonation,
  validateUpdateDonationStatus,
  validateDonationQuery
}; 