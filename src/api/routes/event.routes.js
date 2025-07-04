const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticateToken, requireAdmin } = require('../../middlewares/auth.middleware');

/**
 * @route GET /api/v1/events/analytics
 * @desc Get aggregate analytics for all events (admin/organizer)
 */
router.get('/analytics', authenticateToken, requireAdmin, eventController.getAggregateEventAnalytics);

/**
 * @route GET /api/v1/events/analytics/export
 * @desc Export aggregate analytics for all events as CSV (admin)
 */
router.get('/analytics/export', authenticateToken, requireAdmin, eventController.exportAggregateEventAnalyticsCSV);

/**
 * @route GET /api/v1/events/calendar
 * @desc Get events for public calendar view
 */
router.get('/calendar', eventController.getCalendarEvents);

/**
 * @route GET /api/v1/events/featured
 * @desc Get featured events
 */
router.get('/featured', eventController.getFeaturedEvents);

/**
 * @route POST /api/v1/events
 * @desc Create a new event (admin)
 */
router.post('/', authenticateToken, requireAdmin, eventController.createEvent);

/**
 * @route GET /api/v1/events
 * @desc List/filter events (public)
 */
router.get('/', eventController.getEvents);

/**
 * @route GET /api/v1/events/:id
 * @desc Get event by ID (public)
 */
router.get('/:id', eventController.getEventById);

/**
 * @route PATCH /api/v1/events/:id
 * @desc Update event (admin)
 */
router.patch('/:id', authenticateToken, requireAdmin, eventController.updateEvent);

/**
 * @route DELETE /api/v1/events/:id
 * @desc Delete event (admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, eventController.deleteEvent);

/**
 * @route POST /api/v1/events/:id/register
 * @desc Register for event (authenticated user)
 */
router.post('/:id/register', authenticateToken, eventController.registerForEvent);

/**
 * @route GET /api/v1/events/:id/participants
 * @desc List participants (admin see all, others see own)
 */
router.get('/:id/participants', authenticateToken, eventController.listParticipants);

/**
 * @route PATCH /api/v1/events/:id/participants/:user_id
 * @desc Update participant (admin)
 */
router.patch('/:id/participants/:user_id', authenticateToken, requireAdmin, eventController.updateParticipant);

/**
 * @route DELETE /api/v1/events/:id/participants/:user_id
 * @desc Remove participant (admin)
 */
router.delete('/:id/participants/:user_id', authenticateToken, requireAdmin, eventController.removeParticipant);

/**
 * @route GET /api/v1/events/:id/analytics
 * @desc Get analytics for a single event (admin/organizer)
 */
router.get('/:id/analytics', authenticateToken, requireAdmin, eventController.getEventAnalytics);

/**
 * @route GET /api/v1/events/:id/analytics/export
 * @desc Export analytics for a single event as CSV (admin)
 */
router.get('/:id/analytics/export', authenticateToken, requireAdmin, eventController.exportEventAnalyticsCSV);

/**
 * @route GET /api/v1/events/:id/translations
 * @desc Get all translations for an event (public)
 */
router.get('/:id/translations', eventController.getEventTranslations);

/**
 * @route POST /api/v1/events/:id/translations
 * @desc Add a new translation for an event (admin/editor)
 */
router.post('/:id/translations', authenticateToken, requireAdmin, eventController.addEventTranslation);

/**
 * @route PATCH /api/v1/events/:id/translations/:language
 * @desc Update a translation for an event (admin/editor)
 */
router.patch('/:id/translations/:language', authenticateToken, requireAdmin, eventController.updateEventTranslation);

/**
 * @route DELETE /api/v1/events/:id/unregister
 * @desc Allow user to unregister themselves from an event
 */
router.delete('/:id/unregister', authenticateToken, eventController.unregisterFromEvent);

module.exports = router; 