const donorService = require('../../services/donor.service');
const logger = require('../../utils/logger.util');

/**
 * Donor Controller for GIV Society Backend
 * Handles all donor-related HTTP requests
 */
class DonorController {
  /**
   * Get all donors
   * GET /api/donors
   */
  async getDonors(req, res) {
    try {
      const filters = {
        search: req.query.search,
        donation_tier: req.query.donation_tier,
        is_recurring_donor: req.query.is_recurring_donor === 'true' ? true : 
                           req.query.is_recurring_donor === 'false' ? false : undefined,
        donation_frequency: req.query.donation_frequency,
        created_after: req.query.created_after,
        created_before: req.query.created_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await donorService.getAllDonors(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.donors,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Get donors controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Create donor profile
   * POST /api/donors
   */
  async createDonor(req, res) {
    try {
      const donorData = req.body;
      const userId = req.user.id;

      const result = await donorService.createDonorProfile(userId, donorData);

      if (!result.success) {
        if (result.code === 'USER_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        if (result.code === 'PROFILE_EXISTS') {
          return res.status(409).json({
            success: false,
            error: result.error,
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

      return res.status(201).json({
        success: true,
        data: result.donor,
        message: result.message
      });

    } catch (error) {
      logger.error('Create donor controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get donor by ID
   * GET /api/donors/:id
   */
  async getDonorById(req, res) {
    try {
      const { id } = req.params;

      const result = await donorService.getDonorById(id);

      if (!result.success) {
        if (result.code === 'DONOR_NOT_FOUND') {
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
        data: result.donor
      });

    } catch (error) {
      logger.error('Get donor by ID controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update donor profile
   * PUT /api/donors/:id
   */
  async updateDonor(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user is updating their own profile or is admin
      if (req.user.id !== id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own donor profile',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const result = await donorService.updateDonorProfile(id, updateData);

      if (!result.success) {
        if (result.code === 'DONOR_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
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
        data: result.donor,
        message: result.message
      });

    } catch (error) {
      logger.error('Update donor controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Search donors
   * GET /api/donors/search
   */
  async searchDonors(req, res) {
    try {
      const searchCriteria = {
        query: req.query.q,
        donation_tier: req.query.donation_tier,
        is_recurring_donor: req.query.is_recurring_donor === 'true' ? true : 
                           req.query.is_recurring_donor === 'false' ? false : undefined,
        donation_frequency: req.query.donation_frequency,
        min_total_donated: req.query.min_total_donated,
        max_total_donated: req.query.max_total_donated,
        created_after: req.query.created_after,
        created_before: req.query.created_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await donorService.searchDonors(searchCriteria, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.donors,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Search donors controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get donor's donation history
   * GET /api/donors/:id/donations
   */
  async getDonorDonations(req, res) {
    try {
      const { id } = req.params;
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'donated_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await donorService.getDonorDonations(id, pagination);

      if (!result.success) {
        if (result.code === 'DONOR_NOT_FOUND') {
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
        data: result.donations,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Get donor donations controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get donor statistics (admin only)
   * GET /api/donors/stats
   */
  async getDonorStats(req, res) {
    try {
      const result = await donorService.getDonorStats();

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
      logger.error('Get donor stats controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update donation tier (admin only)
   * PUT /api/donors/:id/tier
   */
  async updateDonationTier(req, res) {
    try {
      const { id } = req.params;
      const { tier } = req.body;

      if (!tier) {
        return res.status(400).json({
          success: false,
          error: 'Tier is required',
          code: 'VALIDATION_ERROR'
        });
      }

      const result = await donorService.updateDonationTier(id, tier);

      if (!result.success) {
        if (result.code === 'DONOR_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        if (result.code === 'INVALID_TIER') {
          return res.status(400).json({
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
        data: result.donor,
        message: result.message
      });

    } catch (error) {
      logger.error('Update donation tier controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Generate tax receipt
   * GET /api/donors/:id/tax-receipt/:year
   */
  async generateTaxReceipt(req, res) {
    try {
      const { id, year } = req.params;

      if (!year || isNaN(parseInt(year))) {
        return res.status(400).json({
          success: false,
          error: 'Valid year is required',
          code: 'VALIDATION_ERROR'
        });
      }

      const result = await donorService.generateTaxReceipt(id, parseInt(year));

      if (!result.success) {
        if (result.code === 'DONOR_NOT_FOUND') {
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
        data: result.taxReceipt,
        message: result.message
      });

    } catch (error) {
      logger.error('Generate tax receipt controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get current user's donor profile
   * GET /api/donors/me
   */
  async getCurrentDonor(req, res) {
    try {
      const result = await donorService.getDonorById(req.user.id);

      if (!result.success) {
        if (result.code === 'DONOR_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: 'You do not have a donor profile',
            code: 'NO_DONOR_PROFILE'
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
        data: result.donor
      });

    } catch (error) {
      logger.error('Get current donor controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update current user's donor profile
   * PUT /api/donors/me
   */
  async updateCurrentDonor(req, res) {
    try {
      const updateData = req.body;
      const result = await donorService.updateDonorProfile(req.user.id, updateData);

      if (!result.success) {
        if (result.code === 'DONOR_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: 'You do not have a donor profile',
            code: 'NO_DONOR_PROFILE'
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
        data: result.donor,
        message: result.message
      });

    } catch (error) {
      logger.error('Update current donor controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get current user's donation history
   * GET /api/donors/me/donations
   */
  async getCurrentDonorDonations(req, res) {
    try {
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'donated_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await donorService.getDonorDonations(req.user.id, pagination);

      if (!result.success) {
        if (result.code === 'DONOR_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: 'You do not have a donor profile',
            code: 'NO_DONOR_PROFILE'
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
        data: result.donations,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Get current donor donations controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

module.exports = new DonorController(); 