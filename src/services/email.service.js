const { Resend } = require('resend');
const { PrismaClient } = require('../generated/prisma');
const logger = require('../utils/logger.util');
const { generateVerificationToken } = require('../utils/jwt.util');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_SENDER = process.env.RESEND_SENDER || 'GIV Society <noreply@givsociety.org>';

const resend = new Resend(RESEND_API_KEY);

function loadTemplate(filename) {
  try {
    return fs.readFileSync(path.join(__dirname, '../emails/templates', filename), 'utf8');
  } catch (err) {
    logger.error(`Failed to load email template: ${filename}`, err);
    return null;
  }
}

function renderTemplate(template, variables) {
  if (!template) return '';
  return template.replace(/{{(\w+)}}/g, (match, key) => {
    if (variables[key] !== undefined && variables[key] !== null) return variables[key];
    if (key === 'year') return new Date().getFullYear();
    return '';
  });
}

/**
 * Email Service for GIV Society Backend
 * Handles email verification, password reset emails, and notifications
 */
class EmailService {
  constructor() {
    this.templates = {
      verification: loadTemplate('verification.html'),
      passwordReset: loadTemplate('password-reset.html'),
      welcome: loadTemplate('welcome.html'),
      accountLocked: loadTemplate('account-locked.html'),
      donationReceipt: loadTemplate('donation-receipt.html'),
      eventRegistration: loadTemplate('event-registration.html'),
      eventReminder: loadTemplate('event-reminder.html'),
      eventFeedback: loadTemplate('event-feedback.html')
    };
  }

