const rateLimit = require("express-rate-limit");

/**
 * Create a rate limiter with custom configuration
 * @param {Object} options - Rate limiter options
 * @returns {Function} - Express middleware
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100, // limit each IP to 100 requests per windowMs
    message = "Too many requests from this IP, please try again later.",
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip,
    handler = (req, res) => {
      res.status(429).json({
        success: false,
        errors: [message],
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  } = options;

  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders,
    legacyHeaders,
    skipSuccessfulRequests,
    skipFailedRequests,
    keyGenerator,
    handler,
    // Uses default memory store
  });
};

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many API requests from this IP, please try again later.",
});

/**
 * Authentication endpoints rate limiter
 * 5 requests per 15 minutes per IP for sensitive endpoints
 */
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message:
    "Too many authentication attempts from this IP, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Login endpoint rate limiter
 * 3 attempts per 15 minutes per IP
 */
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many login attempts from this IP, please try again later.",
  skipSuccessfulRequests: true,
});

/**
 * Registration endpoint rate limiter
 * 2 registrations per hour per IP
 */
const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message:
    "Too many registration attempts from this IP, please try again later.",
  skipSuccessfulRequests: true,
});

/**
 * Password reset rate limiter
 * 3 requests per hour per IP
 */
const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message:
    "Too many password reset requests from this IP, please try again later.",
  skipSuccessfulRequests: true,
});

/**
 * Email verification rate limiter
 * 5 requests per hour per IP
 */
const emailVerificationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message:
    "Too many email verification requests from this IP, please try again later.",
  skipSuccessfulRequests: true,
});

/**
 * Account lockout rate limiter
 * 10 failed attempts per hour per IP results in 1 hour lockout
 */
const accountLockoutLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message:
    "Account temporarily locked due to too many failed attempts. Please try again in 1 hour.",
  skipSuccessfulRequests: true,
});

/**
 * Admin endpoints rate limiter
 * 50 requests per 15 minutes per IP
 */
const adminLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: "Too many admin requests from this IP, please try again later.",
});

/**
 * File upload rate limiter
 * 10 uploads per hour per IP
 */
const uploadLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many file uploads from this IP, please try again later.",
});

/**
 * Custom rate limiter for specific endpoints
 * @param {number} max - Maximum requests
 * @param {number} windowMs - Time window in milliseconds
 * @param {string} message - Error message
 * @returns {Function} - Express middleware
 */
const customLimiter = (
  max,
  windowMs = 15 * 60 * 1000,
  message = "Rate limit exceeded"
) => {
  return createRateLimiter({
    windowMs,
    max,
    message,
  });
};

/**
 * Skip rate limiting for certain IPs (whitelist)
 * @param {Array} whitelist - Array of IP addresses to whitelist
 * @returns {Function} - Express middleware
 */
const skipRateLimit = (whitelist = []) => {
  return (req, res, next) => {
    if (whitelist.includes(req.ip)) {
      return next();
    }
    return generalLimiter(req, res, next);
  };
};

module.exports = {
  generalLimiter,
  authLimiter,
  loginLimiter,
  registrationLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  accountLockoutLimiter,
  adminLimiter,
  uploadLimiter,
  customLimiter,
  skipRateLimit,
  createRateLimiter,
};
