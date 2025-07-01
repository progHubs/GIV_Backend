const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteer.controller');
const { authenticateToken, requireAdmin, requireVolunteerFlag } = require('../../middlewares/auth.middleware');
const { volunteerValidation } = require('../validators/volunteer.validator');
const { generalLimiter } = require('../../middlewares/rate-limit.middleware');

/**
 * @route   GET /api/volunteers
 * @desc    Get all volunteers
 * @access  Private (Admin)
 */
router.get('/', 
  authenticateToken,
  requireAdmin,
  generalLimiter,
  volunteerController.getVolunteers
);

/**
 * @route   GET /api/volunteers/me
 * @desc    Get current user's volunteer profile
 * @access  Private
 */
router.get('/me',
  authenticateToken,
  generalLimiter,
  volunteerController.getCurrentVolunteer
);

/**
 * @route   GET /api/volunteers/search
 * @desc    Search volunteers
 * @access  Private (Admin)
 */
router.get('/search',
  authenticateToken,
  requireAdmin,
  generalLimiter,
  volunteerController.searchVolunteers
);

/**
 * @route   GET /api/volunteers/stats
 * @desc    Get volunteer statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/stats',
  authenticateToken,
  requireAdmin,
  generalLimiter,
  volunteerController.getVolunteerStats
);

/**
 * @route   POST /api/volunteers
 * @desc    Create volunteer profile
 * @access  Private
 */
router.post('/',
  authenticateToken,
  generalLimiter,
  volunteerValidation,
  volunteerController.createVolunteer
);

/**
 * @route   GET /api/volunteers/:id
 * @desc    Get volunteer by ID
 * @access  Private (Admin or own profile)
 */
router.get('/:id',
  authenticateToken,
  generalLimiter,
  volunteerController.getVolunteerById
);

/**
 * @route   PUT /api/volunteers/me
 * @desc    Update current user's volunteer profile
 * @access  Private
 */
router.put('/me',
  authenticateToken,
  generalLimiter,
  volunteerValidation,
  volunteerController.updateCurrentVolunteer
);

/**
 * @route   PUT /api/volunteers/:id
 * @desc    Update volunteer profile (admin or own profile)
 * @access  Private (Admin or own profile)
 */
router.put('/:id',
  authenticateToken,
  generalLimiter,
  volunteerValidation,
  volunteerController.updateVolunteer
);

/**
 * @route   PUT /api/volunteers/:id/background-check
 * @desc    Update background check status (admin only)
 * @access  Private (Admin)
 */
router.put('/:id/background-check',
  authenticateToken,
  requireAdmin,
  generalLimiter,
  volunteerController.updateBackgroundCheck
);

/**
 * @route   POST /api/volunteers/:id/hours
 * @desc    Add volunteer hours (admin only)
 * @access  Private (Admin)
 */
router.post('/:id/hours',
  authenticateToken,
  requireAdmin,
  generalLimiter,
  volunteerController.addVolunteerHours
);

/**
 * @route   DELETE /api/volunteers/me
 * @desc    Delete current user's volunteer profile
 * @access  Private
 */
router.delete('/me',
  authenticateToken,
  generalLimiter,
  volunteerController.deleteVolunteer
);

/**
 * @route   DELETE /api/volunteers/:id
 * @desc    Delete volunteer profile by ID (admin or self)
 * @access  Private (Admin or own profile)
 */
router.delete('/:id',
  authenticateToken,
  generalLimiter,
  volunteerController.deleteVolunteer
);

module.exports = router; 