const donationService = require('../../services/donation.service');
const {
  validateCreateDonation,
  validateUpdateDonationStatus,
  validateDonationQuery
} = require('../validators/donation.validator');

class DonationController {
  // Create a new donation
  async createDonation(req, res) {
    const { isValid, errors, sanitized } = validateCreateDonation(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors, code: 'VALIDATION_ERROR' });
    }
    // If user is authenticated, pass user; else, pass null for anonymous
    console.log('req.user', req.user);
    const user = req.user || null;
    const result = await donationService.createDonation(sanitized, user);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, code: result.code });
    }
    return res.status(201).json({ success: true, data: result.donation, message: 'Donation created successfully' });
  }

  // List/filter donations
  async getDonations(req, res) {
    const { isValid, errors, sanitized } = validateDonationQuery(req.query);
    if (!isValid) {
      return res.status(400).json({ success: false, errors, code: 'VALIDATION_ERROR' });
    }
    const user = req.user || null;
    const result = await donationService.getDonations(sanitized, user);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, code: result.code });
    }
    return res.status(200).json({ success: true, data: result.donations, pagination: result.pagination });
  }

  // Get a single donation by ID
  async getDonationById(req, res) {
    const { id } = req.params;
    const user = req.user || null;
    const result = await donationService.getDonationById(id, user);
    if (!result.success) {
      return res.status(result.code === 'DONATION_NOT_FOUND' ? 404 : 403).json({ success: false, error: result.error, code: result.code });
    }
    return res.status(200).json({ success: true, data: result.donation });
  }

  // Get donation statistics (admin)
  async getDonationStats(req, res) {
    const { isValid, errors, sanitized } = validateDonationQuery(req.query);
    if (!isValid) {
      return res.status(400).json({ success: false, errors, code: 'VALIDATION_ERROR' });
    }
    const result = await donationService.getDonationStats(sanitized);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, code: result.code });
    }
    return res.status(200).json({ success: true, data: result.stats });
  }

  // Update donation status (admin)
  async updateDonationStatus(req, res) {
    const { id } = req.params;
    const { isValid, errors, sanitized } = validateUpdateDonationStatus(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors, code: 'VALIDATION_ERROR' });
    }
    const result = await donationService.updateDonationStatus(id, sanitized);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, code: result.code });
    }
    return res.status(200).json({ success: true, data: result.donation, message: 'Donation status updated' });
  }

  // Search donations with advanced filtering
  async searchDonations(req, res) {
    try {
      const searchCriteria = {
        query: req.query.q,
        status: req.query.status,
        payment_method: req.query.payment_method,
        is_anonymous: req.query.is_anonymous === 'true' ? true :
          req.query.is_anonymous === 'false' ? false : undefined,
        is_recurring: req.query.is_recurring === 'true' ? true :
          req.query.is_recurring === 'false' ? false : undefined,
        has_tax_receipt: req.query.has_tax_receipt === 'true' ? true :
          req.query.has_tax_receipt === 'false' ? false : undefined,
        min_amount: req.query.min_amount,
        max_amount: req.query.max_amount,
        currency: req.query.currency,
        campaign_id: req.query.campaign_id,
        donor_id: req.query.donor_id,
        donor_email: req.query.donor_email,
        donor_name: req.query.donor_name,
        created_after: req.query.created_after,
        created_before: req.query.created_before,
        updated_after: req.query.updated_after,
        updated_before: req.query.updated_before
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 100),
        sortBy: req.query.sortBy || 'created_at',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const user = req.user || null;
      const result = await donationService.searchDonations(searchCriteria, pagination, user);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        data: result.donations,
        pagination: result.pagination,
        total: result.total
      });

    } catch (error) {
      console.error('Error searching donations:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }

  // Delete a donation (admin)
  async deleteDonation(req, res) {
    const { id } = req.params;
    const result = await donationService.deleteDonation(id);
    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error, code: result.code });
    }
    return res.status(200).json({ success: true, message: 'Donation deleted successfully' });
  }
}

module.exports = new DonationController(); 