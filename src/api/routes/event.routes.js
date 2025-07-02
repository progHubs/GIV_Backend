const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticateToken, requireAdmin } = require('../../middlewares/auth.middleware');

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

module.exports = router; 