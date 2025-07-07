const skillService = require('../../services/skill.service');
const { validateSkill, validateVolunteerSkill } = require('../validators/skill.validator');

class SkillController {
  /**
   * Get all skills
   */
  async getSkills(req, res) {
    try {
      const { category, search } = req.query;
      const filters = { category, search };

      const result = await skillService.getAllSkills(filters);

      res.status(200).json({
        success: true,
        message: 'Skills retrieved successfully',
        data: result.data,
        count: result.count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'SKILLS_FETCH_ERROR'
      });
    }
  }

  /**
   * Get skill by ID
   */
  async getSkillById(req, res) {
    try {
      const { id } = req.params;
      const result = await skillService.getSkillById(id);

      res.status(200).json({
        success: true,
        message: 'Skill retrieved successfully',
        data: result.data
      });
    } catch (error) {
      if (error.message === 'Skill not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SKILL_NOT_FOUND'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message,
        code: 'SKILL_FETCH_ERROR'
      });
    }
  }

  /**
   * Create new skill
   */
  async createSkill(req, res) {
    try {
      // Validate request body
      const { error, value } = validateSkill(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
          code: 'VALIDATION_ERROR'
        });
      }

      const result = await skillService.createSkill(value);

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          code: 'SKILL_ALREADY_EXISTS'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message,
        code: 'SKILL_CREATE_ERROR'
      });
    }
  }

  /**
   * Update skill
   */
  async updateSkill(req, res) {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = validateSkill(req.body, true);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
          code: 'VALIDATION_ERROR'
        });
      }

      const result = await skillService.updateSkill(id, value);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message === 'Skill not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SKILL_NOT_FOUND'
        });
      }

      if (error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          code: 'SKILL_ALREADY_EXISTS'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message,
        code: 'SKILL_UPDATE_ERROR'
      });
    }
  }

  /**
   * Delete skill
   */
  async deleteSkill(req, res) {
    try {
      const { id } = req.params;
      const result = await skillService.deleteSkill(id);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      if (error.message === 'Skill not found') {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'SKILL_NOT_FOUND'
        });
      }

      if (error.message.includes('assigned to volunteers')) {
        return res.status(400).json({
          success: false,
          message: error.message,
          code: 'SKILL_IN_USE'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message,
        code: 'SKILL_DELETE_ERROR'
      });
    }
  }

  /**
   * Search skills with advanced filtering - DISABLED
   * Removed due to implementation issues causing timeouts
   */
  /*
  async searchSkills(req, res) {
    try {
      // Simplified search criteria
      const searchCriteria = {
        query: req.query.q,
        category: req.query.category
      };

      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 10, 100),
        sortBy: req.query.sortBy || 'name',
        sortOrder: req.query.sortOrder || 'asc'
      };

      const result = await skillService.searchSkills(searchCriteria, pagination);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error,
          code: result.code
        });
      }

      res.status(200).json({
        success: true,
        message: 'Skills search completed',
        data: result.skills,
        pagination: result.pagination,
        total: result.total
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'SKILL_SEARCH_ERROR'
      });
    }
  }
  */

  /**
   * Get volunteer's skills
   */
  async getVolunteerSkills(req, res) {
    try {
      const { volunteerId } = req.params;
      const result = await skillService.getVolunteerSkills(volunteerId);

      res.status(200).json({
        success: true,
        message: 'Volunteer skills retrieved successfully',
        data: result.data,
        count: result.count
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'VOLUNTEER_SKILLS_FETCH_ERROR'
      });
    }
  }

  /**
   * Add skill to volunteer
   */
  async addSkillToVolunteer(req, res) {
    try {
      const { volunteerId } = req.params;
      const { skillId, proficiencyLevel } = req.body;

      // Validate request body
      const { error, value } = validateVolunteerSkill(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
          code: 'VALIDATION_ERROR'
        });
      }

      // Map proficiencyLevel to proficiency_level for the service
      const proficiency_level = value.proficiencyLevel;

      const result = await skillService.addSkillToVolunteer(
        volunteerId,
        value.skillId,
        proficiency_level
      );

      res.status(201).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      if (error.message.includes('already assigned')) {
        return res.status(409).json({
          success: false,
          message: error.message,
          code: 'SKILL_ALREADY_ASSIGNED'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message,
        code: 'VOLUNTEER_SKILL_ADD_ERROR'
      });
    }
  }

  /**
   * Update volunteer skill
   */
  async updateVolunteerSkill(req, res) {
    try {
      const { volunteerId, skillId } = req.params;
      const updateData = req.body;

      // Validate request body
      const { error, value } = validateVolunteerSkill(req.body, true);
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: error.details.map(detail => detail.message),
          code: 'VALIDATION_ERROR'
        });
      }

      // Map proficiencyLevel to proficiency_level for the service
      const mappedUpdateData = { ...value };
      if (mappedUpdateData.proficiencyLevel) {
        mappedUpdateData.proficiency_level = mappedUpdateData.proficiencyLevel;
        delete mappedUpdateData.proficiencyLevel;
      }

      const result = await skillService.updateVolunteerSkill(volunteerId, skillId, mappedUpdateData);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'VOLUNTEER_SKILL_UPDATE_ERROR'
      });
    }
  }

  /**
   * Remove skill from volunteer
   */
  async removeSkillFromVolunteer(req, res) {
    try {
      const { volunteerId, skillId } = req.params;
      const result = await skillService.removeSkillFromVolunteer(volunteerId, skillId);

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'VOLUNTEER_SKILL_REMOVE_ERROR'
      });
    }
  }

  /**
   * Verify volunteer skill
   */
  async verifyVolunteerSkill(req, res) {
    try {
      const { volunteerId, skillId } = req.params;
      const result = await skillService.verifyVolunteerSkill(volunteerId, skillId);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'VOLUNTEER_SKILL_VERIFY_ERROR'
      });
    }
  }

  /**
   * Get skill categories
   */
  async getSkillCategories(req, res) {
    try {
      const result = await skillService.getSkillCategories();

      res.status(200).json({
        success: true,
        message: 'Skill categories retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'SKILL_CATEGORIES_FETCH_ERROR'
      });
    }
  }

  /**
   * Get skills statistics
   */
  async getSkillsStats(req, res) {
    try {
      const result = await skillService.getSkillsStats();

      res.status(200).json({
        success: true,
        message: 'Skills statistics retrieved successfully',
        data: result.data
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
        code: 'SKILLS_STATS_FETCH_ERROR'
      });
    }
  }
}

const controller = new SkillController();
module.exports = {
  getSkills: controller.getSkills.bind(controller),
  getSkillById: controller.getSkillById.bind(controller),
  createSkill: controller.createSkill.bind(controller),
  updateSkill: controller.updateSkill.bind(controller),
  deleteSkill: controller.deleteSkill.bind(controller),
  // searchSkills: controller.searchSkills.bind(controller), // Removed due to implementation issues
  getVolunteerSkills: controller.getVolunteerSkills.bind(controller),
  addSkillToVolunteer: controller.addSkillToVolunteer.bind(controller),
  updateVolunteerSkill: controller.updateVolunteerSkill.bind(controller),
  removeSkillFromVolunteer: controller.removeSkillFromVolunteer.bind(controller),
  verifyVolunteerSkill: controller.verifyVolunteerSkill.bind(controller),
  getSkillCategories: controller.getSkillCategories.bind(controller),
  getSkillsStats: controller.getSkillsStats.bind(controller),
};