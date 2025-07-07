const { PrismaClient } = require('@prisma/client');
const { validateVolunteerData } = require('../utils/validation.util');
const logger = require('../utils/logger.util');

const prisma = new PrismaClient();

/**
 * Helper function to convert BigInt values to strings in objects
 * @param {any} obj - Object to process
 * @returns {any} - Object with BigInt values converted to strings
 */
const convertBigIntToString = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = convertBigIntToString(value);
    }
    return result;
  }

  return obj;
};

/**
 * Volunteer Service for GIV Society Backend
 * Handles all volunteer-related business logic
 */
class VolunteerService {
  /**
   * Get all volunteers
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Object} - Volunteers list with pagination
   */
  async getAllVolunteers(filters = {}, pagination = {}) {
    try {
      const {
        search,
        location,
        area_of_expertise,
        background_check_status,
        training_completed,
        availability,
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
        users: {
          deleted_at: null
        }
      };

      if (search) {
        where.OR = [
          { users: { full_name: { contains: search } } },
          { users: { email: { contains: search } } },
          { area_of_expertise: { contains: search } },
          { location: { contains: search } }
        ];
      }

      if (location) {
        where.location = { contains: location };
      }

      if (area_of_expertise) {
        where.area_of_expertise = { contains: area_of_expertise };
      }

      if (background_check_status) {
        where.background_check_status = background_check_status;
      }

      if (training_completed !== undefined) {
        where.training_completed = training_completed;
      }

      if (availability) {
        where.availability = { contains: availability };
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

      // Get volunteers with pagination
      const [volunteers, totalCount] = await Promise.all([
        prisma.volunteer_profiles.findMany({
          where,
          select: {
            user_id: true,
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
            updated_at: true,
            users: {
              select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                role: true,
                profile_image_url: true,
                language_preference: true,
                email_verified: true,
                created_at: true
              }
            },
            volunteer_skills: {
              select: {
                proficiency_level: true,
                is_verified: true,
                skills: {
                  select: {
                    id: true,
                    name: true,
                    category: true
                  }
                }
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.volunteer_profiles.count({ where })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Convert BigInt values to strings
      const processedVolunteers = volunteers.map(volunteer => convertBigIntToString(volunteer));

      return {
        success: true,
        volunteers: processedVolunteers,
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
      logger.error('Error getting all volunteers:', error);
      return {
        success: false,
        error: 'Failed to retrieve volunteers'
      };
    }
  }

  /**
   * Create volunteer profile
   * @param {string} userId - User ID
   * @param {Object} volunteerData - Volunteer profile data
   * @returns {Object} - Creation result
   */
  async createVolunteerProfile(userId, volunteerData) {
    try {
      // Validate volunteer data
      const validation = validateVolunteerData(volunteerData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Check if user exists and is not already a volunteer
      const existingUser = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: null
        },
        include: {
          volunteer_profiles: true
        }
      });

      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      if (existingUser.volunteer_profiles) {
        return {
          success: false,
          error: 'User already has a volunteer profile',
          code: 'PROFILE_EXISTS'
        };
      }

      // Create volunteer profile
      const volunteerProfile = await prisma.volunteer_profiles.create({
        data: {
          user_id: BigInt(userId),
          ...sanitized
        },
        select: {
          user_id: true,
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
          updated_at: true,
          users: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              role: true,
              profile_image_url: true,
              language_preference: true,
              email_verified: true
            }
          }
        }
      });

      // Set is_volunteer flag to true for the user
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { is_volunteer: true }
      });

      logger.info(`Volunteer profile created for user ${userId}`);

      // Convert BigInt values to strings
      const processedVolunteer = convertBigIntToString(volunteerProfile);

      return {
        success: true,
        volunteer: processedVolunteer,
        message: 'Volunteer profile created successfully'
      };

    } catch (error) {
      logger.error('Error creating volunteer profile:', error);
      return {
        success: false,
        error: 'Failed to create volunteer profile'
      };
    }
  }

  /**
   * Get volunteer by ID
   * @param {string} volunteerId - Volunteer user ID
   * @returns {Object} - Volunteer data
   */
  async getVolunteerById(volunteerId) {
    try {
      const volunteer = await prisma.volunteer_profiles.findFirst({
        where: {
          user_id: BigInt(volunteerId),
          users: {
            deleted_at: null
          }
        },
        select: {
          user_id: true,
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
          updated_at: true,
          users: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              role: true,
              profile_image_url: true,
              language_preference: true,
              email_verified: true,
              created_at: true
            }
          },
          volunteer_skills: {
            select: {
              proficiency_level: true,
              is_verified: true,
              skills: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                  description: true
                }
              }
            }
          }
        }
      });

