const { PrismaClient } = require('../generated/prisma');
const { validateDonorData } = require('../utils/validation.util');
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
 * Donor Service for GIV Society Backend
 * Handles all donor-related business logic
 */
class DonorService {
  /**
   * Get all donors
   * @param {Object} filters - Search filters
   * @param {Object} pagination - Pagination options
   * @returns {Object} - Donors list with pagination
   */
  async getAllDonors(filters = {}, pagination = {}) {
    try {
      const {
        search,
        donation_tier,
        is_recurring_donor,
        donation_frequency,
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
          { tax_receipt_email: { contains: search } }
        ];
      }

      if (donation_tier) {
        where.donation_tier = donation_tier;
      }

      if (is_recurring_donor !== undefined) {
        where.is_recurring_donor = is_recurring_donor;
      }

      if (donation_frequency) {
        where.donation_frequency = donation_frequency;
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

      // Get donors with pagination
      const [donors, totalCount] = await Promise.all([
        prisma.donor_profiles.findMany({
          where,
          select: {
            user_id: true,
            is_recurring_donor: true,
            preferred_payment_method: true,
            total_donated: true,
            donation_frequency: true,
            tax_receipt_email: true,
            is_anonymous: true,
            last_donation_date: true,
            donation_tier: true,
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
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.donor_profiles.count({ where })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Convert BigInt values to strings
      const processedDonors = donors.map(donor => convertBigIntToString(donor));

      return {
        success: true,
        donors: processedDonors,
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
      logger.error('Error getting all donors:', error);
      return {
        success: false,
        error: 'Failed to retrieve donors'
      };
    }
  }

  /**
   * Create donor profile
   * @param {string} userId - User ID
   * @param {Object} donorData - Donor profile data
   * @returns {Object} - Creation result
   */
  async createDonorProfile(userId, donorData) {
    try {
      // Validate donor data
      const validation = validateDonorData(donorData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Check if user exists and is not already a donor
      const existingUser = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: null
        },
        include: {
          donor_profiles: true
        }
      });

      if (!existingUser) {
        return {
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      if (existingUser.donor_profiles) {
        return {
          success: false,
          error: 'User already has a donor profile',
          code: 'PROFILE_EXISTS'
        };
      }

      // Create donor profile
      const donorProfile = await prisma.donor_profiles.create({
        data: {
          user_id: BigInt(userId),
          ...sanitized
        },
        select: {
          user_id: true,
          is_recurring_donor: true,
          preferred_payment_method: true,
          total_donated: true,
          donation_frequency: true,
          tax_receipt_email: true,
          is_anonymous: true,
          last_donation_date: true,
          donation_tier: true,
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

      // Set is_donor flag to true for the user
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { is_donor: true }
      });

      logger.info(`Donor profile created for user ${userId}`);

      // Convert BigInt values to strings
      const processedDonor = convertBigIntToString(donorProfile);

      return {
        success: true,
        donor: processedDonor,
        message: 'Donor profile created successfully'
      };

    } catch (error) {
      logger.error('Error creating donor profile:', error);
      return {
        success: false,
        error: 'Failed to create donor profile'
      };
    }
  }

  /**
   * Get donor by ID
   * @param {string} donorId - Donor user ID
   * @returns {Object} - Donor data
   */
  async getDonorById(donorId) {
    try {
      const donor = await prisma.donor_profiles.findFirst({
        where: {
          user_id: BigInt(donorId),
          users: {
            deleted_at: null
          }
        },
        select: {
          user_id: true,
          is_recurring_donor: true,
          preferred_payment_method: true,
          total_donated: true,
          donation_frequency: true,
          tax_receipt_email: true,
          is_anonymous: true,
          last_donation_date: true,
          donation_tier: true,
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
          }
        }
      });

      if (!donor) {
        return {
          success: false,
          error: 'Donor not found',
          code: 'DONOR_NOT_FOUND'
        };
      }

      // Convert BigInt values to strings
      const processedDonor = convertBigIntToString(donor);

      return {
        success: true,
        donor: processedDonor
      };

    } catch (error) {
      logger.error('Error getting donor by ID:', error);
      return {
        success: false,
        error: 'Failed to retrieve donor'
      };
    }
  }

  /**
   * Update donor profile
   * @param {string} donorId - Donor user ID
   * @param {Object} updateData - Data to update
   * @returns {Object} - Update result
   */
  async updateDonorProfile(donorId, updateData) {
    try {
      // Validate update data
      const validation = validateDonorData(updateData, true); // true for update mode
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Check if donor exists
      const existingDonor = await prisma.donor_profiles.findFirst({
        where: {
          user_id: BigInt(donorId),
          users: {
            deleted_at: null
          }
        }
      });

      if (!existingDonor) {
        return {
          success: false,
          error: 'Donor not found',
          code: 'DONOR_NOT_FOUND'
        };
      }

      // Update donor profile
      const updatedDonor = await prisma.donor_profiles.update({
        where: { user_id: BigInt(donorId) },
        data: {
          ...sanitized,
          updated_at: new Date()
        },
        select: {
          user_id: true,
          is_recurring_donor: true,
          preferred_payment_method: true,
          total_donated: true,
          donation_frequency: true,
          tax_receipt_email: true,
          is_anonymous: true,
          last_donation_date: true,
          donation_tier: true,
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

      logger.info(`Donor profile ${donorId} updated successfully`);

      // Convert BigInt values to strings
      const processedDonor = convertBigIntToString(updatedDonor);

      return {
        success: true,
        donor: processedDonor,
        message: 'Donor profile updated successfully'
      };

    } catch (error) {
      logger.error('Error updating donor profile:', error);
      return {
        success: false,
        error: 'Failed to update donor profile'
      };
    }
  }

  /**
   * Search donors
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @returns {Object} - Search results
   */
  async searchDonors(searchCriteria, pagination = {}) {
    try {
      const {
        query,
        donation_tier,
        is_recurring_donor,
        donation_frequency,
        min_total_donated,
        max_total_donated,
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
        users: {
          deleted_at: null
        }
      };

      if (query) {
        where.OR = [
          { users: { full_name: { contains: query } } },
          { users: { email: { contains: query } } },
          { tax_receipt_email: { contains: query } }
        ];
      }

      if (donation_tier) {
        where.donation_tier = donation_tier;
      }

      if (is_recurring_donor !== undefined) {
        where.is_recurring_donor = is_recurring_donor;
      }

      if (donation_frequency) {
        where.donation_frequency = donation_frequency;
      }

      if (min_total_donated !== undefined) {
        where.total_donated = {
          ...where.total_donated,
          gte: parseFloat(min_total_donated)
        };
      }

      if (max_total_donated !== undefined) {
        where.total_donated = {
          ...where.total_donated,
          lte: parseFloat(max_total_donated)
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

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Search donors with pagination
      const [donors, totalCount] = await Promise.all([
        prisma.donor_profiles.findMany({
          where,
          select: {
            user_id: true,
            is_recurring_donor: true,
            preferred_payment_method: true,
            total_donated: true,
            donation_frequency: true,
            tax_receipt_email: true,
            is_anonymous: true,
            last_donation_date: true,
            donation_tier: true,
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
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.donor_profiles.count({ where })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Convert BigInt values to strings
      const processedDonors = donors.map(donor => convertBigIntToString(donor));

      return {
        success: true,
        donors: processedDonors,
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
      logger.error('Error searching donors:', error);
      return {
        success: false,
        error: 'Failed to search donors'
      };
    }
  }

  /**
   * Get donor's donation history
   * @param {string} donorId - Donor user ID
   * @param {Object} pagination - Pagination options
   * @returns {Object} - Donation history
   */
  async getDonorDonations(donorId, pagination = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'donated_at',
        sortOrder = 'desc'
      } = pagination;

      // Check if donor exists
      const existingDonor = await prisma.donor_profiles.findFirst({
        where: {
          user_id: BigInt(donorId),
          users: {
            deleted_at: null
          }
        }
      });

      if (!existingDonor) {
        return {
          success: false,
          error: 'Donor not found',
          code: 'DONOR_NOT_FOUND'
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Get donations with pagination
      const [donations, totalCount] = await Promise.all([
        prisma.donations.findMany({
          where: {
            donor_id: BigInt(donorId)
          },
          select: {
            id: true,
            amount: true,
            currency: true,
            donation_type: true,
            payment_method: true,
            payment_status: true,
            transaction_id: true,
            receipt_url: true,
            is_acknowledged: true,
            is_tax_deductible: true,
            is_anonymous: true,
            notes: true,
            donated_at: true,
            created_at: true,
            updated_at: true,
            campaigns: {
              select: {
                id: true,
                title: true,
                slug: true,
                goal_amount: true,
                current_amount: true,
                image_url: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.donations.count({
          where: {
            donor_id: BigInt(donorId)
          }
        })
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Convert BigInt values to strings
      const processedDonations = donations.map(donation => convertBigIntToString(donation));

      return {
        success: true,
        donations: processedDonations,
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
      logger.error('Error getting donor donations:', error);
      return {
        success: false,
        error: 'Failed to retrieve donor donations'
      };
    }
  }

  /**
   * Get donor statistics
   * @returns {Object} - Donor statistics
   */
  async getDonorStats() {
    try {
      const [
        totalDonors,
        recurringDonors,
        anonymousDonors,
        totalDonated,
        averageDonation,
        recentDonors,
        donorsByTier,
        donorsByFrequency
      ] = await Promise.all([
        // Total donors
        prisma.donor_profiles.count({
          where: {
            users: { deleted_at: null }
          }
        }),
        // Recurring donors
        prisma.donor_profiles.count({
          where: {
            users: { deleted_at: null },
            is_recurring_donor: true
          }
        }),
        // Anonymous donors
        prisma.donor_profiles.count({
          where: {
            users: { deleted_at: null },
            is_anonymous: true
          }
        }),
        // Total donated amount
        prisma.donor_profiles.aggregate({
          where: {
            users: { deleted_at: null }
          },
          _sum: {
            total_donated: true
          }
        }),
        // Average donation amount
        prisma.donations.aggregate({
          _avg: {
            amount: true
          }
        }),
        // Recent donors (last 30 days)
        prisma.donor_profiles.count({
          where: {
            users: { deleted_at: null },
            created_at: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        // Donors by tier
        prisma.donor_profiles.groupBy({
          by: ['donation_tier'],
          where: {
            users: { deleted_at: null },
            donation_tier: { not: null }
          },
          _count: {
            donation_tier: true
          },
          orderBy: {
            _count: {
              donation_tier: 'desc'
            }
          }
        }),
        // Donors by frequency
        prisma.donor_profiles.groupBy({
          by: ['donation_frequency'],
          where: {
            users: { deleted_at: null },
            donation_frequency: { not: null }
          },
          _count: {
            donation_frequency: true
          },
          orderBy: {
            _count: {
              donation_frequency: 'desc'
            }
          }
        })
      ]);

      return {
        success: true,
        stats: {
          totalDonors,
          recurringDonors,
          anonymousDonors,
          totalDonated: totalDonated._sum.total_donated || 0,
          averageDonation: averageDonation._avg.amount ? parseFloat(averageDonation._avg.amount.toFixed(2)) : 0,
          recentDonors,
          donorsByTier: donorsByTier.map(item => ({
            tier: item.donation_tier,
            count: item._count.donation_tier
          })),
          donorsByFrequency: donorsByFrequency.map(item => ({
            frequency: item.donation_frequency,
            count: item._count.donation_frequency
          })),
          recurringRate: totalDonors > 0 ? (recurringDonors / totalDonors * 100).toFixed(2) : 0,
          anonymousRate: totalDonors > 0 ? (anonymousDonors / totalDonors * 100).toFixed(2) : 0
        }
      };

    } catch (error) {
      logger.error('Error getting donor stats:', error);
      return {
        success: false,
        error: 'Failed to retrieve donor statistics'
      };
    }
  }

  /**
   * Update donation tier
   * @param {string} donorId - Donor user ID
   * @param {string} tier - New donation tier
   * @returns {Object} - Update result
   */
  async updateDonationTier(donorId, tier) {
    try {
      // Validate tier
      const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
      if (!validTiers.includes(tier)) {
        return {
          success: false,
          error: 'Invalid donation tier',
          code: 'INVALID_TIER'
        };
      }

      // Check if donor exists
      const existingDonor = await prisma.donor_profiles.findFirst({
        where: {
          user_id: BigInt(donorId),
          users: {
            deleted_at: null
          }
        }
      });

      if (!existingDonor) {
        return {
          success: false,
          error: 'Donor not found',
          code: 'DONOR_NOT_FOUND'
        };
      }

      // Update donation tier
      const updatedDonor = await prisma.donor_profiles.update({
        where: { user_id: BigInt(donorId) },
        data: {
          donation_tier: tier,
          updated_at: new Date()
        },
        select: {
          user_id: true,
          donation_tier: true,
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

      logger.info(`Donation tier updated for donor ${donorId} to ${tier}`);

      // Convert BigInt values to strings
      const processedDonor = convertBigIntToString(updatedDonor);

      return {
        success: true,
        donor: processedDonor,
        message: `Donation tier updated to ${tier}`
      };

    } catch (error) {
      logger.error('Error updating donation tier:', error);
      return {
        success: false,
        error: 'Failed to update donation tier'
      };
    }
  }

  /**
   * Generate tax receipt for a specific year
   * @param {string} donorId - Donor user ID
   * @param {number} year - Tax year
   * @returns {Object} - Tax receipt data
   */
  async generateTaxReceipt(donorId, year) {
    try {
      // Check if donor exists
      const existingDonor = await prisma.donor_profiles.findFirst({
        where: {
          user_id: BigInt(donorId),
          users: {
            deleted_at: null
          }
        },
        select: {
          user_id: true,
          total_donated: true,
          tax_receipt_email: true,
          users: {
            select: {
              id: true,
              full_name: true,
              email: true
            }
          }
        }
      });

      if (!existingDonor) {
        return {
          success: false,
          error: 'Donor not found',
          code: 'DONOR_NOT_FOUND'
        };
      }

      // Get donations for the specified year
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31, 23, 59, 59, 999);

      const donations = await prisma.donations.findMany({
        where: {
          donor_id: BigInt(donorId),
          donated_at: {
            gte: startDate,
            lte: endDate
          },
          payment_status: 'completed',
          is_tax_deductible: true
        },
        select: {
          id: true,
          amount: true,
          currency: true,
          donation_type: true,
          donated_at: true,
          campaigns: {
            select: {
              id: true,
              title: true
            }
          }
        },
        orderBy: {
          donated_at: 'asc'
        }
      });

      // Calculate totals
      const totalAmount = donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0);
      const donationCount = donations.length;

      // Convert BigInt values to strings
      const processedDonations = donations.map(donation => convertBigIntToString(donation));
      const processedDonor = convertBigIntToString(existingDonor);

      const taxReceipt = {
        donor: processedDonor,
        year,
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        donationCount,
        donations: processedDonations,
        generatedAt: new Date().toISOString(),
        receiptNumber: `TAX-${year}-${donorId}-${Date.now()}`
      };

      logger.info(`Tax receipt generated for donor ${donorId} for year ${year}`);

      return {
        success: true,
        taxReceipt,
        message: `Tax receipt generated for ${year}`
      };

    } catch (error) {
      logger.error('Error generating tax receipt:', error);
      return {
        success: false,
        error: 'Failed to generate tax receipt'
      };
    }
  }

  /**
   * Delete donor profile
   * @param {string|number} userId - Donor user ID
   * @returns {Object} - Deletion result
   */
  async deleteDonorProfile(userId) {
    try {
      // Delete donor profile
      await prisma.donor_profiles.delete({
        where: { user_id: BigInt(userId) }
      });
      // Set is_donor flag to false
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { is_donor: false }
      });
      return { success: true, message: 'Donor profile deleted and is_donor flag unset.' };
    } catch (error) {
      logger.error('Error deleting donor profile:', error);
      return { success: false, error: 'Failed to delete donor profile' };
    }
  }
}

module.exports = new DonorService(); 