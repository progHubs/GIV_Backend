const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * JWT Utility Functions for GIV Society Backend
 */

// Token expiration times (in seconds)
const TOKEN_EXPIRATION = {
  ACCESS: 15 * 60,        // 15 minutes
  REFRESH: 7 * 24 * 60 * 60, // 7 days
  RESET: 10 * 60,         // 10 minutes
  VERIFY: 24 * 60 * 60    // 24 hours
};

/**
 * Generate access token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} - JWT access token
 */
const generateAccessToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION.ACCESS,
      issuer: 'giv-society',
      audience: 'giv-society-users'
    });
  } catch (error) {
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION.REFRESH,
      issuer: 'giv-society',
      audience: 'giv-society-users'
    });
  } catch (error) {
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate password reset token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} - JWT reset token
 */
const generateResetToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION.RESET,
      issuer: 'giv-society',
      audience: 'giv-society-reset'
    });
  } catch (error) {
    throw new Error('Failed to generate reset token');
  }
};

/**
 * Generate email verification token
 * @param {Object} payload - Token payload (user data)
 * @returns {string} - JWT verification token
 */
const generateVerificationToken = (payload) => {
  try {
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION.VERIFY,
      issuer: 'giv-society',
      audience: 'giv-society-verify'
    });
  } catch (error) {
    throw new Error('Failed to generate verification token');
  }
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} audience - Expected audience (optional)
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token, audience = null) => {
  try {
    const options = {
      issuer: 'giv-society'
    };
    
    if (audience) {
      options.audience = audience;
    }
    
    return jwt.verify(token, process.env.JWT_SECRET, options);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Failed to decode token');
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} payload - Token payload (user data)
 * @returns {Object} - Object containing access and refresh tokens
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    expiresIn: TOKEN_EXPIRATION.ACCESS
  };
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Generate random token for password reset
 * @returns {string} - Random token
 */
const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired, false otherwise
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

module.exports = {
  TOKEN_EXPIRATION,
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  generateVerificationToken,
  verifyToken,
  decodeToken,
  generateTokenPair,
  extractTokenFromHeader,
  generateRandomToken,
  isTokenExpired,
  getTokenExpiration
}; 