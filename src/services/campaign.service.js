const { PrismaClient } = require('../generated/prisma');
const logger = require('../utils/logger.util');
const { v4: uuidv4 } = require('uuid');
const { validateCreateCampaign, validateUpdateCampaign } = require('../api/validators/campaign.validator');

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
  // Convert BigInt
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  // Convert Decimal.js objects (Prisma decimal)
  if (typeof obj === 'object' && obj !== null && typeof obj.toFixed === 'function') {
    return obj.toFixed(2);
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
 * Campaign Service for GIV Society Backend
 * Handles all campaign-related business logic
 */
class CampaignService {
  /**
   * Get all campaigns with filters and pagination
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Object} - Campaigns list with pagination
   */
  async getAllCampaigns(filters = {}, pagination = {}) {
    try {
      const {
        search,
        category,
        language,
        is_active,
        is_featured,
        start_date,
        end_date
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
          { title: { contains: search } },
          { description: { contains: search } },
          { slug: { contains: search } }
        ];
      }

      if (category) {
        where.category = category;
      }

      if (language) {
        where.language = language;
      }

      if (is_active !== undefined) {
        where.is_active = is_active === 'true' ? true : false;
      }

      if (is_featured !== undefined) {
        where.is_featured = is_featured === 'true' ? true : false;
      }

      if (start_date) {
        where.start_date = {
          gte: new Date(start_date)
        };
      }

      if (end_date) {
        where.end_date = {
          lte: new Date(end_date)
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get campaigns with pagination
      const [campaigns, totalCount] = await Promise.all([
        prisma.campaigns.findMany({
          where,
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            goal_amount: true,
            current_amount: true,
            start_date: true,
            end_date: true,
            is_active: true,
            is_featured: true,
            category: true,
            progress_bar_color: true,
            image_url: true,
            video_url: true,
            donor_count: true,
            success_stories: true,
            language: true,
            translation_group_id: true,
            created_at: true,
            updated_at: true,
            created_by: true,
            users: {
              select: {
                id: true,
                full_name: true,
                email: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.campaigns.count({ where })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Convert BigInt values to strings and calculate progress
      const processedCampaigns = campaigns.map(campaign => {
        const processed = convertBigIntToString(campaign);
        processed.progress_percentage = campaign.goal_amount > 0
          ? Math.round((campaign.current_amount / campaign.goal_amount) * 100)
          : 0;
        return processed;
      });

      return {
        success: true,
        campaigns: processedCampaigns,
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
      logger.error('Error getting all campaigns:', error);
      return {
        success: false,
        error: 'Failed to retrieve campaigns',
        code: 'CAMPAIGNS_FETCH_ERROR'
      };
    }
  }

  /**
   * Create a new campaign
   * @param {Object} campaignData - Campaign data
   * @param {string} userId - User ID creating the campaign
   * @returns {Object} - Creation result
   */
  async createCampaign(campaignData, userId) {
    try {
      // Validate campaign data
      const validation = validateCreateCampaign(campaignData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Generate slug if not provided
      if (!sanitized.slug) {
        sanitized.slug = this.generateSlug(sanitized.title);
      }

      // Check if slug already exists
      const existingCampaign = await prisma.campaigns.findFirst({
        where: {
          slug: sanitized.slug,
          deleted_at: null
        }
      });

      if (existingCampaign) {
        return {
          success: false,
          errors: ['Campaign with this slug already exists'],
          code: 'SLUG_EXISTS'
        };
      }

      // Generate translation group ID if not provided
      if (!sanitized.translation_group_id) {
        sanitized.translation_group_id = uuidv4();
      }

      // Fix: JSON.stringify success_stories if present
      if (sanitized.success_stories) {
        sanitized.success_stories = JSON.stringify(sanitized.success_stories);
      }

      // Create campaign
      const campaign = await prisma.campaigns.create({
        data: {
          ...sanitized,
          created_by: userId,
          current_amount: 0.00,
          donor_count: 0
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          goal_amount: true,
          current_amount: true,
          start_date: true,
          end_date: true,
          is_active: true,
          is_featured: true,
          category: true,
          progress_bar_color: true,
          image_url: true,
          video_url: true,
          donor_count: true,
          success_stories: true,
          language: true,
          translation_group_id: true,
          created_at: true,
          updated_at: true,
          created_by: true
        }
      });

      // Convert BigInt values to strings
      const processedCampaign = convertBigIntToString(campaign);
      // Add progress_percentage to single campaign response
      processedCampaign.progress_percentage = processedCampaign.goal_amount > 0
        ? Math.round((processedCampaign.current_amount / processedCampaign.goal_amount) * 100)
        : 0;
      // Parse success_stories if present
      if (processedCampaign.success_stories && typeof processedCampaign.success_stories === 'string') {
        try {
          processedCampaign.success_stories = JSON.parse(processedCampaign.success_stories);
        } catch (e) {
          processedCampaign.success_stories = [];
        }
      }

      return {
        success: true,
        campaign: processedCampaign,
        message: 'Campaign created successfully'
      };

    } catch (error) {
      logger.error('Error creating campaign:', error);
      return {
        success: false,
        errors: ['Failed to create campaign'],
        code: 'CAMPAIGN_CREATE_ERROR'
      };
    }
  }

  /**
   * Get campaign by ID
   * @param {string} campaignId - Campaign ID
   * @returns {Object} - Campaign data
   */
  async getCampaignById(campaignId) {
    try {
      const campaign = await prisma.campaigns.findFirst({
        where: {
          id: parseInt(campaignId),
          deleted_at: null
        },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          goal_amount: true,
          current_amount: true,
          start_date: true,
          end_date: true,
          is_active: true,
          is_featured: true,
          category: true,
          progress_bar_color: true,
          image_url: true,
          video_url: true,
          donor_count: true,
          success_stories: true,
          language: true,
          translation_group_id: true,
          created_at: true,
          updated_at: true,
          created_by: true,
          users: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      });

      if (!campaign) {
        return {
          success: false,
          error: 'Campaign not found',
          code: 'CAMPAIGN_NOT_FOUND'
        };
      }

      // Convert BigInt values to strings and calculate progress
      const processedCampaign = convertBigIntToString(campaign);
      processedCampaign.progress_percentage = campaign.goal_amount > 0
        ? Math.round((campaign.current_amount / campaign.goal_amount) * 100)
        : 0;

      return {
        success: true,
        campaign: processedCampaign
      };

    } catch (error) {
      logger.error('Error getting campaign by ID:', error);
      return {
        success: false,
        error: 'Failed to retrieve campaign',
        code: 'CAMPAIGN_FETCH_ERROR'
      };
    }
  }

  /**
   * Update campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} updateData - Update data
   * @returns {Object} - Update result
   */
  async updateCampaign(campaignId, updateData) {
    try {
      // Check if campaign exists
      const existingCampaign = await prisma.campaigns.findFirst({
        where: {
          id: parseInt(campaignId),
          deleted_at: null
        }
      });

      if (!existingCampaign) {
        return {
          success: false,
          error: 'Campaign not found',
          code: 'CAMPAIGN_NOT_FOUND'
        };
      }

      // Validate update data
      const validation = validateUpdateCampaign(updateData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Check slug uniqueness if being updated
      if (sanitized.slug && sanitized.slug !== existingCampaign.slug) {
        const slugExists = await prisma.campaigns.findFirst({
          where: {
            slug: sanitized.slug,
            id: { not: parseInt(campaignId) },
            deleted_at: null
          }
        });

        if (slugExists) {
          return {
            success: false,
            errors: ['Campaign with this slug already exists'],
            code: 'SLUG_EXISTS'
          };
        }
      }

      // Update campaign
      const updatedCampaign = await prisma.campaigns.update({
        where: { id: parseInt(campaignId) },
        data: sanitized,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          goal_amount: true,
          current_amount: true,
          start_date: true,
          end_date: true,
          is_active: true,
          is_featured: true,
          category: true,
          progress_bar_color: true,
          image_url: true,
          video_url: true,
          donor_count: true,
          success_stories: true,
          language: true,
          translation_group_id: true,
          created_at: true,
          updated_at: true,
          created_by: true
        }
      });

      // Convert BigInt values to strings and calculate progress
      const processedCampaign = convertBigIntToString(updatedCampaign);
      processedCampaign.progress_percentage = updatedCampaign.goal_amount > 0
        ? Math.round((updatedCampaign.current_amount / updatedCampaign.goal_amount) * 100)
        : 0;

      return {
        success: true,
        campaign: processedCampaign,
        message: 'Campaign updated successfully'
      };

    } catch (error) {
      logger.error('Error updating campaign:', error);
      return {
        success: false,
        errors: ['Failed to update campaign'],
        code: 'CAMPAIGN_UPDATE_ERROR'
      };
    }
  }

  /**
   * Delete campaign (soft delete)
   * @param {string} campaignId - Campaign ID
   * @returns {Object} - Deletion result
   */
  async deleteCampaign(campaignId) {
    try {
      // Check if campaign exists
      const existingCampaign = await prisma.campaigns.findFirst({
        where: {
          id: parseInt(campaignId),
          deleted_at: null
        }
      });

      if (!existingCampaign) {
        return {
          success: false,
          error: 'Campaign not found',
          code: 'CAMPAIGN_NOT_FOUND'
        };
      }

      // Soft delete campaign
      await prisma.campaigns.update({
        where: { id: parseInt(campaignId) },
        data: { deleted_at: new Date() }
      });

      return {
        success: true,
        message: 'Campaign deleted successfully'
      };

    } catch (error) {
      logger.error('Error deleting campaign:', error);
      return {
        success: false,
        errors: ['Failed to delete campaign'],
        code: 'CAMPAIGN_DELETE_ERROR'
      };
    }
  }

  /**
   * Search campaigns with advanced filtering
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @param {string} language - Language filter
   * @returns {Object} - Search results
   */
  async searchCampaigns(searchCriteria, pagination = {}, language = null) {
    try {
      const {
        query,
        status,
        category,
        is_featured,
        // is_urgent, // Field doesn't exist in database
        has_image,
        min_goal,
        max_goal,
        min_raised,
        max_raised,
        min_donors,
        max_donors,
        min_progress,
        max_progress,
        start_date_after,
        start_date_before,
        end_date_after,
        end_date_before,
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

      if (language) {
        where.language = language;
      }

      if (query) {
        where.OR = [
          { title: { contains: query } },
          { description: { contains: query } },
          { slug: { contains: query } },
          { category: { contains: query } }
        ];
      }

      // Note: status field doesn't exist in campaigns table, using is_active instead
      if (status) {
        if (status === 'active') {
          where.is_active = true;
        } else if (status === 'inactive') {
          where.is_active = false;
        }
      }

      if (category) {
        where.category = category;
      }

      if (is_featured !== undefined) {
        where.is_featured = is_featured;
      }

      // Note: is_urgent field doesn't exist in campaigns table, skipping this filter
      // if (is_urgent !== undefined) {
      //   where.is_urgent = is_urgent;
      // }

      if (has_image !== undefined) {
        if (has_image) {
          where.image_url = { not: null };
        } else {
          where.image_url = null;
        }
      }

      if (min_goal !== undefined) {
        where.goal_amount = {
          ...where.goal_amount,
          gte: parseFloat(min_goal)
        };
      }

      if (max_goal !== undefined) {
        where.goal_amount = {
          ...where.goal_amount,
          lte: parseFloat(max_goal)
        };
      }

      if (min_raised !== undefined) {
        where.current_amount = {
          ...where.current_amount,
          gte: parseFloat(min_raised)
        };
      }

      if (max_raised !== undefined) {
        where.current_amount = {
          ...where.current_amount,
          lte: parseFloat(max_raised)
        };
      }

      if (min_donors !== undefined) {
        where.donor_count = {
          ...where.donor_count,
          gte: parseInt(min_donors)
        };
      }

      if (max_donors !== undefined) {
        where.donor_count = {
          ...where.donor_count,
          lte: parseInt(max_donors)
        };
      }

      // Progress percentage filtering (requires calculation)
      let progressFilter = null;
      if (min_progress !== undefined || max_progress !== undefined) {
        progressFilter = {
          min: min_progress ? parseFloat(min_progress) : 0,
          max: max_progress ? parseFloat(max_progress) : 100
        };
      }

      if (start_date_after) {
        where.start_date = {
          ...where.start_date,
          gte: new Date(start_date_after)
        };
      }

      if (start_date_before) {
        where.start_date = {
          ...where.start_date,
          lte: new Date(start_date_before)
        };
      }

      if (end_date_after) {
        where.end_date = {
          ...where.end_date,
          gte: new Date(end_date_after)
        };
      }

      if (end_date_before) {
        where.end_date = {
          ...where.end_date,
          lte: new Date(end_date_before)
        };
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

      // Search campaigns with pagination
      const [campaigns, totalCount] = await Promise.all([
        prisma.campaigns.findMany({
          where,
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            goal_amount: true,
            current_amount: true,
            donor_count: true,
            start_date: true,
            end_date: true,
            is_active: true,
            is_featured: true,
            category: true,
            progress_bar_color: true,
            image_url: true,
            language: true,
            created_at: true,
            updated_at: true
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.campaigns.count({ where })
      ]);

      // Convert BigInt values to strings and calculate progress
      let processedCampaigns = campaigns.map(campaign => {
        const processed = convertBigIntToString(campaign);
        processed.progress_percentage = campaign.goal_amount > 0
          ? Math.round((campaign.current_amount / campaign.goal_amount) * 100)
          : 0;
        return processed;
      });

      // Apply progress filtering if specified
      if (progressFilter) {
        processedCampaigns = processedCampaigns.filter(campaign => {
          const progress = campaign.progress_percentage;
          return progress >= progressFilter.min && progress <= progressFilter.max;
        });
      }

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        campaigns: processedCampaigns,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        total: totalCount
      };

    } catch (error) {
      logger.error('Error searching campaigns:', error);
      return {
        success: false,
        error: 'Failed to search campaigns',
        code: 'CAMPAIGN_SEARCH_ERROR'
      };
    }
  }

  /**
   * Get campaign statistics
   * @param {Object} filters - Date and category filters
   * @returns {Object} - Campaign statistics
   */
  async getCampaignStats(filters = {}) {
    try {
      const { start_date, end_date, category } = filters;

      const where = {
        deleted_at: null
      };

      if (start_date) {
        where.created_at = {
          ...where.created_at,
          gte: new Date(start_date)
        };
      }

      if (end_date) {
        where.created_at = {
          ...where.created_at,
          lte: new Date(end_date)
        };
      }

      if (category) {
        where.category = category;
      }

      // Get basic stats
      const [
        totalCampaigns,
        activeCampaigns,
        featuredCampaigns,
        totalGoalAmount,
        totalCurrentAmount,
        categoryStats
      ] = await Promise.all([
        prisma.campaigns.count({ where }),
        prisma.campaigns.count({ where: { ...where, is_active: true } }),
        prisma.campaigns.count({ where: { ...where, is_featured: true } }),
        prisma.campaigns.aggregate({
          where,
          _sum: { goal_amount: true }
        }),
        prisma.campaigns.aggregate({
          where,
          _sum: { current_amount: true }
        }),
        prisma.campaigns.groupBy({
          by: ['category'],
          where,
          _count: { category: true },
          _sum: { goal_amount: true, current_amount: true }
        })
      ]);

      const stats = {
        total_campaigns: totalCampaigns,
        active_campaigns: activeCampaigns,
        featured_campaigns: featuredCampaigns,
        total_goal_amount: totalGoalAmount._sum.goal_amount || 0,
        total_current_amount: totalCurrentAmount._sum.current_amount || 0,
        overall_progress_percentage: totalGoalAmount._sum.goal_amount > 0
          ? Math.round((totalCurrentAmount._sum.current_amount / totalGoalAmount._sum.goal_amount) * 100)
          : 0,
        category_breakdown: categoryStats.map(stat => ({
          category: stat.category,
          count: stat._count.category,
          goal_amount: stat._sum.goal_amount || 0,
          current_amount: stat._sum.current_amount || 0,
          progress_percentage: stat._sum.goal_amount > 0
            ? Math.round((stat._sum.current_amount / stat._sum.goal_amount) * 100)
            : 0
        }))
      };

      return {
        success: true,
        stats: convertBigIntToString(stats)
      };

    } catch (error) {
      logger.error('Error getting campaign stats:', error);
      return {
        success: false,
        error: 'Failed to retrieve campaign statistics',
        code: 'CAMPAIGN_STATS_ERROR'
      };
    }
  }

  /**
   * Generate slug from title
   * @param {string} title - Campaign title
   * @returns {string} - Generated slug
   */
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  /**
   * Get all translations for a campaign (by translation_group_id)
   * @param {string|number} campaignId
   * @returns {Promise<Object>}
   */
  async getCampaignTranslations(campaignId) {
    try {
      const campaign = await prisma.campaigns.findUnique({ where: { id: parseInt(campaignId) } });
      if (!campaign || !campaign.translation_group_id) return { success: false, error: 'Campaign or translation group not found' };
      const translations = await prisma.campaigns.findMany({
        where: { translation_group_id: campaign.translation_group_id, deleted_at: null },
        orderBy: { language: 'asc' },
      });
      return { success: true, translations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a new translation for a campaign (new language in translation group)
   * @param {string|number} campaignId
   * @param {Object} data
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async addCampaignTranslation(campaignId, data, user) {
    try {
      const campaign = await prisma.campaigns.findUnique({ where: { id: parseInt(campaignId) } });
      if (!campaign || !campaign.translation_group_id) return { success: false, error: 'Campaign or translation group not found' };
      // Only admin/editor can add
      if (!user || !['admin', 'editor'].includes(user.role)) return { success: false, error: 'Insufficient permissions' };
      // Prevent duplicate language
      const exists = await prisma.campaigns.findFirst({ where: { translation_group_id: campaign.translation_group_id, language: data.language, deleted_at: null } });
      if (exists) return { success: false, error: 'Translation for this language already exists' };
      const newTranslation = await prisma.campaigns.create({
        data: {
          ...data,
          start_date: data.start_date ? new Date(data.start_date) : undefined,
          end_date: data.end_date ? new Date(data.end_date) : undefined,
          translation_group_id: campaign.translation_group_id,
          created_by: user.id,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      return { success: true, translation: newTranslation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing translation for a campaign (by language in translation group)
   * @param {string|number} campaignId
   * @param {string} language
   * @param {Object} data
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async updateCampaignTranslation(campaignId, language, data, user) {
    try {
      const campaign = await prisma.campaigns.findUnique({ where: { id: parseInt(campaignId) } });
      if (!campaign || !campaign.translation_group_id) return { success: false, error: 'Campaign or translation group not found' };
      // Only admin/editor can update
      if (!user || !['admin', 'editor'].includes(user.role)) return { success: false, error: 'Insufficient permissions' };
      const translation = await prisma.campaigns.findFirst({ where: { translation_group_id: campaign.translation_group_id, language, deleted_at: null } });
      if (!translation) return { success: false, error: 'Translation not found for this language' };
      const updated = await prisma.campaigns.update({
        where: { id: translation.id },
        data: {
          ...data,
          start_date: data.start_date ? new Date(data.start_date) : undefined,
          end_date: data.end_date ? new Date(data.end_date) : undefined,
          updated_at: new Date(),
        },
      });
      return { success: true, translation: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new CampaignService(); 