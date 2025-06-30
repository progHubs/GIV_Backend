const { PrismaClient } = require('../generated/prisma');
const { 
  hashPassword, 
  comparePassword, 
  validatePasswordStrength,
  generateSecurePassword 
} = require('../utils/password.util');
const { 
  generateTokenPair, 
  generateResetToken, 
  generateVerificationToken,
  verifyToken 
} = require('../utils/jwt.util');
const { 
  validateRegistrationData, 
  validateLoginData, 
  validatePasswordChangeData,
  validatePasswordResetData 
} = require('../utils/validation.util');
// const emailService = require('./email.service');
const securityService = require('./security.service');
const tokenService = require('./token.service');

const prisma = new PrismaClient();

/**
 * Authentication Service for GIV Society Backend
 * Handles all authentication-related business logic
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} - Registration result
   */
  async register(userData) {
    try {
      // Validate registration data
      const validation = validateRegistrationData(userData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Check if user already exists
      const existingUser = await prisma.users.findFirst({
        where: {
          email: sanitized.email,
          deleted_at: null
        }
      });

      if (existingUser) {
        return {
          success: false,
          errors: ['User with this email already exists'],
          code: 'USER_EXISTS'
        };
      }

      // Hash password
      const passwordHash = await hashPassword(sanitized.password);

      // Create user
      const user = await prisma.users.create({
        data: {
          full_name: sanitized.full_name,
          email: sanitized.email,
          phone: sanitized.phone,
          password_hash: passwordHash,
          role: sanitized.role,
          language_preference: sanitized.language_preference,
          email_verified: false
        },
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          language_preference: true,
          email_verified: true,
          created_at: true
        }
      });

      // Create profile based on role
      if (sanitized.role === 'donor') {
        await prisma.donor_profiles.create({
          data: {
            user_id: user.id,
            is_recurring_donor: false,
            total_donated: 0.00,
            is_anonymous: false
          }
        });
      }

      // Generate verification token if email verification is required
      let verificationToken = null;
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true') {
        verificationToken = generateVerificationToken({
          userId: user.id.toString(),
          email: user.email
        });
        
        // Send verification email
        // await emailService.sendVerificationEmail(user.email, user.full_name, verificationToken);
      }

      // Generate access token (if email verification not required)
      let tokens = null;
      if (process.env.REQUIRE_EMAIL_VERIFICATION !== 'true') {
        tokens = generateTokenPair({
          userId: user.id.toString(),
          email: user.email,
          role: user.role
        });
        
        // Send welcome email
        // await emailService.sendWelcomeEmail(user.email, user.full_name);
      }

      return {
        success: true,
        user: {
          ...user,
          id: user.id.toString()
        },
        tokens,
        verificationToken,
        message: process.env.REQUIRE_EMAIL_VERIFICATION === 'true' 
          ? 'Registration successful. Please check your email to verify your account.'
          : 'Registration successful. You can now log in.'
      };

    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        errors: ['Registration failed. Please try again.'],
        code: 'REGISTRATION_ERROR'
      };
    }
  }

  /**
   * Login user
   * @param {Object} loginData - Login credentials
   * @returns {Object} - Login result
   */
  async login(loginData) {
    try {
      // Validate login data
      const validation = validateLoginData(loginData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Check for account lockout before attempting login
      const ipAddress = '127.0.0.1'; // In production, get from req.ip
      const lockoutStatus = await securityService.checkAccountLockout(sanitized.email, ipAddress);
      
      if (lockoutStatus.isLocked) {
        return {
          success: false,
          errors: [lockoutStatus.message],
          code: 'ACCOUNT_LOCKED'
        };
      }

      // Find user
      const user = await prisma.users.findFirst({
        where: {
          email: sanitized.email,
          deleted_at: null
        },
        include: {
          volunteer_profiles: true,
          donor_profiles: true
        }
      });

      if (!user) {
        // Track failed attempt even if user doesn't exist (security through obscurity)
        await securityService.trackFailedAttempt(sanitized.email, ipAddress);
        return {
          success: false,
          errors: ['Invalid email or password'],
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Check if email is verified (if required)
      if (process.env.REQUIRE_EMAIL_VERIFICATION === 'true' && !user.email_verified) {
        return {
          success: false,
          errors: ['Please verify your email before logging in'],
          code: 'EMAIL_NOT_VERIFIED'
        };
      }

      // Verify password
      const isPasswordValid = await comparePassword(sanitized.password, user.password_hash);
      if (!isPasswordValid) {
        // Track failed attempt
        const failedAttemptResult = await securityService.trackFailedAttempt(user.email, ipAddress);
        
        // Check if account is now locked
        if (failedAttemptResult.isLocked) {
          // Send account locked email
          // await emailService.sendAccountLockedEmail(user.email, user.full_name, failedAttemptResult.lockoutUntil);
          
          return {
            success: false,
            errors: [failedAttemptResult.message],
            code: 'ACCOUNT_LOCKED'
          };
        }
        
        return {
          success: false,
          errors: ['Invalid email or password'],
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Reset failed attempts on successful login
      await securityService.resetFailedAttempts(user.email, ipAddress);

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id.toString(),
        email: user.email,
        role: user.role
      });

      // Create session and store refresh token
      const sessionId = tokenService.generateSessionId();
      const userAgent = 'Unknown'; // In production, get from req.headers['user-agent']
      
      await tokenService.createSession(user.id.toString(), sessionId, ipAddress, userAgent);
      await tokenService.storeRefreshToken(user.id.toString(), tokens.refreshToken, sessionId, ipAddress, userAgent);

      // Update last login (optional - you can add a last_login field to your schema)
      await prisma.users.update({
        where: { id: user.id },
        data: { updated_at: new Date() }
      });

      return {
        success: true,
        user: {
          id: user.id.toString(),
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          language_preference: user.language_preference,
          email_verified: user.email_verified,
          profile_image_url: user.profile_image_url,
          volunteer_profile: user.volunteer_profiles ? {
            ...user.volunteer_profiles,
            user_id: user.volunteer_profiles.user_id.toString(),
            volunteer_skills: user.volunteer_profiles.volunteer_skills ? user.volunteer_profiles.volunteer_skills.map(vs => ({
              ...vs,
              volunteer_id: vs.volunteer_id.toString(),
              skill_id: vs.skill_id.toString(),
              skills: {
                ...vs.skills,
                id: vs.skills.id.toString()
              }
            })) : []
          } : null,
          donor_profile: user.donor_profiles ? {
            ...user.donor_profiles,
            user_id: user.donor_profiles.user_id.toString()
          } : null
        },
        tokens,
        sessionId
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        errors: ['Login failed. Please try again.'],
        code: 'LOGIN_ERROR'
      };
    }
  }

  /**
   * Get current user profile
   * @param {string} userId - User ID
   * @returns {Object} - User profile
   */
  async getCurrentUser(userId) {
    try {
      const user = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: null
        },
        include: {
          volunteer_profiles: {
            include: {
              volunteer_skills: {
                include: {
                  skills: true
                }
              }
            }
          },
          donor_profiles: true
        }
      });

      if (!user) {
        return {
          success: false,
          errors: ['User not found'],
          code: 'USER_NOT_FOUND'
        };
      }

      return {
        success: true,
        user: {
          id: user.id.toString(),
          full_name: user.full_name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          language_preference: user.language_preference,
          email_verified: user.email_verified,
          profile_image_url: user.profile_image_url,
          created_at: user.created_at,
          updated_at: user.updated_at,
          volunteer_profile: user.volunteer_profiles ? {
            ...user.volunteer_profiles,
            user_id: user.volunteer_profiles.user_id.toString(),
            volunteer_skills: user.volunteer_profiles.volunteer_skills ? user.volunteer_profiles.volunteer_skills.map(vs => ({
              ...vs,
              volunteer_id: vs.volunteer_id.toString(),
              skill_id: vs.skill_id.toString(),
              skills: {
                ...vs.skills,
                id: vs.skills.id.toString()
              }
            })) : []
          } : null,
          donor_profile: user.donor_profiles ? {
            ...user.donor_profiles,
            user_id: user.donor_profiles.user_id.toString()
          } : null
        }
      };

    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        errors: ['Failed to get user profile'],
        code: 'PROFILE_ERROR'
      };
    }
  }

  /**
   * Change password for authenticated user
   * @param {string} userId - User ID
   * @param {Object} passwordData - Password change data
   * @returns {Object} - Password change result
   */
  async changePassword(userId, passwordData) {
    try {
      // Validate password change data
      const validation = validatePasswordChangeData(passwordData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Get user
      const user = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: null
        }
      });

      if (!user) {
        return {
          success: false,
          errors: ['User not found'],
          code: 'USER_NOT_FOUND'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await comparePassword(sanitized.current_password, user.password_hash);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          errors: ['Current password is incorrect'],
          code: 'INVALID_CURRENT_PASSWORD'
        };
      }

      // Hash new password
      const newPasswordHash = await hashPassword(sanitized.new_password);

      // Update password
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { 
          password_hash: newPasswordHash,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        errors: ['Failed to change password'],
        code: 'PASSWORD_CHANGE_ERROR'
      };
    }
  }

  /**
   * Request password reset
   * @param {Object} resetData - Password reset request data
   * @returns {Object} - Reset request result
   */
  async requestPasswordReset(resetData) {
    try {
      // Validate reset data
      const validation = validatePasswordResetData(resetData);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      const { sanitized } = validation;

      // Find user
      const user = await prisma.users.findFirst({
        where: {
          email: sanitized.email,
          deleted_at: null
        }
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return {
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        };
      }

      // Generate reset token
      const resetToken = generateResetToken({
        userId: user.id.toString(),
        email: user.email
      });

      // Send password reset email
      // await emailService.sendPasswordResetEmail(user.email, user.full_name, resetToken);

      return {
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.',
        resetToken // Remove this in production - only for testing
      };

    } catch (error) {
      console.error('Request password reset error:', error);
      return {
        success: false,
        errors: ['Failed to process password reset request'],
        code: 'RESET_REQUEST_ERROR'
      };
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Object} - Reset result
   */
  async resetPassword(token, newPassword) {
    try {
      // Validate new password
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          errors: passwordValidation.errors,
          code: 'VALIDATION_ERROR'
        };
      }

      // Verify token
      const decoded = verifyToken(token, 'giv-society-reset');
      if (!decoded) {
        return {
          success: false,
          errors: ['Invalid or expired reset token'],
          code: 'INVALID_TOKEN'
        };
      }

      // Find user
      const user = await prisma.users.findFirst({
        where: {
          id: BigInt(decoded.userId),
          deleted_at: null
        }
      });

      if (!user) {
        return {
          success: false,
          errors: ['User not found'],
          code: 'USER_NOT_FOUND'
        };
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password
      await prisma.users.update({
        where: { id: BigInt(decoded.userId) },
        data: { 
          password_hash: newPasswordHash,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
      };

    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        errors: ['Failed to reset password'],
        code: 'RESET_ERROR'
      };
    }
  }

  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Object} - Verification result
   */
  async verifyEmail(token) {
    try {
      // Verify token
      const decoded = verifyToken(token, 'giv-society-verify');
      if (!decoded) {
        return {
          success: false,
          errors: ['Invalid or expired verification token'],
          code: 'INVALID_TOKEN'
        };
      }

      // Find user
      const user = await prisma.users.findFirst({
        where: {
          id: BigInt(decoded.userId),
          deleted_at: null
        }
      });

      if (!user) {
        return {
          success: false,
          errors: ['User not found'],
          code: 'USER_NOT_FOUND'
        };
      }

      if (user.email_verified) {
        return {
          success: true,
          message: 'Email already verified'
        };
      }

      // Update user as verified
      await prisma.users.update({
        where: { id: BigInt(decoded.userId) },
        data: { 
          email_verified: true,
          updated_at: new Date()
        }
      });

      return {
        success: true,
        message: 'Email verified successfully. You can now log in.'
      };

    } catch (error) {
      console.error('Email verification error:', error);
      return {
        success: false,
        errors: ['Failed to verify email'],
        code: 'VERIFICATION_ERROR'
      };
    }
  }

  /**
   * Resend verification email
   * @param {string} email - User email
   * @returns {Object} - Resend result
   */
  async resendVerificationEmail(email) {
    try {
      // Find user
      const user = await prisma.users.findFirst({
        where: {
          email: email,
          deleted_at: null
        }
      });

      if (!user) {
        return {
          success: true,
          message: 'If an account with this email exists, a verification link has been sent.'
        };
      }

      if (user.email_verified) {
        return {
          success: false,
          errors: ['Email is already verified'],
          code: 'ALREADY_VERIFIED'
        };
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken({
        userId: user.id.toString(),
        email: user.email
      });

      // Send verification email
      // await emailService.sendVerificationEmail(user.email, user.full_name, verificationToken);

      return {
        success: true,
        message: 'If an account with this email exists, a verification link has been sent.',
        verificationToken // Remove this in production - only for testing
      };

    } catch (error) {
      console.error('Resend verification error:', error);
      return {
        success: false,
        errors: ['Failed to resend verification email'],
        code: 'RESEND_ERROR'
      };
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} profileData - Profile update data
   * @returns {Object} - Update result
   */
  async updateProfile(userId, profileData) {
    try {
      // Find user
      const user = await prisma.users.findFirst({
        where: {
          id: BigInt(userId),
          deleted_at: null
        }
      });

      if (!user) {
        return {
          success: false,
          errors: ['User not found'],
          code: 'USER_NOT_FOUND'
        };
      }

      // Update user profile
      const updatedUser = await prisma.users.update({
        where: { id: BigInt(userId) },
        data: {
          full_name: profileData.full_name || user.full_name,
          phone: profileData.phone !== undefined ? profileData.phone : user.phone,
          language_preference: profileData.language_preference || user.language_preference,
          profile_image_url: profileData.profile_image_url || user.profile_image_url,
          updated_at: new Date()
        },
        select: {
          id: true,
          full_name: true,
          email: true,
          phone: true,
          role: true,
          language_preference: true,
          email_verified: true,
          profile_image_url: true,
          created_at: true,
          updated_at: true
        }
      });

      return {
        success: true,
        user: {
          ...updatedUser,
          id: updatedUser.id.toString()
        },
        message: 'Profile updated successfully'
      };

    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        errors: ['Failed to update profile'],
        code: 'PROFILE_UPDATE_ERROR'
      };
    }
  }

  /**
   * Logout user
   * @param {string} userId - User ID
   * @param {string} refreshToken - Refresh token to revoke
   * @param {string} sessionId - Session ID to invalidate
   * @returns {Object} - Logout result
   */
  async logout(userId, refreshToken, sessionId) {
    try {
      // Revoke refresh token
      if (refreshToken) {
        await tokenService.revokeRefreshToken(refreshToken, userId);
      }

      // Invalidate session
      if (sessionId) {
        await tokenService.invalidateSession(sessionId, userId);
      }

      return {
        success: true,
        message: 'Logout successful'
      };

    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        errors: ['Failed to logout'],
        code: 'LOGOUT_ERROR'
      };
    }
  }

  /**
   * Delete user account
   * @param {string} userId - User ID
   * @returns {Object} - Deletion result
   */
  async deleteAccount(userId) {
    try {
      // Soft delete user
      await prisma.users.update({
        where: { id: BigInt(userId) },
        data: { 
          deleted_at: new Date(),
          updated_at: new Date()
        }
      });

      return {
        success: true,
        message: 'Account deleted successfully'
      };

    } catch (error) {
      console.error('Delete account error:', error);
      return {
        success: false,
        errors: ['Failed to delete account'],
        code: 'DELETE_ERROR'
      };
    }
  }
}

module.exports = new AuthService();
