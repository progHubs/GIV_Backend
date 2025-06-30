const {
  validateString,
  validateEnum,
  validateBoolean,
  validateNumber,
} = require("./validation.util");

/**
 * Validate FAQ data
 * @param {Object} data - FAQ data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result
 */
const validateFAQ = (data, isUpdate = false) => {
  const errors = [];
  const sanitized = {};

  // Question validation
  if (!isUpdate || data.question !== undefined) {
    const questionValidation = validateString(data.question, "question", {
      required: !isUpdate,
      minLength: 10,
      maxLength: 1000,
    });

    if (!questionValidation.isValid) {
      errors.push(...questionValidation.errors);
    } else if (questionValidation.sanitized !== undefined) {
      sanitized.question = questionValidation.sanitized;
    }
  }

  // Answer validation
  if (!isUpdate || data.answer !== undefined) {
    const answerValidation = validateString(data.answer, "answer", {
      required: !isUpdate,
      minLength: 20,
      maxLength: 5000,
    });

    if (!answerValidation.isValid) {
      errors.push(...answerValidation.errors);
    } else if (answerValidation.sanitized !== undefined) {
      sanitized.answer = answerValidation.sanitized;
    }
  }

  // Category validation
  if (data.category !== undefined) {
    const categoryValidation = validateString(data.category, "category", {
      required: false,
      maxLength: 50,
      allowEmpty: true,
    });

    if (!categoryValidation.isValid) {
      errors.push(...categoryValidation.errors);
    } else if (categoryValidation.sanitized !== undefined) {
      sanitized.category = categoryValidation.sanitized || null;
    }
  }

  // Language validation
  if (data.language !== undefined) {
    const languageValidation = validateEnum(
      data.language,
      "language",
      ["en", "am"],
      {
        required: false,
        default: "en",
      }
    );

    if (!languageValidation.isValid) {
      errors.push(...languageValidation.errors);
    } else if (languageValidation.sanitized !== undefined) {
      sanitized.language = languageValidation.sanitized;
    }
  }

  // Translation group ID validation
  if (data.translation_group_id !== undefined) {
    const translationGroupValidation = validateString(
      data.translation_group_id,
      "translation_group_id",
      {
        required: false,
        maxLength: 36,
        allowEmpty: true,
      }
    );

    if (!translationGroupValidation.isValid) {
      errors.push(...translationGroupValidation.errors);
    } else if (translationGroupValidation.sanitized !== undefined) {
      sanitized.translation_group_id =
        translationGroupValidation.sanitized || null;
    }
  }

  // Is active validation
  if (data.is_active !== undefined) {
    const isActiveValidation = validateBoolean(data.is_active, "is_active", {
      required: false,
      default: true,
    });

    if (!isActiveValidation.isValid) {
      errors.push(...isActiveValidation.errors);
    } else if (isActiveValidation.sanitized !== undefined) {
      sanitized.is_active = isActiveValidation.sanitized;
    }
  }

  // Sort order validation
  if (data.sort_order !== undefined) {
    const sortOrderValidation = validateNumber(data.sort_order, "sort_order", {
      required: false,
      min: 0,
      max: 999999,
      default: 0,
      integer: true,
    });

    if (!sortOrderValidation.isValid) {
      errors.push(...sortOrderValidation.errors);
    } else if (sortOrderValidation.sanitized !== undefined) {
      sanitized.sort_order = sortOrderValidation.sanitized;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate FAQ search query
 * @param {string} query - Search query
 * @returns {Object} Validation result
 */
const validateFAQSearch = (query) => {
  const errors = [];
  let sanitized = null;

  const queryValidation = validateString(query, "query", {
    required: true,
    minLength: 2,
    maxLength: 100,
  });

  if (!queryValidation.isValid) {
    errors.push(...queryValidation.errors);
  } else {
    sanitized = queryValidation.sanitized;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate FAQ category
 * @param {string} category - Category name
 * @returns {Object} Validation result
 */
const validateFAQCategory = (category) => {
  const errors = [];
  let sanitized = null;

  const categoryValidation = validateString(category, "category", {
    required: true,
    minLength: 2,
    maxLength: 50,
  });

  if (!categoryValidation.isValid) {
    errors.push(...categoryValidation.errors);
  } else {
    sanitized = categoryValidation.sanitized;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

/**
 * Validate FAQ sort data for bulk update
 * @param {Array} sortData - Array of sort data objects
 * @returns {Object} Validation result
 */
const validateFAQSortData = (sortData) => {
  const errors = [];
  let sanitized = null;

  if (!Array.isArray(sortData)) {
    errors.push("Sort data must be an array");
    return { isValid: false, errors, sanitized };
  }

  if (sortData.length === 0) {
    errors.push("Sort data array cannot be empty");
    return { isValid: false, errors, sanitized };
  }

  const validatedData = [];

  for (let i = 0; i < sortData.length; i++) {
    const item = sortData[i];
    const itemErrors = [];

    // Validate ID
    if (!item.id) {
      itemErrors.push(`Item ${i + 1}: ID is required`);
    } else {
      const idValidation = validateNumber(item.id, `item ${i + 1} id`, {
        required: true,
        min: 1,
        integer: true,
      });

      if (!idValidation.isValid) {
        itemErrors.push(...idValidation.errors);
      }
    }

    // Validate sort order
    if (item.sort_order === undefined || item.sort_order === null) {
      itemErrors.push(`Item ${i + 1}: Sort order is required`);
    } else {
      const sortOrderValidation = validateNumber(
        item.sort_order,
        `item ${i + 1} sort_order`,
        {
          required: true,
          min: 0,
          max: 999999,
          integer: true,
        }
      );

      if (!sortOrderValidation.isValid) {
        itemErrors.push(...sortOrderValidation.errors);
      }
    }

    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
    } else {
      validatedData.push({
        id: parseInt(item.id),
        sort_order: parseInt(item.sort_order),
      });
    }
  }

  if (errors.length === 0) {
    sanitized = validatedData;
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

module.exports = {
  validateFAQ,
  validateFAQSearch,
  validateFAQCategory,
  validateFAQSortData,
};
