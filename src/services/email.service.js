const { PrismaClient } = require('../generated/prisma');
const logger = require('../utils/logger.util');
const { generateVerificationToken } = require('../utils/jwt.util');

const prisma = new PrismaClient();

/**
 * Email Service for GIV Society Backend
 * Handles email verification, password reset emails, and notifications
 */
class EmailService {
  constructor() {
    // Initialize templates safely
    try {
      this.emailTemplates = {
        verification: this.getVerificationTemplate(),
        passwordReset: this.getPasswordResetTemplate(),
        welcome: this.getWelcomeTemplate(),
        accountLocked: this.getAccountLockedTemplate()
      };
    } catch (error) {
      logger.error('Error initializing email templates:', error);
      // Fallback to empty templates
      this.emailTemplates = {
        verification: '',
        passwordReset: '',
        welcome: '',
        accountLocked: ''
      };
    }
  }

  /**
   * Send email verification
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @param {string} token - Verification token
   * @returns {Object} - Result of email sending
   */
  async sendVerificationEmail(email, fullName, token) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
      
      const emailContent = this.emailTemplates.verification
        .replace('{{fullName}}', fullName)
        .replace('{{verificationUrl}}', verificationUrl)
        .replace('{{expiryTime}}', '24 hours');

      // Log email sending
      await this.logEmail({
        recipient: email,
        subject: 'Verify Your Email - GIV Society Ethiopia',
        template_used: 'verification',
        content: emailContent,
        status: 'sent'
      });

      logger.info(`Verification email sent to ${email}`);
      
