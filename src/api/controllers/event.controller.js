const eventService = require('../../services/event.service');
const { validateEvent, validateEventUpdate, validateRegistration, validateParticipantUpdate } = require('../validators/event.validator');

// Utility to recursively convert BigInt to string in an object
function convertBigIntToString(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : convertBigIntToString(v)])
    );
  }
  return obj;
}

/**
 * Create a new event
 * @route POST /api/v1/events
 */
exports.createEvent = async (req, res) => {
  try {
    const { error } = validateEvent(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });
    const user = req.user;
    const result = await eventService.createEvent(req.body, user);
    if (!result.success) return res.status(400).json(result);
    res.status(201).json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * List/filter events (with multilingual support)
 * @route GET /api/v1/events
 */
exports.getEvents = async (req, res) => {
  try {
    const filters = req.query;
    const lang = req.query.lang || 'en';
    const result = await eventService.getEvents(filters, lang);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get event by ID
 * @route GET /api/v1/events/:id
 */
exports.getEventById = async (req, res) => {
  try {
    const id = req.params.id;
    const lang = req.query.lang || 'en';
    const result = await eventService.getEventById(id, lang);
    if (!result.success) return res.status(404).json(result);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update event
 * @route PATCH /api/v1/events/:id
 */
exports.updateEvent = async (req, res) => {
  try {
    const { error } = validateEventUpdate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });
    const id = req.params.id;
    const user = req.user;
    const result = await eventService.updateEvent(id, req.body, user);
    if (!result.success) return res.status(400).json(result);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Soft delete event
 * @route DELETE /api/v1/events/:id
 */
exports.deleteEvent = async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.user;
    const result = await eventService.deleteEvent(id, user);
    if (!result.success) return res.status(400).json(result);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Register for event
 * @route POST /api/v1/events/:id/register
 */
exports.registerForEvent = async (req, res) => {
  try {
    const { error } = validateRegistration(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });
    const user = req.user;
    const eventId = req.params.id;
    const result = await eventService.registerForEvent(eventId, user, req.body);
    if (!result.success) return res.status(400).json(result);
    res.status(201).json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * List participants for an event
 * @route GET /api/v1/events/:id/participants
 */
exports.listParticipants = async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = req.user;
    const result = await eventService.listParticipants(eventId, user);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update participant status/feedback
 * @route PATCH /api/v1/events/:id/participants/:user_id
 */
exports.updateParticipant = async (req, res) => {
  try {
    const { error } = validateParticipantUpdate(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });
    const eventId = req.params.id;
    const userId = req.params.user_id;
    const user = req.user;
    const result = await eventService.updateParticipant(eventId, userId, req.body, user);
    if (!result.success) return res.status(400).json(result);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Remove participant from event
 * @route DELETE /api/v1/events/:id/participants/:user_id
 */
exports.removeParticipant = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.params.user_id;
    const user = req.user;
    const result = await eventService.removeParticipant(eventId, userId, user);
    if (!result.success) return res.status(400).json(result);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 