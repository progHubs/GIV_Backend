const { PrismaClient } = require('../generated/prisma');
const logger = require('../utils/logger.util');
const crypto = require('crypto');

const prisma = new PrismaClient();

/**
 * Token Management Service for GIV Society Backend
 * Handles refresh token storage and session tracking
 */
class TokenService {
  /**
   * Store refresh token
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token
   * @param {string} sessionId - Session ID
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @returns {Object} - Result of token storage
   */
  async storeRefreshToken(userId, refreshToken, sessionId, ipAddress, userAgent) {
    try {
      // Hash the refresh token for storage
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // Calculate expiration (7 days from now)
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      // Store refresh token in site_interactions table (temporary solution)
      await prisma.site_interactions.create({
        data: {
          user_id: BigInt(userId),
          session_id: sessionId,
          action: 'REFRESH_TOKEN_STORED',
          metadata: JSON.stringify({
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString(),
            is_revoked: false
          }),
          ip_address: ipAddress,
          user_agent: userAgent,
          occurred_at: new Date()
        }
      });

      logger.info(`Refresh token stored for user ${userId}, session ${sessionId}`);
      
      return {
        success: true,
        sessionId,
        expiresAt
      };

    } catch (error) {
      logger.error('Error storing refresh token:', error);
      return {
        success: false,
        error: 'Failed to store refresh token'
      };
    }
  }