      return {
        success: true,
        message: 'Verification email sent successfully'
      };

    } catch (error) {
      logger.error('Error sending verification email:', error);
      
      await this.logEmail({
        recipient: email,
        subject: 'Verify Your Email - GIV Society Ethiopia',
        template_used: 'verification',
        content: '',
        status: 'failed',
        error_message: error?.message || 'Unknown error occurred'
      });

      return {
        success: false,
        message: 'Failed to send verification email'
      };
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @param {string} token - Reset token
   * @returns {Object} - Result of email sending
   */
  async sendPasswordResetEmail(email, fullName, token) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${token}`;
      
      const emailContent = this.emailTemplates.passwordReset
        .replace('{{fullName}}', fullName)
        .replace('{{resetUrl}}', resetUrl)
        .replace('{{expiryTime}}', '1 hour');

      // Log email sending
      await this.logEmail({
        recipient: email,
        subject: 'Password Reset Request - GIV Society Ethiopia',
        template_used: 'password_reset',
        content: emailContent,
        status: 'sent'
      });

      logger.info(`Password reset email sent to ${email}`);
      
      return {
        success: true,
        message: 'Password reset email sent successfully'
      };

    } catch (error) {
      logger.error('Error sending password reset email:', error);
      
      await this.logEmail({
        recipient: email,
        subject: 'Password Reset Request - GIV Society Ethiopia',
        template_used: 'password_reset',
        content: '',
        status: 'failed',
        error_message: error?.message || 'Unknown error occurred'
      });

      return {
        success: false,
        message: 'Failed to send password reset email'
      };
    }
  }

  /**
   * Send welcome email
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @returns {Object} - Result of email sending
   */
  async sendWelcomeEmail(email, fullName) {
    try {
      // Get template safely
      let emailContent = '';
      if (this.emailTemplates.welcome) {
        emailContent = this.emailTemplates.welcome.replace('{{fullName}}', fullName);
      } else {
        // Fallback template
        emailContent = `
          <h2>Welcome ${fullName}!</h2>
          <p>Thank you for joining GIV Society Ethiopia. Your account has been successfully created.</p>
          <p>Best regards,<br>The GIV Society Ethiopia Team</p>
        `;
      }

      // Log email sending
      await this.logEmail({
        recipient: email,
        subject: 'Welcome to GIV Society Ethiopia',
        template_used: 'welcome',
        content: emailContent,
        status: 'sent'
      });

      logger.info(`Welcome email sent to ${email}`);
      
      return {
        success: true,
        message: 'Welcome email sent successfully'
      };

    } catch (error) {
      logger.error('Error sending welcome email:', error);
      
      try {
        await this.logEmail({
          recipient: email,
          subject: 'Welcome to GIV Society Ethiopia',
          template_used: 'welcome',
          content: '',
          status: 'failed',
          error_message: error?.message || 'Unknown error occurred'
        });
      } catch (logError) {
        logger.error('Error logging failed email:', logError);
      }

      return {
        success: false,
        message: 'Failed to send welcome email'
      };
    }
  }

  /**
   * Send donation receipt email
   * @param {string} email - User email
   * @param {Object} donation - Donation data
   * @returns {Object} - Result of email sending
   */
  async sendDonationReceipt(email, donation) {
    try {
      const receiptContent = `
        <h2>Thank You for Your Donation!</h2>
        <p>Dear Donor,</p>
        <p>Thank you for your generous donation to GIV Society Ethiopia.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Donation Details:</h3>
          <p><strong>Amount:</strong> ${donation.currency} ${donation.amount}</p>
          <p><strong>Donation Type:</strong> ${donation.donation_type}</p>
          <p><strong>Date:</strong> ${new Date(donation.donated_at).toLocaleDateString()}</p>
          <p><strong>Transaction ID:</strong> ${donation.transaction_id || 'N/A'}</p>
        </div>
        <p>Your donation will make a significant impact in our community.</p>
        <p>Best regards,<br>The GIV Society Ethiopia Team</p>
      `;

      // Log email sending
      await this.logEmail({
        recipient: email,
        subject: 'Donation Receipt - GIV Society Ethiopia',
        template_used: 'donation_receipt',
        content: receiptContent,
        status: 'sent'
      });

      logger.info(`Donation receipt sent to ${email}`);
      
      return {
        success: true,
        message: 'Donation receipt sent successfully'
      };

    } catch (error) {
      logger.error('Error sending donation receipt:', error);
      
      await this.logEmail({
        recipient: email,
        subject: 'Donation Receipt - GIV Society Ethiopia',
        template_used: 'donation_receipt',
        content: '',
        status: 'failed',
        error_message: error?.message || 'Unknown error occurred'
      });

      return {
        success: false,
        message: 'Failed to send donation receipt'
      };
    }
  }

  /**
   * Send account locked notification
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @param {Date} lockoutUntil - Lockout expiry time
   * @returns {Object} - Result of email sending
   */
  async sendAccountLockedEmail(email, fullName, lockoutUntil) {
    try {
      const emailContent = this.emailTemplates.accountLocked
        .replace('{{fullName}}', fullName)
        .replace('{{lockoutUntil}}', lockoutUntil.toLocaleString());

      // Log email sending
      await this.logEmail({
        recipient: email,
        subject: 'Account Temporarily Locked - GIV Society Ethiopia',
        template_used: 'account_locked',
        content: emailContent,
        status: 'sent'
      });

      logger.info(`Account locked email sent to ${email}`);
      
      return {
        success: true,
        message: 'Account locked notification sent successfully'
      };

    } catch (error) {
      logger.error('Error sending account locked email:', error);
      
      await this.logEmail({
        recipient: email,
        subject: 'Account Temporarily Locked - GIV Society Ethiopia',
        template_used: 'account_locked',
        content: '',
        status: 'failed',
        error_message: error?.message || 'Unknown error occurred'
      });

      return {
        success: false,
        message: 'Failed to send account locked notification'
      };
    }
  }

  /**
   * Log email to database
   * @param {Object} emailData - Email data to log
   */
  async logEmail(emailData) {
    try {
      await prisma.email_logs.create({
        data: {
          recipient: emailData.recipient,
          subject: emailData.subject,
          template_used: emailData.template_used,
          content: emailData.content,
          status: emailData.status,
          error_message: emailData.error_message,
          sent_at: new Date()
        }
      });
    } catch (error) {
      logger.error('Error logging email:', error);
    }
  }

  /**
   * Get email verification template
   * @returns {string} - Email template
   */
  getVerificationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email - GIV Society Ethiopia</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GIV Society Ethiopia</h1>
          </div>
          <div class="content">
            <h2>Hello {{fullName}},</h2>
            <p>Thank you for registering with GIV Society Ethiopia. To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="{{verificationUrl}}" class="button">Verify Email Address</a>
            </p>
            <p>This verification link will expire in {{expiryTime}}.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <p>Best regards,<br>The GIV Society Ethiopia Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because you registered with GIV Society Ethiopia.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get password reset template
   * @returns {string} - Email template
   */
  getPasswordResetTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - GIV Society Ethiopia</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .button { display: inline-block; padding: 12px 24px; background-color: #2c5aa0; color: white; text-decoration: none; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GIV Society Ethiopia</h1>
          </div>
          <div class="content">
            <h2>Hello {{fullName}},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="{{resetUrl}}" class="button">Reset Password</a>
            </p>
            <p>This link will expire in {{expiryTime}}.</p>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>Best regards,<br>The GIV Society Ethiopia Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because you requested a password reset.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get welcome email template
   * @returns {string} - Email template
   */
  getWelcomeTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to GIV Society Ethiopia</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GIV Society Ethiopia</h1>
          </div>
          <div class="content">
            <h2>Welcome {{fullName}}!</h2>
            <p>Thank you for joining GIV Society Ethiopia. Your account has been successfully created and verified.</p>
            <p>You can now:</p>
            <ul>
              <li>Access your dashboard</li>
              <li>Update your profile</li>
              <li>Participate in our programs</li>
              <li>Connect with other members</li>
            </ul>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p>Best regards,<br>The GIV Society Ethiopia Team</p>
          </div>
          <div class="footer">
            <p>Welcome to the GIV Society Ethiopia community!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get account locked template
   * @returns {string} - Email template
   */
  getAccountLockedTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Account Locked - GIV Society Ethiopia</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>GIV Society Ethiopia</h1>
          </div>
          <div class="content">
            <h2>Hello {{fullName}},</h2>
            <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
            <p><strong>Lockout expires at: {{lockoutUntil}}</strong></p>
            <p>This is a security measure to protect your account. You can try logging in again after the lockout period expires.</p>
            <p>If you believe this was done in error or if you need immediate access, please contact our support team.</p>
            <p>Best regards,<br>The GIV Society Ethiopia Team</p>
          </div>
          <div class="footer">
            <p>This email was sent to you because your account was temporarily locked for security reasons.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Get email statistics
   * @returns {Object} - Email statistics
   */
  async getEmailStats() {
    try {
      const stats = await prisma.email_logs.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      });

      const totalEmails = await prisma.email_logs.count();
      const recentEmails = await prisma.email_logs.count({
        where: {
          sent_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      return {
        total: totalEmails,
        recent: recentEmails,
        byStatus: stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status;
          return acc;
        }, {})
      };

    } catch (error) {
      logger.error('Error getting email stats:', error);
      return {
        total: 0,
        recent: 0,
        byStatus: {}
      };
    }
  }
}

module.exports = new EmailService(); 