const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticateToken, requireRole } = require('../../middlewares/auth.middleware');
const { userUpdateValidation } = require('../validators/user.validator');
const { generalLimiter } = require('../../middlewares/rate-limit.middleware');

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get('/', 
  authenticateToken,
  requireRole('admin'),
  generalLimiter,
  userController.getUsers
);

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me',
  authenticateToken,
  generalLimiter,
  userController.getCurrentUser
);

/**
 * @route   GET /api/users/search
 * @desc    Search users
 * @access  Private (Admin)
 */
router.get('/search',
  authenticateToken,
  requireRole('admin'),
  generalLimiter,
  userController.searchUsers
);

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/stats',
  authenticateToken,
  requireRole('admin'),
  generalLimiter,
  userController.getUserStats
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin or own profile)
 */
router.get('/:id',
  authenticateToken,
  generalLimiter,
  userController.getUserById
);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/me',
  authenticateToken,
  generalLimiter,
  userUpdateValidation,
  userController.updateCurrentUser
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile (admin or own profile)
 * @access  Private (Admin or own profile)
 */
router.put('/:id',
  authenticateToken,
  generalLimiter,
  userUpdateValidation,
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete('/:id',
  authenticateToken,
  requireRole('admin'),
  generalLimiter,
  userController.deleteUser
);

module.exports = router; 