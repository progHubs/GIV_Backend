const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donation.controller');
const { authenticateToken, requireAdmin } = require('../../middlewares/auth.middleware');

/**
 * Donation Routes for GIV Society Backend
 * Base path: /api/donations
 */

function optionalAuthenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
}

// Public route - anyone can create a donation (anonymous or authenticated)
router.post('/', optionalAuthenticateToken, donationController.createDonation);

// Admin-only routes (must come before /:id route)
router.get('/stats', authenticateToken, requireAdmin, donationController.getDonationStats);
router.patch('/:id/status', authenticateToken, requireAdmin, donationController.updateDonationStatus);
router.delete('/:id', authenticateToken, requireAdmin, donationController.deleteDonation);

// Authenticated routes - users must be logged in
router.get('/', authenticateToken, donationController.getDonations);
router.get('/:id', authenticateToken, donationController.getDonationById);

module.exports = router;
