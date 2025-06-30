const { PrismaClient } = require('../generated/prisma');
const logger = require('../utils/logger.util');

const prisma = new PrismaClient();

/**
 * Security Service for GIV Society Backend
 * Handles account lockouts, failed attempts tracking, and security measures
 */
class SecurityService {
  constructor() {
    this.failedAttempts = new Map(); // In-memory store for failed attempts
    this.lockedAccounts = new Map(); // In-memory store for locked accounts
  }

  /**
   * Track failed login attempt
   * @param {string} email - User email
   * @param {string} ipAddress - IP address
   * @returns {Object} - Result with lockout status
   */
  async trackFailedAttempt(email, ipAddress) {
    try {
      const key = `${email}:${ipAddress}`;
      const currentAttempts = this.failedAttempts.get(key) || 0;
      const newAttempts = currentAttempts + 1;
      
      this.failedAttempts.set(key, newAttempts);

      // Log the failed attempt
      await this.logSecurityEvent({
        type: 'FAILED_LOGIN',
        email,
        ipAddress,
        attemptNumber: newAttempts,
        timestamp: new Date()
      });

      // Check if account should be locked
      const maxAttempts = 5;
      const lockoutDuration = 15 * 60 * 1000; // 15 minutes

      if (newAttempts >= maxAttempts) {
        const lockoutUntil = new Date(Date.now() + lockoutDuration);
        this.lockedAccounts.set(key, lockoutUntil);

        // Log account lockout
        await this.logSecurityEvent({
          type: 'ACCOUNT_LOCKOUT',
          email,
          ipAddress,
          lockoutUntil,
          timestamp: new Date()
        });

        return {
          isLocked: true,
          lockoutUntil,
          remainingAttempts: 0,
          message: `Account locked due to ${maxAttempts} failed attempts. Try again after ${new Date(lockoutUntil).toLocaleTimeString()}`
        };
      }

      return {
        isLocked: false,
        remainingAttempts: maxAttempts - newAttempts,
        message: `${maxAttempts - newAttempts} attempts remaining`
      };

    } catch (error) {
      logger.error('Error tracking failed attempt:', error);
      return {
        isLocked: false,
        remainingAttempts: 5,
        message: 'Error tracking failed attempt'
      };
    }
  }

  /**
   * Check if account is locked
   * @param {string} email - User email
   * @param {string} ipAddress - IP address
   * @returns {Object} - Lockout status
   */
  async checkAccountLockout(email, ipAddress) {
    try {
      const key = `${email}:${ipAddress}`;
      const lockoutUntil = this.lockedAccounts.get(key);

      if (!lockoutUntil) {
        return { isLocked: false };
      }

      // Check if lockout period has expired
      if (Date.now() > lockoutUntil.getTime()) {
        this.lockedAccounts.delete(key);
        this.failedAttempts.delete(key);
        return { isLocked: false };
      }

      return {
        isLocked: true,
        lockoutUntil,
        message: `Account is locked until ${lockoutUntil.toLocaleTimeString()}`
      };

    } catch (error) {
      logger.error('Error checking account lockout:', error);
      return { isLocked: false };
    }
  }

  /**
   * Reset failed attempts on successful login
   * @param {string} email - User email
   * @param {string} ipAddress - IP address
   */
  async resetFailedAttempts(email, ipAddress) {
    try {
      const key = `${email}:${ipAddress}`;
      this.failedAttempts.delete(key);
      this.lockedAccounts.delete(key);

      // Log successful login
      await this.logSecurityEvent({
        type: 'SUCCESSFUL_LOGIN',
        email,
        ipAddress,
        timestamp: new Date()
      });

    } catch (error) {
      if (error && error.message) {
        logger.error('Error resetting failed attempts:', error.message, error);
      } else {
        logger.error('Error resetting failed attempts:', error);
      }
    }
  }

  /**
   * Log security events
   * @param {Object} eventData - Event data to log
   */
  async logSecurityEvent(eventData) {
    try {
      // Store in database for audit trail
      await prisma.site_interactions.create({
        data: {
          user_id: null, // Will be null for failed attempts
          session_id: null,
          page: '/api/auth/login',
          action: eventData.type,
          metadata: JSON.stringify(eventData),
          ip_address: eventData.ipAddress,
          user_agent: 'Security Service',
          occurred_at: eventData.timestamp
        }
      });

      // Log to console for monitoring
      logger.info('Security Event:', eventData);

    } catch (error) {
      logger.error('Error logging security event:', error);
    }
  }

