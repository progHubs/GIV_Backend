const volunteerService = require('../../services/volunteer.service');
const logger = require('../../utils/logger.util');

/**
 * Volunteer Controller for GIV Society Backend
 * Handles all volunteer-related HTTP requests
 */
class VolunteerController {
  /**
   * Get all volunteers
   * GET /api/volunteers
   */
  async getVolunteers(req, res) {
    try {
      const filters = {
        search: req.query.search,
        location: req.query.location,
        area_of_expertise: req.query.area_of_expertise,
        background_check_status: req.query.background_check_status,
        training_completed: req.query.training_completed === 'true' ? true : 
                           req.query.training_completed === 'false' ? false : undefined,
        availability: req.query.availability,
        created_after: req.query.created_after,
        created_before: req.query.created_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await volunteerService.getAllVolunteers(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.volunteers,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Get volunteers controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Create volunteer profile
   * POST /api/volunteers
   */
  async createVolunteer(req, res) {
    try {
      const volunteerData = req.body;
      const userId = req.user.id;

      const result = await volunteerService.createVolunteerProfile(userId, volunteerData);

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
        data: result.volunteer,
        message: result.message
      });

    } catch (error) {
      logger.error('Create volunteer controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get volunteer by ID
   * GET /api/volunteers/:id
   */
  async getVolunteerById(req, res) {
    try {
      const { id } = req.params;

      const result = await volunteerService.getVolunteerById(id);

      if (!result.success) {
        if (result.code === 'VOLUNTEER_NOT_FOUND') {
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
        data: result.volunteer
      });

    } catch (error) {
      logger.error('Get volunteer by ID controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update volunteer profile
   * PUT /api/volunteers/:id
   */
  async updateVolunteer(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user is updating their own profile or is admin
      if (req.user.id !== id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own volunteer profile',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const result = await volunteerService.updateVolunteerProfile(id, updateData);

      if (!result.success) {
        if (result.code === 'VOLUNTEER_NOT_FOUND') {
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
        data: result.volunteer,
        message: result.message
      });

    } catch (error) {
      logger.error('Update volunteer controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Search volunteers
   * GET /api/volunteers/search
   */
  async searchVolunteers(req, res) {
    try {
      const searchCriteria = {
        query: req.query.q,
        location: req.query.location,
        area_of_expertise: req.query.area_of_expertise,
        background_check_status: req.query.background_check_status,
        training_completed: req.query.training_completed === 'true' ? true : 
                           req.query.training_completed === 'false' ? false : undefined,
        has_skills: req.query.has_skills === 'true' ? true : 
                   req.query.has_skills === 'false' ? false : undefined,
        min_hours: req.query.min_hours,
        max_hours: req.query.max_hours,
        created_after: req.query.created_after,
        created_before: req.query.created_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await volunteerService.searchVolunteers(searchCriteria, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.volunteers,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Search volunteers controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get volunteer statistics (admin only)
   * GET /api/volunteers/stats
   */
  async getVolunteerStats(req, res) {
    try {
      const result = await volunteerService.getVolunteerStats();

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
      logger.error('Get volunteer stats controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update background check status (admin only)
   * PUT /api/volunteers/:id/background-check
   */
  async updateBackgroundCheck(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required',
          code: 'VALIDATION_ERROR'
        });
      }

      const result = await volunteerService.updateBackgroundCheckStatus(id, status);

      if (!result.success) {
        if (result.code === 'VOLUNTEER_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        if (result.code === 'INVALID_STATUS') {
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
        data: result.volunteer,
        message: result.message
      });

    } catch (error) {
      logger.error('Update background check controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Add volunteer hours (admin only)
   * POST /api/volunteers/:id/hours
   */
  async addVolunteerHours(req, res) {
    try {
      const { id } = req.params;
      const { hours } = req.body;

      if (!hours) {
        return res.status(400).json({
          success: false,
          error: 'Hours is required',
          code: 'VALIDATION_ERROR'
        });
      }

      const result = await volunteerService.addVolunteerHours(id, hours);

      if (!result.success) {
        if (result.code === 'VOLUNTEER_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        if (result.code === 'INVALID_HOURS') {
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
        data: result.volunteer,
        message: result.message
      });

    } catch (error) {
      logger.error('Add volunteer hours controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get current user's volunteer profile
   * GET /api/volunteers/me
   */
  async getCurrentVolunteer(req, res) {
    try {
      const result = await volunteerService.getVolunteerById(req.user.id);

      if (!result.success) {
        if (result.code === 'VOLUNTEER_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: 'You do not have a volunteer profile',
            code: 'NO_VOLUNTEER_PROFILE'
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
        data: result.volunteer
      });

    } catch (error) {
      logger.error('Get current volunteer controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update current user's volunteer profile
   * PUT /api/volunteers/me
   */
  async updateCurrentVolunteer(req, res) {
    try {
      const updateData = req.body;
      const result = await volunteerService.updateVolunteerProfile(req.user.id, updateData);

      if (!result.success) {
        if (result.code === 'VOLUNTEER_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: 'You do not have a volunteer profile',
            code: 'NO_VOLUNTEER_PROFILE'
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
        data: result.volunteer,
        message: result.message
      });

    } catch (error) {
      logger.error('Update current volunteer controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

module.exports = new VolunteerController(); 