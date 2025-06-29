const bcrypt = require('bcrypt');

/**
 * Password Security Utilities for GIV Society Backend
 */

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  MIN_SPECIAL_CHARS: 1,
  MIN_NUMBERS: 1,
  MIN_UPPERCASE: 1,
  MIN_LOWERCASE: 1
};

// Bcrypt configuration
const BCRYPT_CONFIG = {
  SALT_ROUNDS: 12,
  MIN_SALT_ROUNDS: 10
};

/**
 * Hash password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Password must be a non-empty string');
    }
    
    const saltRounds = BCRYPT_CONFIG.SALT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches hash
 */
const comparePassword = async (password, hash) => {
  try {
    if (!password || !hash) {
      return false;
    }
    
    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with errors array
 */
const validatePasswordStrength = (password) => {
  const errors = [];
  
  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  // Check length
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters long`);
  }
  
  if (password.length > PASSWORD_REQUIREMENTS.MAX_LENGTH) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.MAX_LENGTH} characters`);
  }
  
  // Check for uppercase letters
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Check for lowercase letters
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Check for numbers
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Check for special characters
  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL_CHARS && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a more secure password');
  }
  
  // Check for sequential characters
  if (/(.)\1{2,}/.test(password)) {
    errors.push('Password should not contain repeated characters');
  }
  
  // Check for keyboard sequences
  const keyboardSequences = ['qwerty', 'asdfgh', 'zxcvbn', '123456'];
  const passwordLower = password.toLowerCase();
  
  for (const sequence of keyboardSequences) {
    if (passwordLower.includes(sequence)) {
      errors.push('Password should not contain keyboard sequences');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

/**
 * Calculate password strength score (0-100)
 * @param {string} password - Password to evaluate
 * @returns {number} - Strength score (0-100)
 */
const calculatePasswordStrength = (password) => {
  let score = 0;
  
  if (!password) return score;
  
  // Length contribution (up to 25 points)
  score += Math.min(password.length * 2, 25);
  
  // Character variety contribution (up to 25 points)
  let variety = 0;
  if (/[a-z]/.test(password)) variety++;
  if (/[A-Z]/.test(password)) variety++;
  if (/\d/.test(password)) variety++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) variety++;
  score += variety * 6.25; // 25 points / 4 character types
  
  // Complexity contribution (up to 25 points)
  const uniqueChars = new Set(password).size;
  score += Math.min(uniqueChars * 2, 25);
  
  // Entropy contribution (up to 25 points)
  const charSet = new Set(password);
  let entropy = 0;
  
  if (/[a-z]/.test(password)) entropy += 26;
  if (/[A-Z]/.test(password)) entropy += 26;
  if (/\d/.test(password)) entropy += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) entropy += 32;
  
  const entropyScore = Math.log2(entropy) * password.length;
  score += Math.min(entropyScore / 10, 25);
  
  return Math.min(Math.round(score), 100);
};

/**
 * Get password strength level
 * @param {number} score - Password strength score (0-100)
 * @returns {string} - Strength level description
 */
const getPasswordStrengthLevel = (score) => {
  if (score >= 80) return 'Very Strong';
  if (score >= 60) return 'Strong';
  if (score >= 40) return 'Moderate';
  if (score >= 20) return 'Weak';
  return 'Very Weak';
};

/**
 * Generate a secure random password
 * @param {number} length - Password length (default: 16)
 * @param {boolean} includeSpecialChars - Include special characters (default: true)
 * @returns {string} - Generated password
 */
const generateSecurePassword = (length = 16, includeSpecialChars = true) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let chars = lowercase + uppercase + numbers;
  if (includeSpecialChars) {
    chars += special;
  }
  
  let password = '';
  
  // Ensure at least one character from each required category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  
  if (includeSpecialChars) {
    password += special[Math.floor(Math.random() * special.length)];
  }
  
  // Fill the rest with random characters
  for (let i = password.length; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Check if password hash needs to be updated (rehashed)
 * @param {string} hash - Current password hash
 * @returns {boolean} - True if hash needs updating
 */
const needsRehash = (hash) => {
  try {
    const saltRounds = bcrypt.getRounds(hash);
    return saltRounds < BCRYPT_CONFIG.MIN_SALT_ROUNDS;
  } catch (error) {
    return true; // Invalid hash, needs rehashing
  }
};

/**
 * Update password hash if needed
 * @param {string} password - Plain text password
 * @param {string} currentHash - Current password hash
 * @returns {Promise<string>} - Updated hash or current hash if no update needed
 */
const updateHashIfNeeded = async (password, currentHash) => {
  if (needsRehash(currentHash)) {
    return await hashPassword(password);
  }
  return currentHash;
};

module.exports = {
  PASSWORD_REQUIREMENTS,
  BCRYPT_CONFIG,
  hashPassword,
  comparePassword,
  validatePasswordStrength,
  calculatePasswordStrength,
  getPasswordStrengthLevel,
  generateSecurePassword,
  needsRehash,
  updateHashIfNeeded
}; 