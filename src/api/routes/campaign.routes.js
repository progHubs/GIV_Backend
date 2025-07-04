const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');
const { authenticateToken, requireAdmin } = require('../../middlewares/auth.middleware');

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
router.get('/:id/translations', campaignController.getCampaignTranslations);

// Protected routes (authentication required)
router.use(authenticateToken);

// Admin/Editor only routes
router.post('/', 
  requireAdmin, 
  campaignController.createCampaign
);

router.put('/:id', 
  requireAdmin, 
  campaignController.updateCampaign
);

router.delete('/:id', 
  requireAdmin, 
  campaignController.deleteCampaign
);

router.post('/:id/translations', requireAdmin, campaignController.addCampaignTranslation);
router.patch('/:id/translations/:language', requireAdmin, campaignController.updateCampaignTranslation);

module.exports = router; 