      if (!volunteer) {
        return {
          success: false,
          error: 'Volunteer not found',
          code: 'VOLUNTEER_NOT_FOUND'
        };
      }

      // Convert BigInt values to strings
      const processedVolunteer = convertBigIntToString(volunteer);

      return {
        success: true,
        volunteer: processedVolunteer
      };

    } catch (error) {
      logger.error('Error getting volunteer by ID:', error);
      return {
        success: false,
        error: 'Failed to retrieve volunteer'
      };
    }
  }

  /**
   * Update volunteer profile
   * @param {string} volunteerId - Volunteer user ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Update result
   */
  async updateVolunteerProfile(volunteerId, updateData) {
    try {
      // Validate update data
      const validation = validateVolunteerData(updateData, true); // true for update mode
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Check if volunteer exists
      const existingVolunteer = await prisma.volunteer_profiles.findFirst({
        where: {
          user_id: BigInt(volunteerId),
          users: {
            deleted_at: null
          }
        }
      });

      if (!existingVolunteer) {
        return {
          success: false,
          error: 'Volunteer not found',
          code: 'VOLUNTEER_NOT_FOUND'
        };
      }

      // Update volunteer profile
      const updatedVolunteer = await prisma.volunteer_profiles.update({
        where: { user_id: BigInt(volunteerId) },
        data: {
          ...sanitized,
          updated_at: new Date()
        },
        select: {
          user_id: true,
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
          updated_at: true,
          users: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true,
              role: true,
              profile_image_url: true,
              language_preference: true,
              email_verified: true
            }
          }
        }
      });

      logger.info(`Volunteer profile ${volunteerId} updated successfully`);

      // Convert BigInt values to strings
      const processedVolunteer = convertBigIntToString(updatedVolunteer);

      return {
        success: true,
        volunteer: processedVolunteer,
        message: 'Volunteer profile updated successfully'
      };

    } catch (error) {
      logger.error('Error updating volunteer profile:', error);
      return {
        success: false,
        error: 'Failed to update volunteer profile'
      };
    }
  }

  /**
   * Search volunteers
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Object} - Search results
   */
  async searchVolunteers(searchCriteria, pagination = {}) {
    try {
      const {
        query,
        location,
        area_of_expertise,
        background_check_status,
        training_completed,
        has_skills,
        has_certificate,
        has_emergency_contact,
        min_hours,
        max_hours,
        min_rating,
        max_rating,
        min_events,
        max_events,
        skill_category,
        skill_name,
        proficiency_level,
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
        users: {
          deleted_at: null
        }
      };

      if (query) {
        where.OR = [
          { users: { full_name: { contains: query } } },
          { users: { email: { contains: query } } },
          { area_of_expertise: { contains: query } },
          { location: { contains: query } },
          { motivation: { contains: query } }
        ];
      }

      if (location) {
        where.location = { contains: location };
      }

      if (area_of_expertise) {
        where.area_of_expertise = { contains: area_of_expertise };
      }

      if (background_check_status) {
        where.background_check_status = background_check_status;
      }

      if (training_completed !== undefined) {
        where.training_completed = training_completed;
      }

      if (has_skills !== undefined) {
        if (has_skills) {
          where.volunteer_skills = { some: {} };
        } else {
          where.volunteer_skills = { none: {} };
        }
      }

      if (has_certificate !== undefined) {
        if (has_certificate) {
          where.certificate_url = { not: null };
        } else {
          where.certificate_url = null;
        }
      }

      if (has_emergency_contact !== undefined) {
        if (has_emergency_contact) {
          where.emergency_contact_name = { not: null };
        } else {
          where.emergency_contact_name = null;
        }
      }

      if (min_hours !== undefined) {
        where.total_hours = {
          ...where.total_hours,
          gte: parseInt(min_hours)
        };
      }

      if (max_hours !== undefined) {
        where.total_hours = {
          ...where.total_hours,
          lte: parseInt(max_hours)
        };
      }

      if (min_rating !== undefined) {
        where.rating = {
          ...where.rating,
          gte: parseFloat(min_rating)
        };
      }

      if (max_rating !== undefined) {
        where.rating = {
          ...where.rating,
          lte: parseFloat(max_rating)
        };
      }

      if (min_events !== undefined) {
        where.events_participated = {
          ...where.events_participated,
          gte: parseInt(min_events)
        };
      }

      if (max_events !== undefined) {
        where.events_participated = {
          ...where.events_participated,
          lte: parseInt(max_events)
        };
      }

      // Skill-based filtering
      if (skill_category || skill_name || proficiency_level) {
        const skillWhere = {};
        if (skill_category) {
          skillWhere.skills = { category: skill_category };
        }
        if (skill_name) {
          skillWhere.skills = {
            ...skillWhere.skills,
            name: { contains: skill_name }
          };
        }
        if (proficiency_level) {
          skillWhere.proficiency_level = proficiency_level;
        }
        where.volunteer_skills = { some: skillWhere };
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

      // Search volunteers with pagination
      const [volunteers, totalCount] = await Promise.all([
        prisma.volunteer_profiles.findMany({
          where,
          select: {
            user_id: true,
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
            updated_at: true,
            users: {
              select: {
                id: true,
                full_name: true,
                email: true,
                phone: true,
                role: true,
                profile_image_url: true,
                language_preference: true,
                email_verified: true
              }
            },
            volunteer_skills: {
              select: {
                proficiency_level: true,
                is_verified: true,
                skills: {
                  select: {
                    id: true,
                    name: true,
                    category: true
                  }
                }
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.volunteer_profiles.count({ where })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Convert BigInt values to strings
      const processedVolunteers = volunteers.map(volunteer => convertBigIntToString(volunteer));

      return {
        success: true,
        volunteers: processedVolunteers,
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
      logger.error('Error searching volunteers:', error);
      return {
        success: false,
        error: 'Failed to search volunteers'
      };
    }
  }

  /**
   * Get volunteer statistics
   * @returns {Object} - Volunteer statistics
   */
  async getVolunteerStats() {
    try {
      const [
        totalVolunteers,
        activeVolunteers,
        trainedVolunteers,
        backgroundCheckedVolunteers,
        totalHours,
        averageRating,
        recentVolunteers,
        volunteersByLocation
      ] = await Promise.all([
        // Total volunteers
        prisma.volunteer_profiles.count({
          where: {
            users: { deleted_at: null }
          }
        }),
        // Active volunteers (with recent activity)
        prisma.volunteer_profiles.count({
          where: {
            users: { deleted_at: null },
            total_hours: { gt: 0 }
          }
        }),
        // Trained volunteers
        prisma.volunteer_profiles.count({
          where: {
            users: { deleted_at: null },
            training_completed: true
          }
        }),
        // Background checked volunteers
        prisma.volunteer_profiles.count({
          where: {
            users: { deleted_at: null },
            background_check_status: 'approved'
          }
        }),
        // Total hours volunteered
        prisma.volunteer_profiles.aggregate({
          where: {
            users: { deleted_at: null }
          },
          _sum: {
            total_hours: true
          }
        }),
        // Average rating
        prisma.volunteer_profiles.aggregate({
          where: {
            users: { deleted_at: null },
            rating: { gt: 0 }
          },
          _avg: {
            rating: true
          }
        }),
        // Recent volunteers (last 30 days)
        prisma.volunteer_profiles.count({
          where: {
            users: { deleted_at: null },
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        // Volunteers by location
        prisma.volunteer_profiles.groupBy({
          by: ['location'],
          where: {
            users: { deleted_at: null },
            location: { not: null }
          },
          _count: {
            location: true
          },
          orderBy: {
            _count: {
              location: 'desc'
            }
          },
          take: 5
        })
      ]);

      return {
        success: true,
        stats: {
          totalVolunteers,
          activeVolunteers,
          trainedVolunteers,
          backgroundCheckedVolunteers,
          totalHours: totalHours._sum.total_hours || 0,
          averageRating: averageRating._avg.rating ? parseFloat(averageRating._avg.rating.toFixed(2)) : 0,
          recentVolunteers,
          volunteersByLocation: volunteersByLocation.map(item => ({
            location: item.location,
            count: item._count.location
          })),
          trainingRate: totalVolunteers > 0 ? (trainedVolunteers / totalVolunteers * 100).toFixed(2) : 0,
          backgroundCheckRate: totalVolunteers > 0 ? (backgroundCheckedVolunteers / totalVolunteers * 100).toFixed(2) : 0
        }
      };

    } catch (error) {
      logger.error('Error getting volunteer stats:', error);
      return {
        success: false,
        error: 'Failed to retrieve volunteer statistics'
      };
    }
  }

  /**
   * Update background check status
   * @param {string} volunteerId - Volunteer user ID
   * @param {string} status - Background check status
   * @returns {Object} - Update result
   */
  async updateBackgroundCheckStatus(volunteerId, status) {
    try {
      // Validate status
      const validStatuses = ['pending', 'approved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          error: 'Invalid background check status',
          code: 'INVALID_STATUS'
        };
      }

      // Check if volunteer exists
      const existingVolunteer = await prisma.volunteer_profiles.findFirst({
        where: {
          user_id: BigInt(volunteerId),
          users: {
            deleted_at: null
          }
        }
      });

      if (!existingVolunteer) {
        return {
          success: false,
          error: 'Volunteer not found',
          code: 'VOLUNTEER_NOT_FOUND'
        };
      }

      // Update background check status
      const updatedVolunteer = await prisma.volunteer_profiles.update({
        where: { user_id: BigInt(volunteerId) },
        data: {
          background_check_status: status,
          updated_at: new Date()
        },
        select: {
          user_id: true,
          background_check_status: true,
          updated_at: true,
          users: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      });

      logger.info(`Background check status updated for volunteer ${volunteerId} to ${status}`);

      // Convert BigInt values to strings
      const processedVolunteer = convertBigIntToString(updatedVolunteer);

      return {
        success: true,
        volunteer: processedVolunteer,
        message: `Background check status updated to ${status}`
      };

    } catch (error) {
      logger.error('Error updating background check status:', error);
      return {
        success: false,
        error: 'Failed to update background check status'
      };
    }
  }

  /**
   * Add hours to volunteer
   * @param {string} volunteerId - Volunteer user ID
   * @param {number} hours - Hours to add
   * @returns {Object} - Update result
   */
  async addVolunteerHours(volunteerId, hours) {
    try {
      // Validate hours
      if (!hours || hours <= 0) {
        return {
          success: false,
          error: 'Hours must be a positive number',
          code: 'INVALID_HOURS'
        };
      }

      // Check if volunteer exists
      const existingVolunteer = await prisma.volunteer_profiles.findFirst({
        where: {
          user_id: BigInt(volunteerId),
          users: {
            deleted_at: null
          }
        }
      });

      if (!existingVolunteer) {
        return {
          success: false,
          error: 'Volunteer not found',
          code: 'VOLUNTEER_NOT_FOUND'
        };
      }

      // Update total hours
      const updatedVolunteer = await prisma.volunteer_profiles.update({
        where: { user_id: BigInt(volunteerId) },
        data: {
          total_hours: {
            increment: hours
          },
          updated_at: new Date()
        },
        select: {
          user_id: true,
          total_hours: true,
          updated_at: true,
          users: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      });

      logger.info(`Added ${hours} hours to volunteer ${volunteerId}`);

      // Convert BigInt values to strings
      const processedVolunteer = convertBigIntToString(updatedVolunteer);

      return {
        success: true,
        volunteer: processedVolunteer,
        message: `Added ${hours} hours to volunteer`
      };

    } catch (error) {
      logger.error('Error adding volunteer hours:', error);
      return {
        success: false,
        error: 'Failed to add volunteer hours'
      };
    }
  }

  /**
   * Delete volunteer profile
   * @param {string|number} userId - Volunteer user ID
   * @returns {Object} - Deletion result
   */
  async deleteVolunteerProfile(userId) {
    try {
      // Delete volunteer profile
      await prisma.volunteer_profiles.delete({
        where: { user_id: BigInt(userId) }
      });
      // Set is_volunteer flag to false
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { is_volunteer: false }
      });
      return { success: true, message: 'Volunteer profile deleted and is_volunteer flag unset.' };
    } catch (error) {
      logger.error('Error deleting volunteer profile:', error);
      return { success: false, error: 'Failed to delete volunteer profile' };
    }
  }
}

module.exports = new VolunteerService(); 