  /**
   * Get failed attempts count
   * @param {string} email - User email
   * @param {string} ipAddress - IP address
   * @returns {number} - Number of failed attempts
   */
  getFailedAttemptsCount(email, ipAddress) {
    const key = `${email}:${ipAddress}`;
    return this.failedAttempts.get(key) || 0;
  }

  /**
   * Clear all failed attempts (admin function)
   */
  clearAllFailedAttempts() {
    this.failedAttempts.clear();
    this.lockedAccounts.clear();
    logger.info('All failed attempts cleared by admin');
  }

  /**
   * Get security statistics
   * @returns {Object} - Security statistics
   */
  getSecurityStats() {
    return {
      totalFailedAttempts: this.failedAttempts.size,
      totalLockedAccounts: this.lockedAccounts.size,
      failedAttemptsMap: Object.fromEntries(this.failedAttempts),
      lockedAccountsMap: Object.fromEntries(this.lockedAccounts)
    };
  }

  /**
   * Validate session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @returns {boolean} - Whether session is valid
   */
  async validateSession(sessionId, userId) {
    try {
      // Check if session exists and is valid
      const session = await prisma.site_interactions.findFirst({
        where: {
          session_id: sessionId,
          user_id: BigInt(userId),
          action: 'LOGIN',
          occurred_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      });

      return !!session;

    } catch (error) {
      logger.error('Error validating session:', error);
      return false;
    }
  }

  /**
   * Invalidate session
   * @param {string} sessionId - Session ID
   */
  async invalidateSession(sessionId) {
    try {
      // Mark session as invalidated
      await prisma.site_interactions.updateMany({
        where: {
          session_id: sessionId
        },
        data: {
          action: 'LOGOUT',
          occurred_at: new Date()
        }
      });

      logger.info(`Session ${sessionId} invalidated`);

    } catch (error) {
      logger.error('Error invalidating session:', error);
    }
  }

  /**
   * Get user security events
   * @param {string} userId - User ID
   * @param {number} limit - Number of events to return
   * @returns {Array} - Security events
   */
  async getUserSecurityEvents(userId, limit = 50) {
    try {
      const events = await prisma.site_interactions.findMany({
        where: {
          user_id: BigInt(userId),
          action: {
            in: ['LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PASSWORD_CHANGE', 'ACCOUNT_LOCKOUT']
          }
        },
        orderBy: {
          occurred_at: 'desc'
        },
        take: limit
      });

      return events.map(event => ({
        id: event.id,
        action: event.action,
        ipAddress: event.ip_address,
        userAgent: event.user_agent,
        timestamp: event.occurred_at,
        metadata: event.metadata ? JSON.parse(event.metadata) : null
      }));

    } catch (error) {
      logger.error('Error getting user security events:', error);
      return [];
    }
  }

  /**
   * Check for suspicious activity
   * @param {string} email - User email
   * @param {string} ipAddress - IP address
   * @returns {Object} - Suspicious activity status
   */
  async checkSuspiciousActivity(email, ipAddress) {
    try {
      // Check for multiple failed attempts from different IPs
      const failedAttempts = await prisma.site_interactions.findMany({
        where: {
          action: 'FAILED_LOGIN',
          metadata: {
            contains: email
          },
          occurred_at: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      });

      const uniqueIPs = new Set(failedAttempts.map(attempt => {
        const metadata = JSON.parse(attempt.metadata || '{}');
        return metadata.ipAddress;
      }));

      const isSuspicious = uniqueIPs.size > 3 || failedAttempts.length > 10;

      if (isSuspicious) {
        await this.logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          email,
          ipAddress,
          uniqueIPs: Array.from(uniqueIPs),
          totalAttempts: failedAttempts.length,
          timestamp: new Date()
        });
      }

      return {
        isSuspicious,
        uniqueIPs: Array.from(uniqueIPs),
        totalAttempts: failedAttempts.length,
        message: isSuspicious ? 'Suspicious activity detected' : 'No suspicious activity'
      };

    } catch (error) {
      logger.error('Error checking suspicious activity:', error);
      return {
        isSuspicious: false,
        uniqueIPs: [],
        totalAttempts: 0,
        message: 'Error checking suspicious activity'
      };
    }
  }
}

module.exports = new SecurityService(); 