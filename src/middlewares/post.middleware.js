const Post = require("../models/post.model");
const logger = require("../utils/logger.util");

/**
 * Middleware to check if user owns the post or has admin/editor privileges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkPostOwnership = async (req, res, next) => {
  try {
    const postId = req.params.id;
    const currentUser = req.user;

    // Get the post to check ownership
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
        code: "POST_NOT_FOUND",
      });
    }

    // Check if user is the author, admin, or editor
    const isAuthor = post.author_id === currentUser.id;
    const isAdmin = currentUser.role === "admin";
    const isEditor = currentUser.role === "editor";

    if (!isAuthor && !isAdmin && !isEditor) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        message:
          "You can only modify your own posts unless you are an admin or editor",
        code: "INSUFFICIENT_PERMISSIONS",
        required: "Post author, admin, or editor role",
        userRole: currentUser.role,
        isAuthor: isAuthor,
        postAuthor: post.author_id,
      });
    }

    // Add post to request for use in controller
    req.post = post;
    next();
  } catch (error) {
    logger.error("Error in checkPostOwnership middleware:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "MIDDLEWARE_ERROR",
    });
  }
};

/**
 * Middleware to check if user can create posts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const checkPostCreationPermission = async (req, res, next) => {
  try {
    const currentUser = req.user;

    // Check if user has required role for post creation
    const allowedRoles = ["admin", "editor", "user"];

    if (!allowedRoles.includes(currentUser.role)) {
      return res.status(403).json({
        success: false,
        error: "Insufficient permissions",
        message: "You do not have permission to create posts",
        code: "INSUFFICIENT_PERMISSIONS",
        required: "Admin, editor, or user role",
        userRole: currentUser.role,
      });
    }

    // Check if user's email is verified (optional security measure)
    if (
      process.env.REQUIRE_EMAIL_VERIFICATION === "true" &&
      !currentUser.email_verified
    ) {
      return res.status(403).json({
        success: false,
        error: "Email verification required",
        message: "Please verify your email before creating posts",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    next();
  } catch (error) {
    logger.error("Error in checkPostCreationPermission middleware:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      code: "MIDDLEWARE_ERROR",
    });
  }
};

/**
 * Middleware to add user context to public routes (optional authentication)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const addUserContext = async (req, res, next) => {
  try {
    // This middleware adds user context to public routes if user is authenticated
    // Useful for showing edit/delete buttons to post authors
    if (req.user) {
      req.userContext = {
        id: req.user.id,
        role: req.user.role,
        email_verified: req.user.email_verified,
      };
    }
    next();
  } catch (error) {
    logger.error("Error in addUserContext middleware:", error);
    next(); // Continue even if this middleware fails
  }
};

/**
 * Middleware to rate limit post creation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const rateLimitPostCreation = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const userId = req.user?.id || "anonymous";
  const key = `post_creation_${userId}_${clientIP}`;

  // Simple in-memory rate limiting (in production, use Redis)
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxPosts = 10; // Max 10 posts per hour

  // Initialize rate limit store if not exists
  if (!req.app.locals.postRateLimit) {
    req.app.locals.postRateLimit = new Map();
  }

  const rateLimitStore = req.app.locals.postRateLimit;

  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return next();
  }

  const record = rateLimitStore.get(key);

  // Reset if window has passed
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return next();
  }

  // Check if limit exceeded
  if (record.count >= maxPosts) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    return res.status(429).json({
      success: false,
      error: "Too many post creation attempts",
      message: `You can create up to ${maxPosts} posts per hour. Please try again later.`,
      code: "RATE_LIMIT_EXCEEDED",
      retryAfter,
    });
  }

  // Increment count
  record.count++;
  next();
};

module.exports = {
  checkPostOwnership,
  checkPostCreationPermission,
  addUserContext,
  rateLimitPostCreation,
};
