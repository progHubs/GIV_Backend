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