  async sendWithResend({ to, subject, html }) {
    try {
      const { data, error } = await resend.emails.send({
        from: RESEND_SENDER,
        to: [to],
        subject,
        html
      });
      if (error) {
        logger.error('Resend email error:', error);
        return { success: false, error };
      }
      return { success: true, data };
    } catch (err) {
      logger.error('Resend sendWithResend exception:', err);
      return { success: false, error: err };
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
      const apiVersion = process.env.API_VERSION || 'v1';
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';
      const verificationUrl = `${backendUrl}/api/${apiVersion}/auth/verify-email/${token}`;
      const html = renderTemplate(this.templates.verification, {
        fullName,
        verificationUrl,
        expiryTime: '24 hours',
        year: new Date().getFullYear()
      }) || `<p>Hello ${fullName},<br>Please verify your email: <a href=\"${verificationUrl}\">${verificationUrl}</a></p>`;
      const subject = 'Verify Your Email - GIV Society Ethiopia';
      const sendResult = await this.sendWithResend({ to: email, subject, html });
      await this.logEmail({ recipient: email, subject, template_used: 'verification', content: html, status: sendResult.success ? 'sent' : 'failed', error_message: sendResult.error?.message });
      if (!sendResult.success) throw sendResult.error;
      logger.info(`Verification email sent to ${email}`);
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      logger.error('Error sending verification email:', error);
      await this.logEmail({ recipient: email, subject: 'Verify Your Email - GIV Society Ethiopia', template_used: 'verification', content: '', status: 'failed', error_message: error?.message });
      return { success: false, message: 'Failed to send verification email' };
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
      const html = renderTemplate(this.templates.passwordReset, {
        fullName,
        resetUrl,
        expiryTime: '1 hour',
        year: new Date().getFullYear()
      }) || `<p>Hello ${fullName},<br>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p>`;
      const subject = 'Password Reset Request - GIV Society Ethiopia';
      const sendResult = await this.sendWithResend({ to: email, subject, html });
      await this.logEmail({ recipient: email, subject, template_used: 'password_reset', content: html, status: sendResult.success ? 'sent' : 'failed', error_message: sendResult.error?.message });
      if (!sendResult.success) throw sendResult.error;
      logger.info(`Password reset email sent to ${email}`);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      await this.logEmail({ recipient: email, subject: 'Password Reset Request - GIV Society Ethiopia', template_used: 'password_reset', content: '', status: 'failed', error_message: error?.message });
      return { success: false, message: 'Failed to send password reset email' };
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
      const html = renderTemplate(this.templates.welcome, {
        fullName,
        year: new Date().getFullYear()
      }) || `<h2>Welcome ${fullName}!</h2><p>Thank you for joining GIV Society Ethiopia.</p>`;
      const subject = 'Welcome to GIV Society Ethiopia';
      const sendResult = await this.sendWithResend({ to: email, subject, html });
      await this.logEmail({ recipient: email, subject, template_used: 'welcome', content: html, status: sendResult.success ? 'sent' : 'failed', error_message: sendResult.error?.message });
      if (!sendResult.success) throw sendResult.error;
      logger.info(`Welcome email sent to ${email}`);
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      await this.logEmail({ recipient: email, subject: 'Welcome to GIV Society Ethiopia', template_used: 'welcome', content: '', status: 'failed', error_message: error?.message });
      return { success: false, message: 'Failed to send welcome email' };
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
      const html = renderTemplate(this.templates.donationReceipt, {
        amount: donation.amount,
        currency: donation.currency,
        donationType: donation.donation_type,
        date: new Date(donation.donated_at).toLocaleDateString(),
        transactionId: donation.transaction_id || 'N/A',
        year: new Date().getFullYear()
      }) || `<h2>Thank You for Your Donation!</h2><p>Amount: ${donation.currency} ${donation.amount}</p>`;
      const subject = 'Donation Receipt - GIV Society Ethiopia';
      const sendResult = await this.sendWithResend({ to: email, subject, html });
      await this.logEmail({ recipient: email, subject, template_used: 'donation_receipt', content: html, status: sendResult.success ? 'sent' : 'failed', error_message: sendResult.error?.message });
      if (!sendResult.success) throw sendResult.error;
      logger.info(`Donation receipt sent to ${email}`);
      return { success: true, message: 'Donation receipt sent successfully' };
    } catch (error) {
      logger.error('Error sending donation receipt:', error);
      await this.logEmail({ recipient: email, subject: 'Donation Receipt - GIV Society Ethiopia', template_used: 'donation_receipt', content: '', status: 'failed', error_message: error?.message });
      return { success: false, message: 'Failed to send donation receipt' };
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
      const html = renderTemplate(this.templates.accountLocked, {
        fullName,
        lockoutUntil: lockoutUntil.toLocaleString(),
        year: new Date().getFullYear()
      }) || `<h2>Account Locked</h2><p>Hello ${fullName},<br>Your account is locked until ${lockoutUntil.toLocaleString()}.</p>`;
      const subject = 'Account Temporarily Locked - GIV Society Ethiopia';
      const sendResult = await this.sendWithResend({ to: email, subject, html });
      await this.logEmail({ recipient: email, subject, template_used: 'account_locked', content: html, status: sendResult.success ? 'sent' : 'failed', error_message: sendResult.error?.message });
      if (!sendResult.success) throw sendResult.error;
      logger.info(`Account locked email sent to ${email}`);
      return { success: true, message: 'Account locked notification sent successfully' };
    } catch (error) {
      logger.error('Error sending account locked email:', error);
      await this.logEmail({ recipient: email, subject: 'Account Temporarily Locked - GIV Society Ethiopia', template_used: 'account_locked', content: '', status: 'failed', error_message: error?.message });
      return { success: false, message: 'Failed to send account locked notification' };
    }
  }

