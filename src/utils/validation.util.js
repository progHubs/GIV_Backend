const { validatePasswordStrength } = require("./password.util");

/**
 * Validation Utilities for GIV Society Backend
 */

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Phone number validation regex (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

/**
 * Name validation regex (letters, spaces, hyphens, apostrophes)
 */
const NAME_REGEX = /^[a-zA-Z\s\-'\.]+$/;

/**
 * Slug validation regex (lowercase, hyphens, numbers)
 */
const SLUG_REGEX = /^[a-z0-9-]+$/;

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  return EMAIL_REGEX.test(email.trim().toLowerCase());
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
const isValidPhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return false;
  }

  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
  return PHONE_REGEX.test(cleanPhone);
};

/**
 * Validate name format
 * @param {string} name - Name to validate
 * @returns {boolean} - True if valid name format
 */
const isValidName = (name) => {
  if (!name || typeof name !== "string") {
    return false;
  }

  const trimmedName = name.trim();
  return (
    trimmedName.length >= 2 &&
    trimmedName.length <= 100 &&
    NAME_REGEX.test(trimmedName)
  );
};

/**
 * Validate slug format
 * @param {string} slug - Slug to validate
 * @returns {boolean} - True if valid slug format
 */
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== "string") {
    return false;
  }

  return slug.length >= 3 && slug.length <= 255 && SLUG_REGEX.test(slug);
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeString = (input) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/\s+/g, " "); // Normalize whitespace
};

/**
 * Validate and sanitize email
 * @param {string} email - Email to validate and sanitize
 * @returns {Object} - Validation result
 */
