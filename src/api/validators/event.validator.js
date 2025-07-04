const Joi = require('joi');

/**
 * Event creation schema
 */
const eventSchema = Joi.object({
  title: Joi.string().max(255).required(),
  slug: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  event_date: Joi.date().required(),
  event_time: Joi.string().required(),
  timezone: Joi.string().default('UTC'),
  location: Joi.string().allow('', null),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  category: Joi.string().allow('', null),
  capacity: Joi.number().integer().min(1).optional(),
  registration_deadline: Joi.date().optional(),
  agenda: Joi.string().allow('', null),
  speaker_info: Joi.any().optional(),
  requirements: Joi.string().allow('', null),
  ticket_price: Joi.number().optional(),
  ticket_link: Joi.string().uri().allow('', null),
  is_featured: Joi.boolean().optional(),
  language: Joi.string().valid('en', 'am').default('en'),
});

/**
 * Event update schema (all fields optional)
 */
const eventUpdateSchema = eventSchema.fork(['title', 'slug', 'event_date', 'event_time'], (schema) => schema.optional());

/**
 * Event registration schema
 */
const registrationSchema = Joi.object({
  role: Joi.string().valid('volunteer', 'attendee').default('attendee'),
});

/**
 * Participant update schema
 */
const participantUpdateSchema = Joi.object({
  status: Joi.string().valid('registered', 'confirmed', 'attended', 'no_show').optional(),
  hours_contributed: Joi.number().min(0).optional(),
  feedback: Joi.string().allow('', null).optional(),
  rating: Joi.number().integer().min(1).max(5).optional(),
});

/**
 * Event translation schema
 */
const translationSchema = Joi.object({
  title: Joi.string().max(255).required(),
  slug: Joi.string().max(255).required(),
  description: Joi.string().allow('', null),
  event_date: Joi.date().required(),
  event_time: Joi.string().required(),
  language: Joi.string().valid('en', 'am').required(),
  timezone: Joi.string().max(50).optional(),
  location: Joi.string().max(255).optional(),
  category: Joi.string().max(50).optional(),
  capacity: Joi.number().integer().min(0).optional(),
  registered_count: Joi.number().integer().min(0).optional(),
  status: Joi.string().optional(),
  registration_deadline: Joi.date().optional(),
  registration_link: Joi.string().max(512).optional(),
  map_embed_url: Joi.string().max(512).optional(),
  agenda: Joi.string().allow('', null).optional(),
  speaker_info: Joi.string().allow('', null).optional(),
  requirements: Joi.string().allow('', null).optional(),
  ticket_price: Joi.number().precision(2).optional(),
  ticket_link: Joi.string().max(512).optional(),
  is_featured: Joi.boolean().optional(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  created_by: Joi.any().optional(),
});

/**
 * Validate event creation
 * @param {Object} data
 * @returns {Object}
 */
function validateEvent(data) {
  return eventSchema.validate(data, { abortEarly: false });
}

/**
 * Validate event update
 * @param {Object} data
 * @returns {Object}
 */
function validateEventUpdate(data) {
  return eventUpdateSchema.validate(data, { abortEarly: false });
}

/**
 * Validate event registration
 * @param {Object} data
 * @returns {Object}
 */
function validateRegistration(data) {
  return registrationSchema.validate(data, { abortEarly: false });
}

/**
 * Validate participant update
 * @param {Object} data
 * @returns {Object}
 */
function validateParticipantUpdate(data) {
  return participantUpdateSchema.validate(data, { abortEarly: false });
}

/**
 * Validate event translation
 * @param {Object} data
 * @returns {Object}
 */
function validateEventTranslation(data) {
  return translationSchema.validate(data, { abortEarly: false });
}

module.exports = {
  validateEvent,
  validateEventUpdate,
  validateRegistration,
  validateParticipantUpdate,
  validateEventTranslation,
}; 