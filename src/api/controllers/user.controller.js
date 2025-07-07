const userService = require('../../services/user.service');
const logger = require('../../utils/logger.util');

/**
 * User Controller for GIV Society Backend
 * Handles all user-related HTTP requests
 */
class UserController {
  /**
   * Get all users (admin only)
   * GET /api/users
   */
  async getUsers(req, res) {
    try {
      const filters = {
        search: req.query.search,
        role: req.query.role,
        email_verified: req.query.email_verified === 'true' ? true :
          req.query.email_verified === 'false' ? false : undefined,
        language_preference: req.query.language_preference,
        is_donor: req.query.is_donor === 'true' ? true :
          req.query.is_donor === 'false' ? false : undefined,
        is_volunteer: req.query.is_volunteer === 'true' ? true :
          req.query.is_volunteer === 'false' ? false : undefined,
        has_profile_image: req.query.has_profile_image === 'true' ? true :
          req.query.has_profile_image === 'false' ? false : undefined,
        phone: req.query.phone,
        created_after: req.query.created_after,
        created_before: req.query.created_before,
        updated_after: req.query.updated_after,
        updated_before: req.query.updated_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 100), // Max 100 items per page
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await userService.getAllUsers(filters, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Get users controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const includeProfiles = req.query.includeProfiles === 'true';

      const result = await userService.getUserById(id, includeProfiles);

      if (!result.success) {
        if (result.code === 'USER_NOT_FOUND') {
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
        data: result.user
      });

    } catch (error) {
      logger.error('Get user by ID controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/users/:id
   */
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if user is updating their own profile or is admin
      if (req.user.id !== id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own profile',
          code: 'INSUFFICIENT_PERMISSIONS'
        });
      }

      const result = await userService.updateUser(id, updateData);

      if (!result.success) {
        if (result.code === 'USER_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        if (result.code === 'EMAIL_EXISTS') {
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

      return res.status(200).json({
        success: true,
        data: result.user,
        message: result.message
      });

    } catch (error) {
      logger.error('Update user controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Delete user (admin only)
   * DELETE /api/users/:id
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const result = await userService.deleteUser(id, adminId);

      if (!result.success) {
        if (result.code === 'USER_NOT_FOUND') {
          return res.status(404).json({
            success: false,
            error: result.error,
            code: result.code
          });
        }
        if (result.code === 'SELF_DELETION_NOT_ALLOWED') {
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
        message: result.message
      });

    } catch (error) {
      logger.error('Delete user controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Search users
   * GET /api/users/search
   */
  async searchUsers(req, res) {
    try {
      const searchCriteria = {
        query: req.query.q,
        role: req.query.role,
        email_verified: req.query.email_verified === 'true' ? true :
          req.query.email_verified === 'false' ? false : undefined,
        language_preference: req.query.language_preference,
        is_donor: req.query.is_donor === 'true' ? true :
          req.query.is_donor === 'false' ? false : undefined,
        is_volunteer: req.query.is_volunteer === 'true' ? true :
          req.query.is_volunteer === 'false' ? false : undefined,
        has_volunteer_profile: req.query.has_volunteer_profile === 'true' ? true :
          req.query.has_volunteer_profile === 'false' ? false : undefined,
        has_donor_profile: req.query.has_donor_profile === 'true' ? true :
          req.query.has_donor_profile === 'false' ? false : undefined,
        has_profile_image: req.query.has_profile_image === 'true' ? true :
          req.query.has_profile_image === 'false' ? false : undefined,
        phone: req.query.phone,
        email: req.query.email,
        full_name: req.query.full_name,
        created_after: req.query.created_after,
        created_before: req.query.created_before,
        updated_after: req.query.updated_after,
        updated_before: req.query.updated_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await userService.searchUsers(searchCriteria, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });

    } catch (error) {
      logger.error('Search users controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get user statistics (admin only)
   * GET /api/users/stats
   */
  async getUserStats(req, res) {
    try {
      const result = await userService.getUserStats();

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
      logger.error('Get user stats controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/users/me
   */
  async getCurrentUser(req, res) {
    try {
      const result = await userService.getUserById(req.user.id, true);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.user
      });

    } catch (error) {
      logger.error('Get current user controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update current user profile
   * PUT /api/users/me
   */
  async updateCurrentUser(req, res) {
    try {
      const updateData = req.body;
      const result = await userService.updateUser(req.user.id, updateData);

      if (!result.success) {
        if (result.code === 'EMAIL_EXISTS') {
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

      return res.status(200).json({
        success: true,
        data: result.user,
        message: result.message
      });

    } catch (error) {
      logger.error('Update current user controller error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
}

module.exports = new UserController(); 