  /**
   * Send event registration confirmation
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @param {Object} event - Event data
   * @returns {Object} - Result of email sending
   */
  async sendEventRegistrationConfirmation(email, fullName, event) {
    try {
      const html = renderTemplate(this.templates.eventRegistration, {
        fullName,
        eventTitle: event.title,
        eventDate: event.event_date ? new Date(event.event_date).toLocaleDateString() : '',
        eventTime: event.event_time ? event.event_time.toString().slice(0,5) : '',
        eventLocation: event.location || 'TBA',
        year: new Date().getFullYear()
      }) || `<p>Hello ${fullName},<br>You have successfully registered for the event: <b>${event.title}</b>.</p>`;
      const subject = `Registration Confirmed: ${event.title}`;
      const sendResult = await this.sendWithResend({ to: email, subject, html });
      await this.logEmail({ recipient: email, subject, template_used: 'event_registration', content: html, status: sendResult.success ? 'sent' : 'failed', error_message: sendResult.error?.message });
      if (!sendResult.success) throw sendResult.error;
      logger.info(`Event registration confirmation sent to ${email}`);
      return { success: true, message: 'Event registration confirmation sent successfully' };
    } catch (error) {
      logger.error('Error sending event registration confirmation:', error);
      await this.logEmail({ recipient: email, subject: 'Event Registration Confirmation', template_used: 'event_registration', content: '', status: 'failed', error_message: error?.message });
      return { success: false, message: 'Failed to send event registration confirmation' };
    }
  }

  /**
   * Send event reminder
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @param {Object} event - Event data
   * @returns {Object} - Result of email sending
   */
  async sendEventReminder(email, fullName, event) {
    try {
      const html = renderTemplate(this.templates.eventReminder, {
        fullName,
        eventTitle: event.title,
        eventDate: event.event_date ? new Date(event.event_date).toLocaleDateString() : '',
        eventTime: event.event_time ? event.event_time.toString().slice(0,5) : '',
        eventLocation: event.location || 'TBA',
        year: new Date().getFullYear()
      }) || `<p>Hello ${fullName},<br>This is a reminder for the event: <b>${event.title}</b>.</p>`;
      const subject = `Reminder: ${event.title} is coming up!`;
      const sendResult = await this.sendWithResend({ to: email, subject, html });
      await this.logEmail({ recipient: email, subject, template_used: 'event_reminder', content: html, status: sendResult.success ? 'sent' : 'failed', error_message: sendResult.error?.message });
      if (!sendResult.success) throw sendResult.error;
      logger.info(`Event reminder sent to ${email}`);
      return { success: true, message: 'Event reminder sent successfully' };
    } catch (error) {
      logger.error('Error sending event reminder:', error);
      await this.logEmail({ recipient: email, subject: 'Event Reminder', template_used: 'event_reminder', content: '', status: 'failed', error_message: error?.message });
      return { success: false, message: 'Failed to send event reminder' };
    }
  }

  /**
   * Send event feedback request
   * @param {string} email - User email
   * @param {string} fullName - User full name
   * @param {Object} event - Event data
   * @param {string} feedbackUrl - Feedback URL
   * @returns {Object} - Result of email sending
   */
  async sendEventFeedbackRequest(email, fullName, event, feedbackUrl) {
    try {
      const html = renderTemplate(this.templates.eventFeedback, {
        fullName,
        eventTitle: event.title,
        eventDate: event.event_date ? new Date(event.event_date).toLocaleDateString() : '',
        eventTime: event.event_time ? event.event_time.toString().slice(0,5) : '',
        eventLocation: event.location || 'TBA',
        feedbackUrl: feedbackUrl || '#',
        year: new Date().getFullYear()
      }) || `<p>Hello ${fullName},<br>Thank you for attending ${event.title}. Please provide your feedback: <a href='${feedbackUrl}'>Feedback Form</a></p>`;
      const subject = `We Value Your Feedback: ${event.title}`;
      const sendResult = await this.sendWithResend({ to: email, subject, html });
      await this.logEmail({ recipient: email, subject, template_used: 'event_feedback', content: html, status: sendResult.success ? 'sent' : 'failed', error_message: sendResult.error?.message });
      if (!sendResult.success) throw sendResult.error;
      logger.info(`Event feedback request sent to ${email}`);
      return { success: true, message: 'Event feedback request sent successfully' };
    } catch (error) {
      logger.error('Error sending event feedback request:', error);
      await this.logEmail({ recipient: email, subject: 'Event Feedback Request', template_used: 'event_feedback', content: '', status: 'failed', error_message: error?.message });
      return { success: false, message: 'Failed to send event feedback request' };
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