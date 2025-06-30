const Joi = require('joi');

/**
 * Validation schema for skill creation
 */
const skillCreateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Skill name must be at least 2 characters long',
      'string.max': 'Skill name cannot exceed 100 characters',
      'any.required': 'Skill name is required'
    }),
  category: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Category cannot exceed 50 characters'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

/**
 * Validation schema for skill updates
 */
const skillUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Skill name must be at least 2 characters long',
      'string.max': 'Skill name cannot exceed 100 characters'
    }),
  category: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Category cannot exceed 50 characters'
    }),
  description: Joi.string()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 500 characters'
    })
});

/**
 * Validation schema for volunteer skill assignment
 */
const volunteerSkillSchema = Joi.object({
  skillId: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Skill ID must be a number',
      'number.integer': 'Skill ID must be an integer',
      'number.positive': 'Skill ID must be positive',
      'any.required': 'Skill ID is required'
    }),
  proficiencyLevel: Joi.string()
    .valid('beginner', 'intermediate', 'expert')
    .default('beginner')
    .messages({
      'any.only': 'Proficiency level must be beginner, intermediate, or expert'
    })
});

/**
 * Validation schema for volunteer skill updates
 */
const volunteerSkillUpdateSchema = Joi.object({
  proficiencyLevel: Joi.string()
    .valid('beginner', 'intermediate', 'expert')
    .required()
    .messages({
      'any.only': 'Proficiency level must be beginner, intermediate, or expert',
      'any.required': 'Proficiency level is required'
    }),
  isVerified: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Verification status must be a boolean'
    })
});

/**
 * Validation schema for skill search
 */
const skillSearchSchema = Joi.object({
  q: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Search term must be at least 1 character long',
      'string.max': 'Search term cannot exceed 100 characters',
      'any.required': 'Search term is required'
    }),
  category: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Category cannot exceed 50 characters'
    })
});

/**
 * Validation schema for skill filters
 */
const skillFiltersSchema = Joi.object({
  category: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Category cannot exceed 50 characters'
    }),
  search: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Search term cannot exceed 100 characters'
    })
});

/**
 * Validate skill data for creation
 */
const validateSkill = (data, isUpdate = false) => {
  const schema = isUpdate ? skillUpdateSchema : skillCreateSchema;
  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate volunteer skill data
 */
const validateVolunteerSkill = (data, isUpdate = false) => {
  const schema = isUpdate ? volunteerSkillUpdateSchema : volunteerSkillSchema;
  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate skill search parameters
 */
const validateSkillSearch = (data) => {
  return skillSearchSchema.validate(data, { abortEarly: false });
};

/**
 * Validate skill filters
 */
const validateSkillFilters = (data) => {
  return skillFiltersSchema.validate(data, { abortEarly: false });
};

/**
 * Validate skill ID parameter
 */
const validateSkillId = (skillId) => {
  const schema = Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Skill ID must be a number',
      'number.integer': 'Skill ID must be an integer',
      'number.positive': 'Skill ID must be positive',
      'any.required': 'Skill ID is required'
    });

  return schema.validate(skillId);
};

/**
 * Validate volunteer ID parameter
 */
const validateVolunteerId = (volunteerId) => {
  const schema = Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Volunteer ID must be a number',
      'number.integer': 'Volunteer ID must be an integer',
      'number.positive': 'Volunteer ID must be positive',
      'any.required': 'Volunteer ID is required'
    });

  return schema.validate(volunteerId);
};

module.exports = {
  validateSkill,
  validateVolunteerSkill,
  validateSkillSearch,
  validateSkillFilters,
  validateSkillId,
  validateVolunteerId,
  skillCreateSchema,
  skillUpdateSchema,
  volunteerSkillSchema,
  volunteerSkillUpdateSchema,
  skillSearchSchema,
  skillFiltersSchema
}; 