const validateEmail = (email) => {
  const sanitized = sanitizeString(email);

  if (!sanitized) {
    return {
      isValid: false,
      errors: ["Email is required"],
      sanitized: "",
    };
  }

  if (!isValidEmail(sanitized)) {
    return {
      isValid: false,
      errors: ["Invalid email format"],
      sanitized: "",
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: sanitized.toLowerCase(),
  };
};

/**
 * Validate and sanitize name
 * @param {string} name - Name to validate and sanitize
 * @returns {Object} - Validation result
 */
const validateName = (name) => {
  const sanitized = sanitizeString(name);

  if (!sanitized) {
    return {
      isValid: false,
      errors: ["Name is required"],
      sanitized: "",
    };
  }

  if (!isValidName(sanitized)) {
    return {
      isValid: false,
      errors: [
        "Name must be 2-100 characters and contain only letters, spaces, hyphens, and apostrophes",
      ],
      sanitized: "",
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: sanitized,
  };
};

/**
 * Validate and sanitize phone number
 * @param {string} phone - Phone number to validate and sanitize
 * @returns {Object} - Validation result
 */
const validatePhone = (phone) => {
  const sanitized = sanitizeString(phone);

  if (!sanitized) {
    return {
      isValid: false,
      errors: ["Phone number is required"],
      sanitized: "",
    };
  }

  if (!isValidPhone(sanitized)) {
    return {
      isValid: false,
      errors: [
        "Invalid phone number format. Please use international format (e.g., +1234567890)",
      ],
      sanitized: "",
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: sanitized.replace(/[\s\-\(\)]/g, ""),
  };
};

/**
 * Simplified Registration Validation
 */
const validateRegistrationData = (data) => {
  const errors = [];
  const sanitized = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    sanitized.email = emailValidation.sanitized;
  }

  // Validate full name
  const nameValidation = validateName(data.full_name);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  } else {
    sanitized.full_name = nameValidation.sanitized;
  }

  // Validate password
  const passwordValidation = validatePasswordStrength(data.password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  } else {
    sanitized.password = data.password;
  }

  // Validate phone (optional)
  if (data.phone) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    } else {
      sanitized.phone = phoneValidation.sanitized;
    }
  }

  // Validate role (optional, defaults to 'donor')
  if (data.role) {
    const validRoles = ["admin", "volunteer", "donor", "editor"];
    if (!validRoles.includes(data.role)) {
      errors.push("Invalid role specified");
    } else {
      sanitized.role = data.role;
    }
  } else {
    sanitized.role = "donor"; // Default role
  }

  // Validate language preference (optional, defaults to 'en')
  if (data.language_preference) {
    const validLanguages = ["en", "am"];
    if (!validLanguages.includes(data.language_preference)) {
      errors.push("Invalid language preference");
    } else {
      sanitized.language_preference = data.language_preference;
    }
  } else {
    sanitized.language_preference = "en"; // Default language
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate login data
 * @param {Object} data - Login data
 * @returns {Object} - Validation result
 */
const validateLoginData = (data) => {
  const errors = [];
  const sanitized = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    sanitized.email = emailValidation.sanitized;
  }

  // Validate password
  if (!data.password || typeof data.password !== "string") {
    errors.push("Password is required");
  } else if (data.password.trim().length === 0) {
    errors.push("Password cannot be empty");
  } else {
    sanitized.password = data.password;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate password reset data
 * @param {Object} data - Password reset data
 * @returns {Object} - Validation result
 */
const validatePasswordResetData = (data) => {
  const errors = [];
  const sanitized = {};

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  } else {
    sanitized.email = emailValidation.sanitized;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Simplified Password Change Validation
 */
const validatePasswordChangeData = (data) => {
  const errors = [];
  const sanitized = {};

  // Validate current password
  if (!data.current_password || typeof data.current_password !== "string") {
    errors.push("Current password is required");
  } else {
    sanitized.current_password = data.current_password;
  }

  // Validate new password
  const passwordValidation = validatePasswordStrength(data.new_password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  } else {
    sanitized.new_password = data.new_password;
  }

  // Validate password confirmation
  if (data.new_password !== data.confirm_password) {
    errors.push("Password confirmation does not match");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate profile update data
 * @param {Object} data - Profile update data
 * @returns {Object} - Validation result
 */
const validateProfileUpdateData = (data) => {
  const errors = [];
  const sanitized = {};

  // Validate full name (optional in updates)
  if (data.full_name !== undefined) {
    const nameValidation = validateName(data.full_name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      sanitized.full_name = nameValidation.sanitized;
    }
  }

  // Validate phone (optional)
  if (data.phone !== undefined) {
    if (data.phone === null || data.phone === "") {
      sanitized.phone = null;
    } else {
      const phoneValidation = validatePhone(data.phone);
      if (!phoneValidation.isValid) {
        errors.push(...phoneValidation.errors);
      } else {
        sanitized.phone = phoneValidation.sanitized;
      }
    }
  }

  // Validate language preference
  if (data.language_preference !== undefined) {
    const validLanguages = ["en", "am"];
    if (!validLanguages.includes(data.language_preference)) {
      errors.push("Invalid language preference");
    } else {
      sanitized.language_preference = data.language_preference;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate user update data
 * @param {Object} data - User update data
 * @returns {Object} - Validation result
 */
const validateUserUpdateData = (data) => {
  const errors = [];
  const sanitized = {};

  // Full name (optional)
  if (data.full_name !== undefined) {
    const nameValidation = validateName(data.full_name);
    if (!nameValidation.isValid) {
      errors.push(...nameValidation.errors);
    } else {
      sanitized.full_name = nameValidation.sanitized;
    }
  }

  // Phone (optional)
  if (data.phone !== undefined) {
    const phoneValidation = validatePhone(data.phone);
    if (!phoneValidation.isValid) {
      errors.push(...phoneValidation.errors);
    } else {
      sanitized.phone = phoneValidation.sanitized;
    }
  }

  // Language preference (optional)
  if (data.language_preference !== undefined) {
    if (!["en", "am"].includes(data.language_preference)) {
      errors.push('Language preference must be either "en" or "am"');
    } else {
      sanitized.language_preference = data.language_preference;
    }
  }

  // Profile image URL (optional)
  if (data.profile_image_url !== undefined) {
    const url = sanitizeString(data.profile_image_url);
    if (url) {
      try {
        new URL(url);
        sanitized.profile_image_url = url;
      } catch {
        errors.push("Profile image URL must be a valid URL");
      }
    } else {
      sanitized.profile_image_url = null;
    }
  }

  // Check if at least one valid field is provided (excluding null values)
  const validFields = Object.keys(sanitized).filter(
    (key) => sanitized[key] !== null && sanitized[key] !== undefined
  );
  if (validFields.length === 0) {
    errors.push("At least one field must be provided for update");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate volunteer data
 * @param {Object} data - Volunteer data
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - Validation result
 */
const validateVolunteerData = (data, isUpdate = false) => {
  const errors = [];
  const sanitized = {};

  // Area of expertise (optional)
  if (data.area_of_expertise !== undefined) {
    const expertise = sanitizeString(data.area_of_expertise);
    if (expertise) {
      if (expertise.length < 2 || expertise.length > 100) {
        errors.push("Area of expertise must be between 2 and 100 characters");
      } else {
        sanitized.area_of_expertise = expertise;
      }
    }
  }

  // Location (optional)
  if (data.location !== undefined) {
    const location = sanitizeString(data.location);
    if (location) {
      if (location.length < 2 || location.length > 255) {
        errors.push("Location must be between 2 and 255 characters");
      } else {
        sanitized.location = location;
      }
    }
  }

  // Availability (optional)
  if (data.availability !== undefined) {
    if (typeof data.availability === "object" && data.availability !== null) {
      sanitized.availability = JSON.stringify(data.availability);
    } else if (typeof data.availability === "string") {
      try {
        JSON.parse(data.availability);
        sanitized.availability = data.availability;
      } catch {
        errors.push("Availability must be a valid JSON object");
      }
    } else {
      errors.push("Availability must be a valid JSON object");
    }
  }

  // Motivation (optional)
  if (data.motivation !== undefined) {
    const motivation = sanitizeString(data.motivation);
    if (motivation) {
      if (motivation.length < 10 || motivation.length > 1000) {
        errors.push("Motivation must be between 10 and 1000 characters");
      } else {
        sanitized.motivation = motivation;
      }
    }
  }

  // Emergency contact name (optional)
  if (data.emergency_contact_name !== undefined) {
    const contactName = sanitizeString(data.emergency_contact_name);
    if (contactName) {
      if (contactName.length < 2 || contactName.length > 100) {
        errors.push(
          "Emergency contact name must be between 2 and 100 characters"
        );
      } else if (!/^[a-zA-Z\s]+$/.test(contactName)) {
        errors.push(
          "Emergency contact name can only contain letters and spaces"
        );
      } else {
        sanitized.emergency_contact_name = contactName;
      }
    }
  }

  // Emergency contact phone (optional)
  if (data.emergency_contact_phone !== undefined) {
    const contactPhone = sanitizeString(data.emergency_contact_phone);
    if (contactPhone) {
      if (!isValidPhone(contactPhone)) {
        errors.push(
          "Emergency contact phone must be a valid international format"
        );
      } else {
        sanitized.emergency_contact_phone = contactPhone.replace(
          /[\s\-\(\)]/g,
          ""
        );
      }
    }
  }

  // Certificate URL (optional)
  if (data.certificate_url !== undefined) {
    const url = sanitizeString(data.certificate_url);
    if (url) {
      try {
        new URL(url);
        sanitized.certificate_url = url;
      } catch {
        errors.push("Certificate URL must be a valid URL");
      }
    } else {
      sanitized.certificate_url = null;
    }
  }

  // For creation, require at least one field
  if (!isUpdate && Object.keys(sanitized).length === 0) {
    errors.push("At least one field must be provided for volunteer profile");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate donor data
 * @param {Object} data - Donor data
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} - Validation result
 */
const validateDonorData = (data, isUpdate = false) => {
  const errors = [];
  const sanitized = {};

  // is_recurring_donor (optional)
  if (data.is_recurring_donor !== undefined) {
    if (typeof data.is_recurring_donor !== "boolean") {
      errors.push("is_recurring_donor must be a boolean");
    } else {
      sanitized.is_recurring_donor = data.is_recurring_donor;
    }
  }

  // preferred_payment_method (optional)
  if (data.preferred_payment_method !== undefined) {
    const paymentMethod = sanitizeString(data.preferred_payment_method);
    if (paymentMethod) {
      if (paymentMethod.length < 2 || paymentMethod.length > 50) {
        errors.push(
          "Preferred payment method must be between 2 and 50 characters"
        );
      } else {
        sanitized.preferred_payment_method = paymentMethod;
      }
    }
  }

  // donation_frequency (optional)
  if (data.donation_frequency !== undefined) {
    const validFrequencies = ["monthly", "quarterly", "yearly"];
    if (!validFrequencies.includes(data.donation_frequency)) {
      errors.push(
        "Donation frequency must be one of: monthly, quarterly, yearly"
      );
    } else {
      sanitized.donation_frequency = data.donation_frequency;
    }
  }

  // tax_receipt_email (optional)
  if (data.tax_receipt_email !== undefined) {
    const email = sanitizeString(data.tax_receipt_email);
    if (email) {
      if (!isValidEmail(email)) {
        errors.push("Tax receipt email must be a valid email address");
      } else {
        sanitized.tax_receipt_email = email.toLowerCase();
      }
    } else {
      sanitized.tax_receipt_email = null;
    }
  }

  // is_anonymous (optional)
  if (data.is_anonymous !== undefined) {
    if (typeof data.is_anonymous !== "boolean") {
      errors.push("is_anonymous must be a boolean");
    } else {
      sanitized.is_anonymous = data.is_anonymous;
    }
  }

  // donation_tier (optional)
  if (data.donation_tier !== undefined) {
    const validTiers = ["bronze", "silver", "gold", "platinum"];
    if (!validTiers.includes(data.donation_tier)) {
      errors.push(
        "Donation tier must be one of: bronze, silver, gold, platinum"
      );
    } else {
      sanitized.donation_tier = data.donation_tier;
    }
  }

  // For creation, require at least one field
  if (!isUpdate && Object.keys(sanitized).length === 0) {
    errors.push("At least one field must be provided for donor profile");
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate pagination parameters
 * @param {Object} query - Query parameters
 * @returns {Object} - Validation result
 */
const validatePagination = (query) => {
  const errors = [];
  const sanitized = {
    page: 1,
    limit: 10,
  };

  // Validate page
  if (query.page !== undefined) {
    const page = parseInt(query.page);
    if (isNaN(page) || page < 1) {
      errors.push("Page must be a positive integer");
    } else {
      sanitized.page = page;
    }
  }

  // Validate limit
  if (query.limit !== undefined) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push("Limit must be between 1 and 100");
    } else {
      sanitized.limit = limit;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate ID parameter
 * @param {string} id - ID to validate
 * @returns {Object} - Validation result
 */
const validateId = (id) => {
  if (!id || typeof id !== "string") {
    return {
      isValid: false,
      errors: ["ID is required"],
      sanitized: null,
    };
  }

  const sanitized = id.trim();
  const numId = parseInt(sanitized);

  if (isNaN(numId) || numId <= 0) {
    return {
      isValid: false,
      errors: ["Invalid ID format"],
      sanitized: null,
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: numId.toString(),
  };
};

/**
 * Recursively convert all BigInt values in an object/array to strings for JSON serialization
 * @param {any} obj
 * @returns {any}
 */
function convertBigIntToString(obj) {
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  } else if (obj instanceof Date) {
    return obj.toISOString();
  } else if (obj && typeof obj === "object") {
    const result = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        result[key] = obj[key].toString();
      } else if (obj[key] instanceof Date) {
        result[key] = obj[key].toISOString();
      } else if (
        Array.isArray(obj[key]) ||
        (obj[key] && typeof obj[key] === "object")
      ) {
        result[key] = convertBigIntToString(obj[key]);
      } else {
        result[key] = obj[key];
      }
    }
    return result;
  } else if (typeof obj === "bigint") {
    return obj.toString();
  } else {
    return obj;
  }
}

/**
 * Generic string validation
 * @param {any} value - Value to validate
 * @param {string} field - Field name
 * @param {Object} options - Validation options
 * @param {boolean} [options.required] - Is required
 * @param {number} [options.minLength] - Minimum length
 * @param {number} [options.maxLength] - Maximum length
 * @param {boolean} [options.allowEmpty] - Allow empty string
 * @returns {Object} Validation result
 */
function validateString(value, field, options = {}) {
  const errors = [];
  let sanitized = value;

  if (value === undefined || value === null) {
    if (options.required) {
      errors.push(`${field} is required`);
    }
    return { isValid: errors.length === 0, errors, sanitized: undefined };
  }

  if (typeof value !== "string") {
    errors.push(`${field} must be a string`);
    return { isValid: false, errors, sanitized: undefined };
  }

  sanitized = value.trim();

  if (!options.allowEmpty && sanitized === "") {
    if (options.required) {
      errors.push(`${field} cannot be empty`);
    }
    return { isValid: errors.length === 0, errors, sanitized: undefined };
  }

  if (options.minLength !== undefined && sanitized.length < options.minLength) {
    errors.push(`${field} must be at least ${options.minLength} characters`);
  }
  if (options.maxLength !== undefined && sanitized.length > options.maxLength) {
    errors.push(`${field} must be at most ${options.maxLength} characters`);
  }

  return { isValid: errors.length === 0, errors, sanitized };
}

/**
 * Generic enum validation
 * @param {any} value - Value to validate
 * @param {string} field - Field name
 * @param {Array} allowed - Allowed values
 * @param {Object} options - Validation options
 * @param {boolean} [options.required] - Is required
 * @param {any} [options.default] - Default value
 * @returns {Object} Validation result
 */
function validateEnum(value, field, allowed, options = {}) {
  const errors = [];
  let sanitized = value;

  if (value === undefined || value === null || value === "") {
    if (options.required) {
      errors.push(`${field} is required`);
    } else if (options.default !== undefined) {
      sanitized = options.default;
    } else {
      sanitized = undefined;
    }
    return { isValid: errors.length === 0, errors, sanitized };
  }

  if (!allowed.includes(value)) {
    errors.push(`${field} must be one of: ${allowed.join(", ")}`);
  }

  return { isValid: errors.length === 0, errors, sanitized };
}

/**
 * Generic boolean validation
 * @param {any} value - Value to validate
 * @param {string} field - Field name
 * @param {Object} options - Validation options
 * @param {boolean} [options.required] - Is required
 * @param {boolean} [options.default] - Default value
 * @returns {Object} Validation result
 */
function validateBoolean(value, field, options = {}) {
  const errors = [];
  let sanitized = value;

  if (value === undefined || value === null || value === "") {
    if (options.required) {
      errors.push(`${field} is required`);
    } else if (options.default !== undefined) {
      sanitized = options.default;
    } else {
      sanitized = undefined;
    }
    return { isValid: errors.length === 0, errors, sanitized };
  }

  if (typeof value === "boolean") {
    sanitized = value;
  } else if (typeof value === "string") {
    if (value.toLowerCase() === "true") sanitized = true;
    else if (value.toLowerCase() === "false") sanitized = false;
    else errors.push(`${field} must be a boolean (true/false)`);
  } else {
    errors.push(`${field} must be a boolean`);
  }

  return { isValid: errors.length === 0, errors, sanitized };
}

/**
 * Generic number validation
 * @param {any} value - Value to validate
 * @param {string} field - Field name
 * @param {Object} options - Validation options
 * @param {boolean} [options.required] - Is required
 * @param {number} [options.min] - Minimum value
 * @param {number} [options.max] - Maximum value
 * @param {number} [options.default] - Default value
 * @param {boolean} [options.integer] - Should be integer
 * @returns {Object} Validation result
 */
function validateNumber(value, field, options = {}) {
  const errors = [];
  let sanitized = value;

  if (value === undefined || value === null || value === "") {
    if (options.required) {
      errors.push(`${field} is required`);
    } else if (options.default !== undefined) {
      sanitized = options.default;
    } else {
      sanitized = undefined;
    }
    return { isValid: errors.length === 0, errors, sanitized };
  }

  let num = value;
  if (typeof value === "string" && value.trim() !== "") {
    num = Number(value);
  }
  if (typeof num !== "number" || isNaN(num)) {
    errors.push(`${field} must be a number`);
    return { isValid: false, errors, sanitized: undefined };
  }

  if (options.integer && !Number.isInteger(num)) {
    errors.push(`${field} must be an integer`);
  }
  if (options.min !== undefined && num < options.min) {
    errors.push(`${field} must be at least ${options.min}`);
  }
  if (options.max !== undefined && num > options.max) {
    errors.push(`${field} must be at most ${options.max}`);
  }

  sanitized = num;
  return { isValid: errors.length === 0, errors, sanitized };
}

module.exports = {
  EMAIL_REGEX,
  PHONE_REGEX,
  NAME_REGEX,
  SLUG_REGEX,
  isValidEmail,
  isValidPhone,
  isValidName,
  isValidSlug,
  sanitizeString,
  validateEmail,
  validateName,
  validatePhone,
  validateRegistrationData,
  validateLoginData,
  validatePasswordResetData,
  validatePasswordChangeData,
  validateProfileUpdateData,
  validateUserUpdateData,
  validateVolunteerData,
  validateDonorData,
  validatePagination,
  validateId,
  convertBigIntToString,
  validateString,
  validateEnum,
  validateBoolean,
  validateNumber,
};
