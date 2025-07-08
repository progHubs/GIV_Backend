const authService = require('../../services/auth.service');
const { generateTokenPair } = require('../../utils/jwt.util');
const { blacklistAccessToken } = require('../../services/token.service');
const jwt = require('jsonwebtoken');

/**
 * Authentication Controller for GIV Society Backend
 * Handles all authentication-related HTTP requests
 */
class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req, res) {
    try {
      const result = await authService.register(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      // Set cookies if tokens are provided
      if (result.tokens) {
        res.cookie('accessToken', result.tokens.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 15 * 60 * 1000 // 15 minutes
        });

        res.cookie('refreshToken', result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      return res.status(201).json({
        success: true,
        message: result.message,
        user: {
          id: result.user.id,
          full_name: result.user.full_name,
          email: result.user.email,
          language_preference: result.user.language_preference,
          email_verified: result.user.email_verified,
          created_at: result.user.created_at
        },
        tokens: result.tokens,
        verificationToken: result.verificationToken // Remove in production
      });

    } catch (error) {
      console.error('Registration controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const result = await authService.login(req.body);

      if (!result.success) {
        return res.status(401).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      // Set cookies
      res.cookie('accessToken', result.tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Set session ID cookie
      if (result.sessionId) {
        res.cookie('sessionId', result.sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        user: result.user,
        tokens: result.tokens,
        sessionId: result.sessionId
      });

    } catch (error) {
      console.error('Login controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      const userId = req.user?.id;
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const sessionId = req.cookies?.sessionId || req.body?.sessionId;

      // Blacklist access token
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;
      if (token) {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const expiresAt = new Date(decoded.exp * 1000);
          await blacklistAccessToken(token, expiresAt);
        }
      }

      // Revoke tokens and invalidate session if user is authenticated
      if (userId) {
        await authService.logout(userId, refreshToken, sessionId);
      }

      // Clear cookies
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.clearCookie('sessionId');

      return res.status(200).json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Logout controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(req, res) {
    try {
      console.log('Refresh request body:', req.body);
      console.log('Refresh request cookies:', req.cookies);

      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

      console.log('Extracted refresh token:', refreshToken ? 'Present' : 'Missing');

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          errors: ['Refresh token is required'],
          code: 'MISSING_REFRESH_TOKEN'
        });
      }

      // Verify refresh token and generate new token pair
      const { verifyToken } = require('../../utils/jwt.util');
      const tokenService = require('../../services/token.service');

      let decoded;
      try {
        // Use the correct audience that matches the token generation
        decoded = verifyToken(refreshToken, 'giv-society-users');
      } catch (tokenError) {
        return res.status(401).json({
          success: false,
          errors: ['Invalid or expired refresh token'],
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      if (!decoded) {
        return res.status(401).json({
          success: false,
          errors: ['Invalid or expired refresh token'],
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      // Validate refresh token against database
      const tokenValidation = await tokenService.validateRefreshToken(refreshToken, decoded.userId);
      if (!tokenValidation.valid) {
        return res.status(401).json({
          success: false,
          errors: [`Refresh token ${tokenValidation.reason}`],
          code: 'INVALID_REFRESH_TOKEN'
        });
      }

      // Generate new token pair
      const newTokens = generateTokenPair({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });

      // Store new refresh token
      const ipAddress = req.ip || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown';
      await tokenService.storeRefreshToken(decoded.userId, newTokens.refreshToken, tokenValidation.sessionId, ipAddress, userAgent);

      // Set new cookies
      res.cookie('accessToken', newTokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
      });

      res.cookie('refreshToken', newTokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        tokens: newTokens
      });

    } catch (error) {
      console.error('Refresh token controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async me(req, res) {
    try {
      const userId = req.user.id;
      const result = await authService.getCurrentUser(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        user: result.user
      });

    } catch (error) {
      console.error('Get current user controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Change password for authenticated user
   * PUT /api/auth/change-password
   */
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const result = await authService.changePassword(userId, req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Change password controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Request password reset
   * POST /api/auth/request-password-reset
   */
  async requestPasswordReset(req, res) {
    try {
      const result = await authService.requestPasswordReset(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        resetToken: result.resetToken // Remove in production
      });

    } catch (error) {
      console.error('Request password reset controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { token, new_password } = req.body;

      if (!token || !new_password) {
        return res.status(400).json({
          success: false,
          errors: ['Token and new password are required'],
          code: 'MISSING_FIELDS'
        });
      }

      const result = await authService.resetPassword(token, new_password);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Reset password controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Verify email with token
   * GET /api/auth/verify-email/:token
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const result = await authService.verifyEmail(token);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Verify email controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  async resendVerification(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          errors: ['Email is required'],
          code: 'MISSING_EMAIL'
        });
      }

      const result = await authService.resendVerificationEmail(email);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        verificationToken: result.verificationToken // Remove in production
      });

    } catch (error) {
      console.error('Resend verification controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const result = await authService.updateProfile(userId, req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        user: result.user
      });

    } catch (error) {
      console.error('Update profile controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Delete user account
   * DELETE /api/auth/account
   */
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const result = await authService.deleteAccount(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          errors: result.errors,
          code: result.code
        });
      }

      // Clear cookies after account deletion
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Delete account controller error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Internal server error'],
        code: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * Health check for authentication service
   * GET /api/auth/health
   */
  async health(req, res) {
    try {
      return res.status(200).json({
        success: true,
        message: 'Authentication service is healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      });

    } catch (error) {
      console.error('Health check error:', error);
      return res.status(500).json({
        success: false,
        errors: ['Service unhealthy'],
        code: 'SERVICE_UNHEALTHY'
      });
    }
  }
}

module.exports = new AuthController();
