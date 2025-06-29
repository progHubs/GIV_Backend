const { SLUG_REGEX, sanitizeString, validateId } = require("./validation.util");

/**
 * Post type enumeration
 */
const POST_TYPES = {
  BLOG: "blog",
  NEWS: "news",
  PRESS_RELEASE: "press_release",
};

/**
 * Language enumeration
 */
const LANGUAGES = {
  ENGLISH: "en",
  AMHARIC: "am",
};

/**
 * Validate post title
 * @param {string} title - Post title to validate
 * @returns {Object} - Validation result
 */
const validateTitle = (title) => {
  if (!title || typeof title !== "string") {
    return {
      isValid: false,
      errors: ["Title is required"],
      sanitized: "",
    };
  }

  const sanitized = sanitizeString(title);

  if (sanitized.length < 3) {
    return {
      isValid: false,
      errors: ["Title must be at least 3 characters long"],
      sanitized: "",
    };
  }

  if (sanitized.length > 255) {
    return {
      isValid: false,
      errors: ["Title must not exceed 255 characters"],
      sanitized: "",
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized,
  };
};

/**
 * Validate post slug
 * @param {string} slug - Slug to validate
 * @returns {Object} - Validation result
 */
const validateSlug = (slug) => {
  if (!slug || typeof slug !== "string") {
    return {
      isValid: false,
      errors: ["Slug is required"],
      sanitized: "",
    };
  }

  const sanitized = slug.toLowerCase().trim();

  if (!SLUG_REGEX.test(sanitized)) {
    return {
      isValid: false,
      errors: ["Slug can only contain lowercase letters, numbers, and hyphens"],
      sanitized: "",
    };
  }

  if (sanitized.length < 3 || sanitized.length > 255) {
    return {
      isValid: false,
      errors: ["Slug must be between 3 and 255 characters"],
      sanitized: "",
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized,
  };
};

/**
 * Validate post content
 * @param {string} content - Post content to validate
 * @returns {Object} - Validation result
 */
const validateContent = (content) => {
  // Content is optional
  if (!content) {
    return {
      isValid: true,
      errors: [],
      sanitized: null,
    };
  }

  if (typeof content !== "string") {
    return {
      isValid: false,
      errors: ["Content must be a string"],
      sanitized: null,
    };
  }

  const sanitized = sanitizeString(content);

  return {
    isValid: true,
    errors: [],
    sanitized,
  };
};

/**
 * Validate post type
 * @param {string} postType - Post type to validate
 * @returns {Object} - Validation result
 */
const validatePostType = (postType) => {
  if (!postType) {
    return {
      isValid: false,
      errors: ["Post type is required"],
      sanitized: "",
    };
  }

  const validTypes = Object.values(POST_TYPES);
  if (!validTypes.includes(postType)) {
    return {
      isValid: false,
      errors: [`Post type must be one of: ${validTypes.join(", ")}`],
      sanitized: "",
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: postType,
  };
};

/**
 * Validate post language
 * @param {string} language - Language to validate
 * @returns {Object} - Validation result
 */
const validateLanguage = (language) => {
  // Language is optional, defaults to 'en'
  if (!language) {
    return {
      isValid: true,
      errors: [],
      sanitized: LANGUAGES.ENGLISH,
    };
  }

  const validLanguages = Object.values(LANGUAGES);
  if (!validLanguages.includes(language)) {
    return {
      isValid: false,
      errors: [`Language must be one of: ${validLanguages.join(", ")}`],
      sanitized: "",
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: language,
  };
};

/**
 * Validate feature image URL
 * @param {string} image - Image URL or Cloudinary URL
 * @returns {Object} - Validation result
 */
const validateFeatureImage = (image) => {
  // Feature image is optional
  if (!image) {
    return {
      isValid: true,
      errors: [],
      sanitized: null,
    };
  }

  // Must be a string
  if (typeof image !== "string") {
    return {
      isValid: false,
      errors: ["Feature image must be a URL string"],
      sanitized: null,
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitized: image.trim(),
  };
};

/**
 * Validate complete post data
 * @param {Object} data - Post data to validate
 * @returns {Object} - Validation result
 */
const validatePostData = (data) => {
  const errors = [];
  const sanitized = {};

  // Validate title (required)
  const titleValidation = validateTitle(data.title);
  if (!titleValidation.isValid) {
    errors.push(...titleValidation.errors);
  } else {
    sanitized.title = titleValidation.sanitized;
  }

  // Validate slug (required)
  const slugValidation = validateSlug(data.slug);
  if (!slugValidation.isValid) {
    errors.push(...slugValidation.errors);
  } else {
    sanitized.slug = slugValidation.sanitized;
  }

  // Validate content (optional)
  const contentValidation = validateContent(data.content);
  if (!contentValidation.isValid) {
    errors.push(...contentValidation.errors);
  } else if (contentValidation.sanitized !== null) {
    sanitized.content = contentValidation.sanitized;
  }

  // Validate post type (required)
  const postTypeValidation = validatePostType(data.post_type);
  if (!postTypeValidation.isValid) {
    errors.push(...postTypeValidation.errors);
  } else {
    sanitized.post_type = postTypeValidation.sanitized;
  }

  // Validate author ID (optional)
  if (data.author_id) {
    const authorValidation = validateId(data.author_id);
    if (!authorValidation.isValid) {
      errors.push(...authorValidation.errors);
    } else {
      sanitized.author_id = parseInt(authorValidation.sanitized);
    }
  }

  // Validate feature image (optional)
  if (data.feature_image) {
    const imageValidation = validateFeatureImage(data.feature_image);
    if (!imageValidation.isValid) {
      errors.push(...imageValidation.errors);
    } else if (imageValidation.sanitized !== null) {
      sanitized.feature_image = imageValidation.sanitized;
    }
  }

  // Validate language (optional, defaults to 'en')
  const languageValidation = validateLanguage(data.language);
  if (!languageValidation.isValid) {
    errors.push(...languageValidation.errors);
  } else {
    sanitized.language = languageValidation.sanitized;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate post update data
 * @param {Object} data - Post update data to validate
 * @returns {Object} - Validation result
 */
const validatePostUpdateData = (data) => {
  const errors = [];
  const sanitized = {};

  // Validate title (optional for updates)
  if (data.title !== undefined && data.title !== null && data.title !== "") {
    const titleValidation = validateTitle(data.title);
    if (!titleValidation.isValid) {
      errors.push(...titleValidation.errors);
    } else {
      sanitized.title = titleValidation.sanitized;
    }
  }

  // Validate slug (optional for updates)
  if (data.slug !== undefined && data.slug !== null && data.slug !== "") {
    const slugValidation = validateSlug(data.slug);
    if (!slugValidation.isValid) {
      errors.push(...slugValidation.errors);
    } else {
      sanitized.slug = slugValidation.sanitized;
    }
  }

  // Validate content (optional)
  if (
    data.content !== undefined &&
    data.content !== null &&
    data.content !== ""
  ) {
    const contentValidation = validateContent(data.content);
    if (!contentValidation.isValid) {
      errors.push(...contentValidation.errors);
    } else if (contentValidation.sanitized !== null) {
      sanitized.content = contentValidation.sanitized;
    }
  }

  // Validate post type (optional for updates)
  if (
    data.post_type !== undefined &&
    data.post_type !== null &&
    data.post_type !== ""
  ) {
    const postTypeValidation = validatePostType(data.post_type);
    if (!postTypeValidation.isValid) {
      errors.push(...postTypeValidation.errors);
    } else {
      sanitized.post_type = postTypeValidation.sanitized;
    }
  }

  // Validate feature image (optional)
  if (
    data.feature_image !== undefined &&
    data.feature_image !== null &&
    data.feature_image !== ""
  ) {
    const imageValidation = validateFeatureImage(data.feature_image);
    if (!imageValidation.isValid) {
      errors.push(...imageValidation.errors);
    } else if (imageValidation.sanitized !== null) {
      sanitized.feature_image = imageValidation.sanitized;
    }
  }

  // Validate language (optional)
  if (
    data.language !== undefined &&
    data.language !== null &&
    data.language !== ""
  ) {
    const languageValidation = validateLanguage(data.language);
    if (!languageValidation.isValid) {
      errors.push(...languageValidation.errors);
    } else {
      sanitized.language = languageValidation.sanitized;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

module.exports = {
  POST_TYPES,
  LANGUAGES,
  validateTitle,
  validateSlug,
  validateContent,
  validatePostType,
  validateLanguage,
  validateFeatureImage,
  validatePostData,
  validatePostUpdateData,
};
