const { PrismaClient } = require('../generated/prisma');
const { validateUserUpdateData } = require('../utils/validation.util');
const logger = require('../utils/logger.util');

const prisma = new PrismaClient();

/**
 * User Service for GIV Society Backend
 * Handles all user-related business logic
 */
class UserService {
  /**
   * Get all users (admin only)
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Object} - Users list with pagination
   */
  async getAllUsers(filters = {}, pagination = {}) {
    try {
      const {
        search,
        role,
        email_verified,
        language_preference,
        created_after,
        created_before
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = pagination;

      // Build where clause
      const where = {
        deleted_at: null
      };

      if (search) {
        where.OR = [
          { full_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (email_verified !== undefined) {
        where.email_verified = email_verified;
      }

      if (language_preference) {
        where.language_preference = language_preference;
      }

      if (created_after) {
        where.created_at = {
          ...where.created_at,
          gte: new Date(created_after)
        };
      }

      if (created_before) {
        where.created_at = {
          ...where.created_at,
          lte: new Date(created_before)
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get users with pagination
      const [users, totalCount] = await Promise.all([
        prisma.users.findMany({
          where,
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            role: true,
            profile_image_url: true,
            language_preference: true,
            email_verified: true,
            created_at: true,
            updated_at: true,
            volunteer_profiles: {
              select: {
                area_of_expertise: true,
                location: true,
                background_check_status: true,
                total_hours: true
              }
            },
            donor_profiles: {
              select: {
                total_donated: true,
                donation_tier: true,
                is_recurring_donor: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.users.count({ where })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        success: true,
        users: users.map(user => ({
          ...user,
          id: user.id.toString()
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      };

    } catch (error) {
      logger.error('Error getting all users:', error);
      return {
        success: false,
        error: 'Failed to retrieve users'
      };
    }
  }

  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @param {boolean} includeProfiles - Include volunteer/donor profiles
   * @returns {Object} - User data
   */
  async getUserById(userId, includeProfiles = false) {
    try {
      const select = {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        profile_image_url: true,
        language_preference: true,
        email_verified: true,
        created_at: true,
        updated_at: true
      };

      if (includeProfiles) {
        select.volunteer_profiles = {
          select: {
            area_of_expertise: true,
            location: true,
            availability: true,
            motivation: true,
            total_hours: true,
            certificate_url: true,
            registered_events_count: true,
            training_completed: true,
            background_check_status: true,
            emergency_contact_name: true,
            emergency_contact_phone: true,
            rating: true,
            created_at: true,
            updated_at: true
          }
        };
        select.donor_profiles = {
          select: {
            is_recurring_donor: true,
            preferred_payment_method: true,
            total_donated: true,
            donation_frequency: true,
            tax_receipt_email: true,
            is_anonymous: true,
            last_donation_date: true,
            donation_tier: true,
            created_at: true,
            updated_at: true
          }
        };
      }

      const user = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: null
        },
        select
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        user: {
          ...user,
          id: user.id.toString()
        }
      };

    } catch (error) {
      logger.error('Error getting user by ID:', error);
      return {
        success: false,
        error: 'Failed to retrieve user'
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Update result
   */
  async updateUser(userId, updateData) {
    try {
      // Validate update data
      const validation = validateUserUpdateData(updateData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Check if user exists
      const existingUser = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: null
        }
      });

      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Check if email is being updated and if it's already taken
      if (sanitized.email && sanitized.email !== existingUser.email) {
        const emailExists = await prisma.users.findFirst({
          where: {
            email: sanitized.email,
            deleted_at: null,
            id: { not: BigInt(userId) }
          }
        });

        if (emailExists) {
          return {
            success: false,
            error: 'Email already exists',
            code: 'EMAIL_EXISTS'
          };
        }
      }

      // Update user
      const updatedUser = await prisma.users.update({
        where: { id: BigInt(userId) },
        data: {
          ...sanitized,
          updated_at: new Date()
        },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          role: true,
          profile_image_url: true,
          language_preference: true,
          email_verified: true,
          created_at: true,
          updated_at: true
        }
      });

      logger.info(`User ${userId} updated successfully`);

      return {
        success: true,
        user: {
          ...updatedUser,
          id: updatedUser.id.toString()
        },
        message: 'User updated successfully'
      };

    } catch (error) {
      logger.error('Error updating user:', error);
      return {
        success: false,
        error: 'Failed to update user'
      };
    }
  }

  /**
   * Delete user (soft delete)
   * @param {string} userId - User ID
   * @param {string} adminId - Admin user ID performing the deletion
   * @returns {Object} - Deletion result
   */
  async deleteUser(userId, adminId) {
    try {
      // Check if user exists
      const existingUser = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: null
        }
      });

      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Prevent admin from deleting themselves
      if (userId === adminId) {
        return {
          success: false,
          error: 'Cannot delete your own account',
          code: 'SELF_DELETION_NOT_ALLOWED'
        };
      }

      // Soft delete user
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: {
          deleted_at: new Date(),
          updated_at: new Date()
        }
      });

      logger.info(`User ${userId} deleted by admin ${adminId}`);

      return {
        success: true,
        message: 'User deleted successfully'
      };

    } catch (error) {
      logger.error('Error deleting user:', error);
      return {
        success: false,
        error: 'Failed to delete user'
      };
    }
  }

  /**
   * Search users
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Object} - Search results
   */
  async searchUsers(searchCriteria, pagination = {}) {
    try {
      const {
        query,
        role,
        email_verified,
        language_preference,
        has_volunteer_profile,
        has_donor_profile,
        created_after,
        created_before
      } = searchCriteria;

      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortOrder = 'desc'
      } = pagination;

      // Build where clause
      const where = {
        deleted_at: null
      };

      if (query) {
        where.OR = [
          { full_name: { contains: query } },
          { email: { contains: query } },
          { phone: { contains: query } }
        ];
      }

      if (role) {
        where.role = role;
      }

      if (email_verified !== undefined) {
        where.email_verified = email_verified;
      }

      if (language_preference) {
        where.language_preference = language_preference;
      }

      if (has_volunteer_profile !== undefined) {
        if (has_volunteer_profile) {
          where.volunteer_profiles = { isNot: null };
        } else {
          where.volunteer_profiles = null;
        }
      }

      if (has_donor_profile !== undefined) {
        if (has_donor_profile) {
          where.donor_profiles = { isNot: null };
        } else {
          where.donor_profiles = null;
        }
      }

      if (created_after) {
        where.created_at = {
          ...where.created_at,
          gte: new Date(created_after)
        };
      }

      if (created_before) {
        where.created_at = {
          ...where.created_at,
          lte: new Date(created_before)
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Search users with pagination
      const [users, totalCount] = await Promise.all([
        prisma.users.findMany({
          where,
          select: {
            id: true,
            full_name: true,
            email: true,
            phone: true,
            role: true,
            profile_image_url: true,
            language_preference: true,
            email_verified: true,
            created_at: true,
            updated_at: true,
            volunteer_profiles: {
              select: {
                area_of_expertise: true,
                location: true,
                background_check_status: true
              }
            },
            donor_profiles: {
              select: {
                total_donated: true,
                donation_tier: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.users.count({ where })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return {
        success: true,
        users: users.map(user => ({
          ...user,
          id: user.id.toString()
        })),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      };

    } catch (error) {
      logger.error('Error searching users:', error);
      return {
        success: false,
        error: 'Failed to search users'
      };
    }
  }

  /**
   * Get user statistics
   * @returns {Object} - User statistics
   */
  async getUserStats() {
    try {
      const [
        totalUsers,
        verifiedUsers,
        volunteerUsers,
        donorUsers,
        adminUsers,
        recentUsers
      ] = await Promise.all([
        // Total users
        prisma.users.count({
          where: { deleted_at: null }
        }),
        // Verified users
        prisma.users.count({
          where: {
            deleted_at: null,
            email_verified: true
          }
        }),
        // Users with volunteer profiles
        prisma.users.count({
          where: {
            deleted_at: null,
            volunteer_profiles: { isNot: null }
          }
        }),
        // Users with donor profiles
        prisma.users.count({
          where: {
            deleted_at: null,
            donor_profiles: { isNot: null }
          }
        }),
        // Admin users
        prisma.users.count({
          where: {
            deleted_at: null,
            role: 'admin'
          }
        }),
        // Users created in last 30 days
        prisma.users.count({
          where: {
            deleted_at: null,
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        success: true,
        stats: {
          totalUsers,
          verifiedUsers,
          volunteerUsers,
          donorUsers,
          adminUsers,
          recentUsers,
          verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : 0
        }
      };

    } catch (error) {
      logger.error('Error getting user stats:', error);
      return {
        success: false,
        error: 'Failed to retrieve user statistics'
      };
    }
  }
}

module.exports = new UserService(); 