const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');
const { authenticateToken, requireEditor, requireAdmin } = require('../../middlewares/auth.middleware');

/**
 * Campaign Routes for GIV Society Backend
 * Base path: /api/campaigns
 */

// Public routes (no authentication required)
router.get('/', campaignController.getCampaigns);
router.get('/search', campaignController.searchCampaigns);
router.get('/featured', campaignController.getFeaturedCampaigns);
router.get('/active', campaignController.getActiveCampaigns);
router.get('/stats', campaignController.getCampaignStats);
router.get('/:id', campaignController.getCampaignById);

// Protected routes (authentication required)
router.use(authenticateToken);

// Admin/Editor only routes
router.post('/', 
  requireEditor, 
  campaignController.createCampaign
);

router.put('/:id', 
  requireEditor, 
  campaignController.updateCampaign
);

router.delete('/:id', 
  requireAdmin, 
  campaignController.deleteCampaign
);

module.exports = router; 