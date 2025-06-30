const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../../middlewares/auth.middleware');
const {
  registerValidation,
  loginValidation,
  changePasswordValidation,
  requestPasswordResetValidation,
  resetPasswordValidation,
  updateProfileValidation,
  verifyEmailValidation,
  resendVerificationValidation,
  refreshTokenValidation
} = require('../validators/auth.validator');
const {
  registrationLimiter,
  loginLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  authLimiter,
  generalLimiter
} = require('../../middlewares/rate-limit.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', 
  registrationLimiter, // 2 registrations per hour per IP
  registerValidation,   // Input validation
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', 
  loginLimiter,        // 3 login attempts per 15 minutes per IP
  loginValidation,     // Input validation
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', 
  authenticateToken,   // Authentication required
  authController.logout
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', 
  authLimiter,         // 5 refresh attempts per 15 minutes per IP
  refreshTokenValidation, // Input validation
  authController.refresh
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', 
  authenticateToken,   // Authentication required
  authController.me
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password for authenticated user
 * @access  Private
 */
router.put('/change-password', 
  authenticateToken,   // Authentication required
  changePasswordValidation, // Input validation
  authController.changePassword
);

/**
 * @route   POST /api/auth/request-password-reset
 * @desc    Request password reset
 * @access  Public
 */
router.post('/request-password-reset', 
  passwordResetLimiter, // 3 requests per hour per IP
  requestPasswordResetValidation, // Input validation
  authController.requestPasswordReset
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', 
  passwordResetLimiter, // 3 attempts per hour per IP
  resetPasswordValidation, // Input validation
  authController.resetPassword
);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email with token
 * @access  Public
 */
router.get('/verify-email/:token', 
  emailVerificationLimiter, // 5 attempts per hour per IP
  verifyEmailValidation,    // Input validation
  authController.verifyEmail
);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend verification email
 * @access  Public
 */
router.post('/resend-verification', 
  emailVerificationLimiter, // 5 attempts per hour per IP
  resendVerificationValidation, // Input validation
  authController.resendVerification
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  authenticateToken,   // Authentication required
  updateProfileValidation, // Input validation
  authController.updateProfile
);

/**
 * @route   DELETE /api/auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', 
  authenticateToken,   // Authentication required
  authController.deleteAccount
);

/**
 * @route   GET /api/auth/health
 * @desc    Health check for authentication service
 * @access  Public
 */
router.get('/health', 
  generalLimiter,      // General rate limiting
  authController.health
);

module.exports = router; 