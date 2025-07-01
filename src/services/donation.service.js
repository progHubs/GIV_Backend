const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const { convertBigIntToString } = require('../utils/validation.util');
const logger = require('../utils/logger.util');
const donorService = require('./donor.service');
const campaignService = require('./campaign.service');
const emailService = require('./email.service');

const ANONYMOUS_DONOR_ID = 0; // Reserved ID for anonymous donations

class DonationService {
  // Create a new donation
  async createDonation(data, user) {
    try {
      let donorId = data.donor_id;
      let isAnonymous = data.is_anonymous || false;
      let userId = user ? user.id : null;
      let createdDonorProfile = false;

      console.log('\n\n');
      console.log('data', data);
      console.log('user', user);
      console.log('donorId', donorId);
      console.log('isAnonymous', isAnonymous);
      console.log('userId', userId);
      console.log('\n\n');

      // Anonymous donation (no user)
      if (!userId || donorId === ANONYMOUS_DONOR_ID || isAnonymous) {
        donorId = ANONYMOUS_DONOR_ID;
        isAnonymous = true;
      } else {
        // Registered user
        // Check if user is already a donor
        const dbUser = await prisma.users.findUnique({ where: { id: BigInt(userId) } });
        if (dbUser && !dbUser.is_donor) {
          // Set is_donor flag
          await prisma.users.update({ where: { id: BigInt(userId) }, data: { is_donor: true } });
          // Create donor profile
          await prisma.donor_profiles.create({
            data: {
              user_id: userId,
              is_recurring_donor: false,
              is_anonymous: false
            }
          });
          createdDonorProfile = true;
        }
        donorId = userId;
      }

      // Create donation
      const donation = await prisma.donations.create({
        data: {
          ...data,
          donor_id: donorId,
          is_anonymous: isAnonymous,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Update donor profile stats
      await prisma.donor_profiles.update({
        where: { user_id: donorId },
        data: {
          total_donated: {
            increment: data.amount
          },
          last_donation_date: new Date(),
        }
      });

      // Update campaign stats
      await prisma.campaigns.update({
        where: { id: data.campaign_id },
        data: {
          current_amount: {
            increment: data.amount
          },
          donor_count: {
            increment: 1
          },
        }
      });

      // Send receipt if not anonymous
      if (donorId !== ANONYMOUS_DONOR_ID && user && user.email) {
        try {
          await emailService.sendDonationReceipt(user.email, donation);
        } catch (e) {
          logger.warn('Failed to send donation receipt email:', e);
        }
      }

      return { success: true, donation: convertBigIntToString(donation), createdDonorProfile };
    } catch (error) {
      logger.error('Error creating donation:', error);
      return { success: false, error: 'Failed to create donation', code: 'DONATION_CREATE_ERROR' };
    }
  }

  // List/filter donations (admin sees all, donor sees own)
  async getDonations(filters, user) {
    try {
      const where = {};
      if (filters.donor_id !== undefined) where.donor_id = filters.donor_id;
      if (filters.campaign_id) where.campaign_id = filters.campaign_id;
      if (filters.payment_status) where.payment_status = filters.payment_status;
      if (filters.donation_type) where.donation_type = filters.donation_type;
      if (filters.is_anonymous !== undefined) where.is_anonymous = filters.is_anonymous;
      if (filters.min_amount) where.amount = { ...where.amount, gte: filters.min_amount };
      if (filters.max_amount) where.amount = { ...where.amount, lte: filters.max_amount };
      if (filters.start_date) where.donated_at = { ...where.donated_at, gte: new Date(filters.start_date) };
      if (filters.end_date) where.donated_at = { ...where.donated_at, lte: new Date(filters.end_date) };
      // Donors can only see their own donations
      if (user && user.is_donor === true && user.role !== 'admin') {
        where.donor_id = user.id;
      }
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'desc';
      const [donations, totalCount] = await Promise.all([
        prisma.donations.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
        }),
        prisma.donations.count({ where })
      ]);
      const totalPages = Math.ceil(totalCount / limit);
      return {
        success: true,
        donations: donations.map(convertBigIntToString),
        pagination: { page, limit, totalCount, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
      };
    } catch (error) {
      logger.error('Error getting donations:', error);
      return { success: false, error: 'Failed to retrieve donations', code: 'DONATIONS_FETCH_ERROR' };
    }
  }

  // Get a single donation by ID
  async getDonationById(id, user) {
    try {
      // Validate id
      if (!id || isNaN(id)) {
        throw new Error('Invalid donation ID');
      }
      const donationId = typeof id === 'string' ? id : String(id);
      const donation = await prisma.donations.findUnique({ where: { id: BigInt(donationId) } });
      if (!donation) {
        return { success: false, error: 'Donation not found', code: 'DONATION_NOT_FOUND' };
      }
      // Donors can only see their own donations
      if (user && user.is_donor === true && user.role !== 'admin' && donation.donor_id !== user.id) {
        return { success: false, error: 'Access denied', code: 'INSUFFICIENT_PERMISSIONS' };
      }
      return { success: true, donation: convertBigIntToString(donation) };
    } catch (error) {
      logger.error('Error getting donation by ID:', error);
      return { success: false, error: 'Failed to retrieve donation', code: 'DONATION_FETCH_ERROR' };
    }
  }

  // Get donation statistics (admin)
  async getDonationStats(filters) {
    try {
      const where = {};
      if (filters.campaign_id) where.campaign_id = filters.campaign_id;
      if (filters.donor_id !== undefined) where.donor_id = filters.donor_id;
      if (filters.payment_status) where.payment_status = filters.payment_status;
      if (filters.donation_type) where.donation_type = filters.donation_type;
      const [totalDonations, totalAmount, completedAmount] = await Promise.all([
        prisma.donations.count({ where }),
        prisma.donations.aggregate({ where, _sum: { amount: true } }),
        prisma.donations.aggregate({ where: { ...where, payment_status: 'completed' }, _sum: { amount: true } })
      ]);
      return {
        success: true,
        stats: convertBigIntToString({
          total_donations: totalDonations,
          total_amount: totalAmount._sum.amount || 0,
          completed_amount: completedAmount._sum.amount || 0
        })
      };
    } catch (error) {
      logger.error('Error getting donation stats:', error);
      return { success: false, error: 'Failed to retrieve donation stats', code: 'DONATION_STATS_ERROR' };
    }
  }

  // Update donation status (admin)
  async updateDonationStatus(id, data) {
    try {
      const donation = await prisma.donations.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          updated_at: new Date(),
        },
      });
      return { success: true, donation: convertBigIntToString(donation) };
    } catch (error) {
      logger.error('Error updating donation status:', error);
      return { success: false, error: 'Failed to update donation status', code: 'DONATION_UPDATE_ERROR' };
    }
  }

  // Delete a donation (admin)
  async deleteDonation(id) {
    try {
      await prisma.donations.delete({ where: { id: parseInt(id) } });
      return { success: true };
    } catch (error) {
      logger.error('Error deleting donation:', error);
      return { success: false, error: 'Failed to delete donation', code: 'DONATION_DELETE_ERROR' };
    }
  }
}

module.exports = new DonationService(); 