  /**
   * Validate refresh token
   * @param {string} refreshToken - Refresh token to validate
   * @param {string} userId - User ID
   * @returns {Object} - Validation result
   */
  async validateRefreshToken(refreshToken, userId) {
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // Find the token in site_interactions
      const tokenRecord = await prisma.site_interactions.findFirst({
        where: {
          user_id: BigInt(userId),
          action: 'REFRESH_TOKEN_STORED',
          metadata: {
            contains: tokenHash
          }
        },
        orderBy: {
          occurred_at: 'desc'
        }
      });

      if (!tokenRecord) {
        return {
          valid: false,
          reason: 'Token not found'
        };
      }

      // Parse metadata
      const metadata = JSON.parse(tokenRecord.metadata);
      
      // Check if token is revoked
      if (metadata.is_revoked) {
        return {
          valid: false,
          reason: 'Token revoked'
        };
      }

      // Check if token is expired
      const expiresAt = new Date(metadata.expires_at);
      if (expiresAt < new Date()) {
        return {
          valid: false,
          reason: 'Token expired'
        };
      }

      return {
        valid: true,
        sessionId: tokenRecord.session_id
      };

    } catch (error) {
      logger.error('Error validating refresh token:', error);
      return {
        valid: false,
        reason: 'Validation error'
      };
    }
  }

  /**
   * Revoke refresh token
   * @param {string} refreshToken - Refresh token to revoke
   * @param {string} userId - User ID
   * @returns {Object} - Revocation result
   */
  async revokeRefreshToken(refreshToken, userId) {
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      
      // Find and mark token as revoked
      const tokenRecord = await prisma.site_interactions.findFirst({
        where: {
          user_id: BigInt(userId),
          action: 'REFRESH_TOKEN_STORED',
          metadata: {
            contains: tokenHash
          }
        }
      });

      if (tokenRecord) {
        const metadata = JSON.parse(tokenRecord.metadata);
        metadata.is_revoked = true;

        await prisma.site_interactions.update({
          where: { id: tokenRecord.id },
          data: {
            action: 'REFRESH_TOKEN_REVOKED',
            metadata: JSON.stringify(metadata),
            occurred_at: new Date()
          }
        });

        logger.info(`Refresh token revoked for user ${userId}`);
      }

      return {
        success: true,
        message: 'Token revoked successfully'
      };

    } catch (error) {
      logger.error('Error revoking refresh token:', error);
      return {
        success: false,
        error: 'Failed to revoke token'
      };
    }
  }

  /**
   * Create user session
   * @param {string} userId - User ID
   * @param {string} sessionId - Session ID
   * @param {string} ipAddress - IP address
   * @param {string} userAgent - User agent
   * @returns {Object} - Session creation result
   */
  async createSession(userId, sessionId, ipAddress, userAgent) {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      await prisma.site_interactions.create({
        data: {
          user_id: BigInt(userId),
          session_id: sessionId,
          action: 'SESSION_CREATED',
          metadata: JSON.stringify({
            is_active: true,
            expires_at: expiresAt.toISOString()
          }),
          ip_address: ipAddress,
          user_agent: userAgent,
          occurred_at: new Date()
        }
      });

      logger.info(`Session created for user ${userId}, session ${sessionId}`);
      
      return {
        success: true,
        sessionId,
        expiresAt
      };

    } catch (error) {
      logger.error('Error creating session:', error);
      return {
        success: false,
        error: 'Failed to create session'
      };
    }
  }

  /**
   * Validate session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @returns {Object} - Session validation result
   */
  async validateSession(sessionId, userId) {
    try {
      const sessionRecord = await prisma.site_interactions.findFirst({
        where: {
          user_id: BigInt(userId),
          session_id: sessionId,
          action: 'SESSION_CREATED'
        },
        orderBy: {
          occurred_at: 'desc'
        }
      });

      if (!sessionRecord) {
        return {
          valid: false,
          reason: 'Session not found'
        };
      }

      const metadata = JSON.parse(sessionRecord.metadata);
      
      if (!metadata.is_active) {
        return {
          valid: false,
          reason: 'Session inactive'
        };
      }

      const expiresAt = new Date(metadata.expires_at);
      if (expiresAt < new Date()) {
        return {
          valid: false,
          reason: 'Session expired'
        };
      }

      return {
        valid: true,
        sessionId
      };

    } catch (error) {
      logger.error('Error validating session:', error);
      return {
        valid: false,
        reason: 'Validation error'
      };
    }
  }

  /**
   * Invalidate session
   * @param {string} sessionId - Session ID
   * @param {string} userId - User ID
   * @returns {Object} - Session invalidation result
   */
  async invalidateSession(sessionId, userId) {
    try {
      const sessionRecord = await prisma.site_interactions.findFirst({
        where: {
          user_id: BigInt(userId),
          session_id: sessionId,
          action: 'SESSION_CREATED'
        }
      });

      if (sessionRecord) {
        const metadata = JSON.parse(sessionRecord.metadata);
        metadata.is_active = false;

        await prisma.site_interactions.update({
          where: { id: sessionRecord.id },
          data: {
            action: 'SESSION_INVALIDATED',
            metadata: JSON.stringify(metadata),
            occurred_at: new Date()
          }
        });

        logger.info(`Session invalidated for user ${userId}, session ${sessionId}`);
      }

      return {
        success: true,
        message: 'Session invalidated successfully'
      };

    } catch (error) {
      logger.error('Error invalidating session:', error);
      return {
        success: false,
        error: 'Failed to invalidate session'
      };
    }
  }

  /**
   * Clean up expired tokens and sessions
   * @returns {Object} - Cleanup result
   */
  async cleanupExpiredTokens() {
    try {
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      // Clean up expired refresh tokens
      const expiredTokens = await prisma.site_interactions.findMany({
        where: {
          action: 'REFRESH_TOKEN_STORED',
          occurred_at: {
            lt: cutoffDate
          }
        }
      });

      for (const token of expiredTokens) {
        const metadata = JSON.parse(token.metadata);
        const expiresAt = new Date(metadata.expires_at);
        
        if (expiresAt < new Date()) {
          await prisma.site_interactions.update({
            where: { id: token.id },
            data: {
              action: 'REFRESH_TOKEN_EXPIRED',
              occurred_at: new Date()
            }
          });
        }
      }

      // Clean up expired sessions
      const expiredSessions = await prisma.site_interactions.findMany({
        where: {
          action: 'SESSION_CREATED',
          occurred_at: {
            lt: cutoffDate
          }
        }
      });

      for (const session of expiredSessions) {
        const metadata = JSON.parse(session.metadata);
        const expiresAt = new Date(metadata.expires_at);
        
        if (expiresAt < new Date()) {
          await prisma.site_interactions.update({
            where: { id: session.id },
            data: {
              action: 'SESSION_EXPIRED',
              occurred_at: new Date()
            }
          });
        }
      }

      logger.info(`Cleaned up ${expiredTokens.length} expired tokens and ${expiredSessions.length} expired sessions`);
      
      return {
        success: true,
        tokensCleaned: expiredTokens.length,
        sessionsCleaned: expiredSessions.length
      };

    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
      return {
        success: false,
        error: 'Failed to cleanup expired tokens'
      };
    }
  }

  /**
   * Generate session ID
   * @returns {string} - Unique session ID
   */
  generateSessionId() {
    return crypto.randomBytes(32).toString('hex');
  }
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Blacklist an access token by storing its hash and expiry in the revoked_tokens table
 * @param {string} token - JWT access token
 * @param {Date} expiresAt - Expiry date of the token
 */
async function blacklistAccessToken(token, expiresAt) {
  const tokenHash = hashToken(token);
  await prisma.revoked_tokens.create({
    data: {
      token_hash: tokenHash,
      expires_at: expiresAt
    }
  });
}

/**
 * Check if an access token is revoked (blacklisted)
 * @param {string} token - JWT access token
 * @returns {boolean} - True if revoked, false otherwise
 */
async function isAccessTokenRevoked(token) {
  const tokenHash = hashToken(token);
  const now = new Date();
  const revoked = await prisma.revoked_tokens.findFirst({
    where: {
      token_hash: tokenHash,
      expires_at: { gt: now }
    }
  });
  return !!revoked;
}

const tokenServiceInstance = new TokenService();
tokenServiceInstance.hashToken = hashToken;
tokenServiceInstance.blacklistAccessToken = blacklistAccessToken;
tokenServiceInstance.isAccessTokenRevoked = isAccessTokenRevoked;

module.exports = tokenServiceInstance;