const eventService = require('../../services/event.service');
const { validateEvent, validateEventUpdate, validateRegistration, validateParticipantUpdate, validateEventTranslation } = require('../validators/event.validator');
const { convertBigIntToString } = require('../../utils/validation.util');

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
 * Search events with advanced filtering
 * @route GET /api/v1/events/search
 */
exports.searchEvents = async (req, res) => {
  try {
    const searchCriteria = {
      query: req.query.q,
      status: req.query.status,
      event_type: req.query.event_type,
      location: req.query.location,
      is_featured: req.query.is_featured === 'true' ? true :
        req.query.is_featured === 'false' ? false : undefined,
      is_recurring: req.query.is_recurring === 'true' ? true :
        req.query.is_recurring === 'false' ? false : undefined,
      requires_registration: req.query.requires_registration === 'true' ? true :
        req.query.requires_registration === 'false' ? false : undefined,
      has_capacity_limit: req.query.has_capacity_limit === 'true' ? true :
        req.query.has_capacity_limit === 'false' ? false : undefined,
      min_capacity: req.query.min_capacity,
      max_capacity: req.query.max_capacity,
      min_registered: req.query.min_registered,
      max_registered: req.query.max_registered,
      start_date_after: req.query.start_date_after,
      start_date_before: req.query.start_date_before,
      end_date_after: req.query.end_date_after,
      end_date_before: req.query.end_date_before,
      created_after: req.query.created_after,
      created_before: req.query.created_before,
      updated_after: req.query.updated_after,
      updated_before: req.query.updated_before
    };

    const pagination = {
      page: parseInt(req.query.page) || 1,
      limit: Math.min(parseInt(req.query.limit) || 10, 100),
      sortBy: req.query.sortBy || 'event_date',
      sortOrder: req.query.sortOrder || 'asc'
    };

    const lang = req.query.lang || 'en';
    const result = await eventService.searchEvents(searchCriteria, pagination, lang);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: result.code
      });
    }

    return res.status(200).json({
      success: true,
      data: convertBigIntToString(result.events),
      pagination: result.pagination,
      total: result.total
    });

  } catch (error) {
    console.error('Error searching events:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
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

/**
 * Get analytics for a single event
 * @route GET /api/v1/events/:id/analytics
 */
exports.getEventAnalytics = async (req, res) => {
  try {
    const eventId = req.params.id;
    const result = await eventService.getEventAnalytics(eventId);
    if (!result.success) return res.status(404).json(convertBigIntToString(result));
    res.json(convertBigIntToString({ success: true, analytics: result.analytics }));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get aggregate analytics for all events
 * @route GET /api/v1/events/analytics
 */
exports.getAggregateEventAnalytics = async (req, res) => {
  try {
    const result = await eventService.getAggregateEventAnalytics();
    if (!result.success) return res.status(400).json(convertBigIntToString(result));
    res.json(convertBigIntToString({ success: true, analytics: result.analytics }));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Export analytics for a single event as CSV
 * @route GET /api/v1/events/:id/analytics/export
 */
exports.exportEventAnalyticsCSV = async (req, res) => {
  try {
    const eventId = req.params.id;
    const result = await eventService.getEventAnalyticsCSV(eventId);
    if (!result.success) return res.status(404).json(result);
    res.header('Content-Type', 'text/csv');
    res.attachment(`event_${eventId}_analytics.csv`);
    res.send(result.csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Export aggregate analytics for all events as CSV
 * @route GET /api/v1/events/analytics/export
 */
exports.exportAggregateEventAnalyticsCSV = async (req, res) => {
  try {
    const result = await eventService.getAggregateEventAnalyticsCSV();
    if (!result.success) return res.status(400).json(result);
    res.header('Content-Type', 'text/csv');
    res.attachment('events_aggregate_analytics.csv');
    res.send(result.csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get events for public calendar view
 * @route GET /api/v1/events/calendar
 */
exports.getCalendarEvents = async (req, res) => {
  try {
    const filters = req.query;
    const result = await eventService.getCalendarEvents(filters);
    if (!result.success) return res.status(400).json(result);
    res.json({ success: true, events: convertBigIntToString(result.events) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get featured events
 * @route GET /api/v1/events/featured
 */
exports.getFeaturedEvents = async (req, res) => {
  try {
    const result = await eventService.getFeaturedEvents();
    if (!result.success) return res.status(400).json(result);
    res.json({ success: true, events: convertBigIntToString(result.events) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Get all translations for an event
 * @route GET /api/v1/events/:id/translations
 */
exports.getEventTranslations = async (req, res) => {
  try {
    const eventId = req.params.id;
    const result = await eventService.getEventTranslations(eventId);
    if (!result.success) return res.status(404).json(result);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Add a new translation for an event
 * @route POST /api/v1/events/:id/translations
 */
exports.addEventTranslation = async (req, res) => {
  try {
    const { error } = validateEventTranslation(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });
    const eventId = req.params.id;
    const user = req.user;
    const result = await eventService.addEventTranslation(eventId, req.body, user);
    if (!result.success) return res.status(400).json(result);
    res.status(201).json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Update a translation for an event (by language)
 * @route PATCH /api/v1/events/:id/translations/:language
 */
exports.updateEventTranslation = async (req, res) => {
  try {
    const { error } = validateEventTranslation(req.body);
    if (error) return res.status(400).json({ success: false, error: error.details[0].message });
    const eventId = req.params.id;
    const language = req.params.language;
    const user = req.user;
    const result = await eventService.updateEventTranslation(eventId, language, req.body, user);
    if (!result.success) return res.status(400).json(result);
    res.json(convertBigIntToString(result));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Unregister self from an event
 * @route DELETE /api/v1/events/:id/unregister
 */
exports.unregisterFromEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const user = req.user;
    const result = await eventService.unregisterFromEvent(eventId, user);
    if (!result.success) return res.status(400).json(result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}; 