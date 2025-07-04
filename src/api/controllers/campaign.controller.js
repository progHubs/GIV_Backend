const campaignService = require('../../services/campaign.service');
const logger = require('../../utils/logger.util');
const { validateCampaignTranslation } = require('../validators/campaign.validator');
const { convertBigIntToString } = require('../../utils/validation.util');

/**
 * Campaign Controller for GIV Society Backend
 * Handles all campaign-related HTTP requests
 */
class CampaignController {
  /**
   * Get all campaigns
   * GET /api/campaigns
   */
  async getCampaigns(req, res) {
    try {
      const filters = {
        search: req.query.search,
        category: req.query.category,
        language: req.query.language || 'en',
        is_active: req.query.is_active,
        is_featured: req.query.is_featured,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await campaignService.getAllCampaigns(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.campaigns,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Get campaigns controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Create new campaign
   * POST /api/campaigns
   */
  async createCampaign(req, res) {
    try {
      const campaignData = req.body;
      const userId = req.user.id;

      const result = await campaignService.createCampaign(campaignData, userId);

      if (!result.success) {
        if (result.code === 'SLUG_EXISTS') {
          return res.status(409).json({
            success: false,
            error: result.errors[0],
            code: result.code
          });
        }
        if (result.code === 'VALIDATION_ERROR') {
          return res.status(400).json({
            success: false,
            errors: result.errors,
            code: result.code
          });
        }
        return res.status(400).json({
          success: false,
          error: result.errors[0],
          code: result.code
        });
      }

      return res.status(201).json({
        success: true,
        data: result.campaign,
        message: result.message
      });

    } catch (error) {
      logger.error('Create campaign controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get campaign by ID
   * GET /api/campaigns/:id
   */
  async getCampaignById(req, res) {
    try {
      const { id } = req.params;

      const result = await campaignService.getCampaignById(id);

      if (!result.success) {
        if (result.code === 'CAMPAIGN_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.campaign
      });

    } catch (error) {
      logger.error('Get campaign by ID controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update campaign
   * PUT /api/campaigns/:id
   */
  async updateCampaign(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user is admin or the campaign creator
      const campaign = await campaignService.getCampaignById(id);
      if (campaign.success && campaign.campaign.created_by !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You can only update campaigns you created',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const result = await campaignService.updateCampaign(id, updateData);

      if (!result.success) {
        if (result.code === 'CAMPAIGN_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        if (result.code === 'SLUG_EXISTS') {
          return res.status(409).json({
            success: false,
            error: result.errors[0],
            code: result.code
          });
        }
        if (result.code === 'VALIDATION_ERROR') {
          return res.status(400).json({
            success: false,
            errors: result.errors,
            code: result.code
          });
        }
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.campaign,
        message: result.message
      });

    } catch (error) {
      logger.error('Update campaign controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Delete campaign
   * DELETE /api/campaigns/:id
   */
  async deleteCampaign(req, res) {
    try {
      const { id } = req.params;

      // Check if user is admin or the campaign creator
      const campaign = await campaignService.getCampaignById(id);
      if (campaign.success && campaign.campaign.created_by !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You can only delete campaigns you created',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const result = await campaignService.deleteCampaign(id);

      if (!result.success) {
        if (result.code === 'CAMPAIGN_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      logger.error('Delete campaign controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Search campaigns
   * GET /api/campaigns/search
   */
  async searchCampaigns(req, res) {
    try {
      const { q, language } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required',
          code: 'SEARCH_QUERY_REQUIRED'
        });
      }

      const result = await campaignService.searchCampaigns(q, language);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.campaigns,
        count: result.count
      });

    } catch (error) {
      logger.error('Search campaigns controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get campaign statistics
   * GET /api/campaigns/stats
   */
  async getCampaignStats(req, res) {
    try {
      const filters = {
        start_date: req.query.start_date,
        end_date: req.query.end_date,
        category: req.query.category
      };

      const result = await campaignService.getCampaignStats(filters);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.stats
      });

    } catch (error) {
      logger.error('Get campaign stats controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get featured campaigns
   * GET /api/campaigns/featured
   */
  async getFeaturedCampaigns(req, res) {
    try {
      const filters = {
        is_featured: 'true',
        is_active: 'true',
        language: req.query.language
      };

      const pagination = {
        page: 1,
        limit: parseInt(req.query.limit) || 6,
        sortBy: 'created_at',
        sortOrder: 'desc'
      };

      const result = await campaignService.getAllCampaigns(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.campaigns
      });

    } catch (error) {
      logger.error('Get featured campaigns controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get active campaigns
   * GET /api/campaigns/active
   */
  async getActiveCampaigns(req, res) {
    try {
      const filters = {
        is_active: 'true',
        language: req.query.language,
        category: req.query.category
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 12,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await campaignService.getAllCampaigns(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.campaigns,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Get active campaigns controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get all translations for a campaign
   * GET /api/campaigns/:id/translations
   */
  async getCampaignTranslations(req, res) {
    try {
      const { id } = req.params;
      const result = await campaignService.getCampaignTranslations(id);
      if (!result.success) {
        return res.status(404).json(convertBigIntToString(result));
      }
      return res.status(200).json(convertBigIntToString({ success: true, data: result.translations }));
    } catch (error) {
      logger.error('Get campaign translations controller error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Add a new translation for a campaign
   * POST /api/campaigns/:id/translations
   */
  async addCampaignTranslation(req, res) {
    try {
      const { id } = req.params;
      const user = req.user;
      const result = await campaignService.addCampaignTranslation(id, req.body, user);
      if (!result.success) {
        return res.status(400).json(convertBigIntToString(result));
      }
      return res.status(201).json(convertBigIntToString(result));
    } catch (error) {
      logger.error('Add campaign translation controller error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }

  /**
   * Update a translation for a campaign (by language)
   * PATCH /api/campaigns/:id/translations/:language
   */
  async updateCampaignTranslation(req, res) {
    try {
      const { id, language } = req.params;
      const user = req.user;
      const result = await campaignService.updateCampaignTranslation(id, language, req.body, user);
      if (!result.success) {
        return res.status(400).json(convertBigIntToString(result));
      }
      return res.status(200).json(convertBigIntToString(result));
    } catch (error) {
      logger.error('Update campaign translation controller error:', error);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
}

module.exports = new CampaignController();
