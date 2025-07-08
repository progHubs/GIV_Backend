const { verifyToken, extractTokenFromHeader } = require("../utils/jwt.util");
const { PrismaClient } = require("@prisma/client");
const { isAccessTokenRevoked } = require("../services/token.service");

const prisma = new PrismaClient();

/**
 * Authentication Middleware for GIV Society Backend
 */

/**
 * Verify JWT token and attach user to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
        code: "MISSING_TOKEN",
      });
    }

    // Check if token is blacklisted
    if (await isAccessTokenRevoked(token)) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked",
        code: "TOKEN_REVOKED",
      });
    }

    // Verify token
    const decoded = verifyToken(token, "giv-society-users");

    // Check if user exists and is not deleted
    const user = await prisma.users.findFirst({
      where: {
        id: BigInt(decoded.userId),
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        email_verified: true,
        language_preference: true,
        profile_image_url: true,
        created_at: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or account deleted",
        code: "USER_NOT_FOUND",
      });
    }

    // Check if email is verified (optional, can be configured)
    // if (
    //   process.env.REQUIRE_EMAIL_VERIFICATION === "true" &&
    //   !user.email_verified
    // ) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Email verification required",
    //     code: "EMAIL_NOT_VERIFIED",
    //   });
    // }

    // Attach user to request
    req.user = {
      ...user,
      id: user.id.toString(), // Convert BigInt to string for consistency
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.message === "Token has expired") {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
        code: "TOKEN_EXPIRED",
      });
    } else if (error.message === "Invalid token") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication failed",
      code: "AUTH_ERROR",
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return next(); // Continue without authentication
    }

    // Verify token
    const decoded = verifyToken(token, "giv-society-users");

    // Check if user exists and is not deleted
    const user = await prisma.users.findFirst({
      where: {
        id: BigInt(decoded.userId),
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        email_verified: true,
        language_preference: true,
        profile_image_url: true,
        created_at: true,
      },
    });

    if (user) {
      req.user = {
        ...user,
        id: user.id.toString(),
      };
    }

    next();
  } catch (error) {
    // Continue without authentication on error
    console.warn("Optional authentication failed:", error.message);
    next();
  }
};

/**
 * Role-based access control middleware
 * @param {...string} allowedRoles - Array of allowed roles
 * @returns {Function} - Express middleware function
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }
    next();
  };
};

/**
 * Only keep requireAdmin and (optionally) requireUser
 */
const requireAdmin = requireRole("admin");
const requireUser = requireRole("user");

/**
 * New flag-based middleware
 */
const requireDonorFlag = (req, res, next) => {
  if (!req.user || req.user.is_donor !== true) {
    return res.status(403).json({
      success: false,
      message: "Donor profile required",
      code: "DONOR_PROFILE_REQUIRED",
    });
  }
  next();
};

const requireVolunteerFlag = (req, res, next) => {
  if (!req.user || req.user.is_volunteer !== true) {
    return res.status(403).json({
      success: false,
      message: "Volunteer profile required",
      code: "VOLUNTEER_PROFILE_REQUIRED",
    });
  }
  next();
};

/**
 * Rate limiting middleware for authentication endpoints
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis)
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 100; // this will be changed to 5 in production

  // Initialize rate limit store if not exists
  if (!req.app.locals.authRateLimit) {
    req.app.locals.authRateLimit = new Map();
  }

  const rateLimitStore = req.app.locals.authRateLimit;
  const key = `auth_${clientIP}`;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      attempts: 1,
      resetTime: now + windowMs,
    });
    return next();
  }

  const record = rateLimitStore.get(key);

  // Reset if window has passed
  if (now > record.resetTime) {
    record.attempts = 1;
    record.resetTime = now + windowMs;
    return next();
  }

  // Check if limit exceeded
  if (record.attempts >= maxAttempts) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    return res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again later.",
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter,
    });
  }

  // Increment attempts
  record.attempts++;
  next();
};

/**
 * Validate email verification requirement
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required to access this resource",
      code: "EMAIL_VERIFICATION_REQUIRED",
    });
  }

  next();
};

/**
 * Check if user is active (not deleted)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireActiveUser = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
      code: "AUTH_REQUIRED",
    });
  }

  try {
    const user = await prisma.users.findFirst({
      where: {
        id: BigInt(req.user.id),
        deleted_at: null,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated",
        code: "ACCOUNT_DEACTIVATED",
      });
    }

    next();
  } catch (error) {
    console.error("Active user check error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify account status",
      code: "ACCOUNT_CHECK_ERROR",
    });
  }
};

/**
 * Log authentication attempts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const logAuthAttempt = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    // Log authentication attempt
    const logData = {
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent"),
      endpoint: req.originalUrl,
      method: req.method,
      status: res.statusCode,
      timestamp: new Date(),
    };

    if (req.user) {
      logData.user_id = req.user.id;
    }

    // Log to database (optional)
    prisma.site_interactions
      .create({
        data: {
          user_id: req.user ? BigInt(req.user.id) : null,
          session_id: req.sessionID || null,
          page: req.originalUrl,
          action: "auth_attempt",
          metadata: JSON.stringify(logData),
          ip_address: logData.ip_address,
          user_agent: logData.user_agent,
        },
      })
      .catch((error) => {
        console.error("Failed to log auth attempt:", error);
      });

    originalSend.call(this, data);
  };

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireUser,
  requireDonorFlag,
  requireVolunteerFlag,
  authRateLimit,
  requireEmailVerification,
  requireActiveUser,
  logAuthAttempt,
};
