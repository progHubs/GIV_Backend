const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donor.controller');
const { authenticateToken, requireRole } = require('../../middlewares/auth.middleware');
const { donorValidation } = require('../validators/donor.validator');
const { generalLimiter } = require('../../middlewares/rate-limit.middleware');

/**
 * @route   GET /api/donors
 * @desc    Get all donors
 * @access  Private (Admin)
 */
router.get('/', 
  authenticateToken,
  requireRole('admin'),
  generalLimiter,
  donorController.getDonors
);

/**
 * @route   GET /api/donors/me
 * @desc    Get current user's donor profile
 * @access  Private
 */
router.get('/me',
  authenticateToken,
  generalLimiter,
  donorController.getCurrentDonor
);

/**
 * @route   GET /api/donors/search
 * @desc    Search donors
 * @access  Private (Admin)
 */
router.get('/search',
  authenticateToken,
  requireRole('admin'),
  generalLimiter,
  donorController.searchDonors
);

/**
 * @route   GET /api/donors/stats
 * @desc    Get donor statistics (admin only)
 * @access  Private (Admin)
 */
router.get('/stats',
  authenticateToken,
  requireRole('admin'),
  generalLimiter,
  donorController.getDonorStats
);

/**
 * @route   POST /api/donors
 * @desc    Create donor profile
 * @access  Private
 */
router.post('/',
  authenticateToken,
  generalLimiter,
  donorValidation,
  donorController.createDonor
);

/**
 * @route   GET /api/donors/:id
 * @desc    Get donor by ID
 * @access  Private (Admin or own profile)
 */
router.get('/:id',
  authenticateToken,
  generalLimiter,
  donorController.getDonorById
);

/**
 * @route   PUT /api/donors/me
 * @desc    Update current user's donor profile
 * @access  Private
 */
router.put('/me',
  authenticateToken,
  generalLimiter,
  donorValidation,
  donorController.updateCurrentDonor
);

/**
 * @route   PUT /api/donors/:id
 * @desc    Update donor profile (admin or own profile)
 * @access  Private (Admin or own profile)
 */
router.put('/:id',
  authenticateToken,
  generalLimiter,
  donorValidation,
  donorController.updateDonor
);

/**
 * @route   PUT /api/donors/:id/tier
 * @desc    Update donation tier (admin only)
 * @access  Private (Admin)
 */
router.put('/:id/tier',
  authenticateToken,
  requireRole('admin'),
  generalLimiter,
  donorController.updateDonationTier
);

/**
 * @route   GET /api/donors/me/donations
 * @desc    Get current user's donation history
 * @access  Private
 */
router.get('/me/donations',
  authenticateToken,
  generalLimiter,
  donorController.getCurrentDonorDonations
);

/**
 * @route   GET /api/donors/:id/donations
 * @desc    Get donor's donation history
 * @access  Private (Admin or own profile)
 */
router.get('/:id/donations',
  authenticateToken,
  generalLimiter,
  donorController.getDonorDonations
);

/**
 * @route   GET /api/donors/:id/tax-receipt/:year
 * @desc    Generate tax receipt for a specific year
 * @access  Private (Admin or own profile)
 */
router.get('/:id/tax-receipt/:year',
  authenticateToken,
  generalLimiter,
  donorController.generateTaxReceipt
);

module.exports = router; 