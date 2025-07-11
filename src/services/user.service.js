const { PrismaClient } = require('@prisma/client');
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
        is_donor,
        is_volunteer,
        has_profile_image,
        phone,
        created_after,
        created_before,
        updated_after,
        updated_before
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
          { full_name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } }
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

      if (is_donor !== undefined) {
        where.is_donor = is_donor;
      }

      if (is_volunteer !== undefined) {
        where.is_volunteer = is_volunteer;
      }

      if (has_profile_image !== undefined) {
        if (has_profile_image) {
          where.profile_image_url = { not: null };
        } else {
          where.profile_image_url = null;
        }
      }

      if (phone) {
        where.phone = { contains: phone };
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

      if (updated_after) {
        where.updated_at = {
          ...where.updated_at,
          gte: new Date(updated_after)
        };
      }

      if (updated_before) {
        where.updated_at = {
          ...where.updated_at,
          lte: new Date(updated_before)
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
   * Reactivate a soft-deleted user
   * @param {string} userId - User ID to reactivate
   * @param {Object} newData - New user data for reactivation
   * @returns {Object} - Reactivation result
   */
  async reactivateUser(userId, newData = {}) {
    try {
      // Check if user exists and is soft-deleted
      const existingUser = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: { not: null }
        },
        include: {
          volunteer_profiles: true,
          donor_profiles: true
        }
      });

      if (!existingUser) {
        return {
          success: false,
          error: 'Deleted user not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Prepare update data
      const updateData = {
        deleted_at: null,
        updated_at: new Date(),
        ...newData
      };

      // Reactivate user
      const reactivatedUser = await prisma.users.update({
        where: { id: BigInt(userId) },
        data: updateData,
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

      logger.info(`User ${userId} reactivated successfully`);

      return {
        success: true,
        user: {
          ...reactivatedUser,
          id: reactivatedUser.id.toString()
        },
        message: 'User reactivated successfully'
      };

    } catch (error) {
      logger.error('Error reactivating user:', error);
      return {
        success: false,
        error: 'Failed to reactivate user'
      };
    }
  }

  /**
   * Find user by email (including soft-deleted users)
   * @param {string} email - User email
   * @param {boolean} includeDeleted - Whether to include soft-deleted users
   * @returns {Object} - User or null
   */
  async findUserByEmail(email, includeDeleted = false) {
    try {
      const where = { email: email.toLowerCase() };

      if (!includeDeleted) {
        where.deleted_at = null;
      }

      const user = await prisma.users.findFirst({
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
          deleted_at: true
        }
      });

      return user ? {
        ...user,
        id: user.id.toString()
      } : null;

    } catch (error) {
      logger.error('Error finding user by email:', error);
      return null;
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
        is_donor,
        is_volunteer,
        has_volunteer_profile,
        has_donor_profile,
        has_profile_image,
        phone,
        email,
        full_name,
        created_after,
        created_before,
        updated_after,
        updated_before
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

      if (full_name) {
        where.full_name = { contains: full_name };
      }

      if (email) {
        where.email = { contains: email };
      }

      if (phone) {
        where.phone = { contains: phone };
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

      if (is_donor !== undefined) {
        where.is_donor = is_donor;
      }

      if (is_volunteer !== undefined) {
        where.is_volunteer = is_volunteer;
      }

      if (has_profile_image !== undefined) {
        if (has_profile_image) {
          where.profile_image_url = { not: null };
        } else {
          where.profile_image_url = null;
        }
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

      if (updated_after) {
        where.updated_at = {
          ...where.updated_at,
          gte: new Date(updated_after)
        };
      }

      if (updated_before) {
        where.updated_at = {
          ...where.updated_at,
          lte: new Date(updated_before)
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
      // Get stats sequentially to avoid connection pool exhaustion
      const totalUsers = await prisma.users.count({
        where: { deleted_at: null }
      });

      const verifiedUsers = await prisma.users.count({
        where: {
          deleted_at: null,
          email_verified: true
        }
      });

      const volunteerUsers = await prisma.users.count({
        where: {
          deleted_at: null,
          volunteer_profiles: { isNot: null }
        }
      });

      const donorUsers = await prisma.users.count({
        where: {
          deleted_at: null,
          donor_profiles: { isNot: null }
        }
      });

      const adminUsers = await prisma.users.count({
        where: {
          deleted_at: null,
          role: 'admin'
        }
      });

      const recentUsers = await prisma.users.count({
        where: {
          deleted_at: null,
          created_at: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      });

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