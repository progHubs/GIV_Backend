const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class SkillService {
  /**
   * Get all skills with optional filtering
   */
  async getAllSkills(filters = {}) {
    try {
      const where = {};

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search } },
          { description: { contains: filters.search } }
        ];
      }

      const skills = await prisma.skills.findMany({
        where,
        include: {
          volunteer_skills: {
            include: {
              volunteer_profiles: {
                include: {
                  users: {
                    select: {
                      id: true,
                      full_name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { name: 'asc' }
      });

      // Convert BigInt to string for JSON serialization
      const serializedSkills = skills.map(skill => ({
        ...skill,
        id: skill.id.toString(),
        volunteer_skills: skill.volunteer_skills.map(vs => ({
          ...vs,
          volunteer_id: vs.volunteer_id.toString(),
          skill_id: vs.skill_id.toString(),
          volunteer_profiles: {
            ...vs.volunteer_profiles,
            user_id: vs.volunteer_profiles.user_id.toString(),
            users: {
              ...vs.volunteer_profiles.users,
              id: vs.volunteer_profiles.users.id.toString()
            }
          }
        }))
      }));

      return {
        success: true,
        data: serializedSkills,
        count: serializedSkills.length
      };
    } catch (error) {
      throw new Error(`Failed to fetch skills: ${error.message}`);
    }
  }

  /**
   * Get skill by ID
   */
  async getSkillById(skillId) {
    try {
      const skill = await prisma.skills.findUnique({
        where: { id: parseInt(skillId) },
        include: {
          volunteer_skills: {
            include: {
              volunteer_profiles: {
                include: {
                  users: {
                    select: {
                      id: true,
                      full_name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!skill) {
        throw new Error('Skill not found');
      }

      // Convert BigInt to string for JSON serialization
      const serializedSkill = {
        ...skill,
        id: skill.id.toString(),
        volunteer_skills: skill.volunteer_skills.map(vs => ({
          ...vs,
          volunteer_id: vs.volunteer_id.toString(),
          skill_id: vs.skill_id.toString(),
          volunteer_profiles: {
            ...vs.volunteer_profiles,
            user_id: vs.volunteer_profiles.user_id.toString(),
            users: {
              ...vs.volunteer_profiles.users,
              id: vs.volunteer_profiles.users.id.toString()
            }
          }
        }))
      };

      return {
        success: true,
        data: serializedSkill
      };
    } catch (error) {
      throw new Error(`Failed to fetch skill: ${error.message}`);
    }
  }

  /**
   * Create new skill
   */
  async createSkill(skillData) {
    try {
      // Check if skill with same name already exists
      const existingSkill = await prisma.skills.findFirst({
        where: { name: skillData.name }
      });

      if (existingSkill) {
        throw new Error('Skill with this name already exists');
      }

      const skill = await prisma.skills.create({
        data: {
          name: skillData.name,
          category: skillData.category,
          description: skillData.description
        }
      });

      // Convert BigInt to string for JSON serialization
      const serializedSkill = {
        ...skill,
        id: skill.id.toString()
      };

      return {
        success: true,
        data: serializedSkill,
        message: 'Skill created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create skill: ${error.message}`);
    }
  }

  /**
   * Update skill
   */
  async updateSkill(skillId, updateData) {
    try {
      // Check if skill exists
      const existingSkill = await prisma.skills.findUnique({
        where: { id: parseInt(skillId) }
      });

      if (!existingSkill) {
        throw new Error('Skill not found');
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingSkill.name) {
        const duplicateSkill = await prisma.skills.findFirst({
          where: {
            name: updateData.name,
            id: { not: parseInt(skillId) }
          }
        });

        if (duplicateSkill) {
          throw new Error('Skill with this name already exists');
        }
      }

      const updatedSkill = await prisma.skills.update({
        where: { id: parseInt(skillId) },
        data: updateData
      });

      // Convert BigInt to string for JSON serialization
      const serializedSkill = {
        ...updatedSkill,
        id: updatedSkill.id.toString()
      };

      return {
        success: true,
        data: serializedSkill,
        message: 'Skill updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update skill: ${error.message}`);
    }
  }

  /**
   * Delete skill
   */
  async deleteSkill(skillId) {
    try {
      // Check if skill exists
      const existingSkill = await prisma.skills.findUnique({
        where: { id: parseInt(skillId) },
        include: {
          volunteer_skills: true
        }
      });

      if (!existingSkill) {
        throw new Error('Skill not found');
      }

      // Check if skill is assigned to any volunteers
      if (existingSkill.volunteer_skills.length > 0) {
        throw new Error('Cannot delete skill that is assigned to volunteers');
      }

      await prisma.skills.delete({
        where: { id: parseInt(skillId) }
      });

      return {
        success: true,
        message: 'Skill deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete skill: ${error.message}`);
    }
  }

  /**
   * Search skills with advanced filtering - DISABLED
   * Removed due to implementation issues causing timeouts
   */
  /*
  async searchSkills(searchCriteria, pagination = {}) {
    try {
      const {
        query,
        category
      } = searchCriteria;

      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortOrder = 'asc'
      } = pagination;

      // Build simple where clause
      const where = {};

      if (query) {
        where.OR = [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } }
        ];
      }

      if (category) {
        where.category = category;
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Simple search without complex includes
      const [skills, totalCount] = await Promise.all([
        prisma.skills.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.skills.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        skills: skills.map(skill => convertBigIntToString(skill)),
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        total: totalCount
      };

    } catch (error) {
      logger.error('Error searching skills:', error);
      return {
        success: false,
        error: 'Failed to search skills',
        code: 'SKILL_SEARCH_ERROR'
      };
    }
  }
  */

  /**
   * Get volunteer's skills
   */
  async getVolunteerSkills(volunteerId) {
    try {
      const volunteerSkills = await prisma.volunteer_skills.findMany({
        where: { volunteer_id: parseInt(volunteerId) },
        include: {
          skills: true
        },
        orderBy: { skills: { name: 'asc' } }
      });

      // Convert BigInt to string for JSON serialization
      const serializedVolunteerSkills = volunteerSkills.map(vs => ({
        ...vs,
        volunteer_id: vs.volunteer_id.toString(),
        skill_id: vs.skill_id.toString(),
        skills: {
          ...vs.skills,
          id: vs.skills.id.toString()
        }
      }));

      return {
        success: true,
        data: serializedVolunteerSkills,
        count: serializedVolunteerSkills.length
      };
    } catch (error) {
      throw new Error(`Failed to fetch volunteer skills: ${error.message}`);
    }
  }

  /**
   * Add skill to volunteer
   */
  async addSkillToVolunteer(volunteerId, skillId, proficiencyLevel = 'beginner') {
    try {
      // Check if volunteer exists
      const volunteer = await prisma.volunteer_profiles.findUnique({
        where: { user_id: parseInt(volunteerId) }
      });

      if (!volunteer) {
        throw new Error('Volunteer not found');
      }

      // Check if skill exists
      const skill = await prisma.skills.findUnique({
        where: { id: parseInt(skillId) }
      });

      if (!skill) {
        throw new Error('Skill not found');
      }

      // Check if skill is already assigned to volunteer
      const existingAssignment = await prisma.volunteer_skills.findUnique({
        where: {
          volunteer_id_skill_id: {
            volunteer_id: parseInt(volunteerId),
            skill_id: parseInt(skillId)
          }
        }
      });

      if (existingAssignment) {
        throw new Error('Skill is already assigned to this volunteer');
      }

      const volunteerSkill = await prisma.volunteer_skills.create({
        data: {
          volunteer_id: parseInt(volunteerId),
          skill_id: parseInt(skillId),
          proficiency_level: proficiencyLevel,
          is_verified: false
        },
        include: {
          skills: true
        }
      });

      // Convert BigInt to string for JSON serialization
      const serializedVolunteerSkill = {
        ...volunteerSkill,
        volunteer_id: volunteerSkill.volunteer_id.toString(),
        skill_id: volunteerSkill.skill_id.toString(),
        skills: {
          ...volunteerSkill.skills,
          id: volunteerSkill.skills.id.toString()
        }
      };

      return {
        success: true,
        data: serializedVolunteerSkill,
        message: 'Skill added to volunteer successfully'
      };
    } catch (error) {
      throw new Error(`Failed to add skill to volunteer: ${error.message}`);
    }
  }

  /**
   * Update volunteer skill
   */
  async updateVolunteerSkill(volunteerId, skillId, updateData) {
    try {
      const volunteerSkill = await prisma.volunteer_skills.update({
        where: {
          volunteer_id_skill_id: {
            volunteer_id: parseInt(volunteerId),
            skill_id: parseInt(skillId)
          }
        },
        data: updateData,
        include: {
          skills: true
        }
      });

      // Convert BigInt to string for JSON serialization
      const serializedVolunteerSkill = {
        ...volunteerSkill,
        volunteer_id: volunteerSkill.volunteer_id.toString(),
        skill_id: volunteerSkill.skill_id.toString(),
        skills: {
          ...volunteerSkill.skills,
          id: volunteerSkill.skills.id.toString()
        }
      };

      return {
        success: true,
        data: serializedVolunteerSkill,
        message: 'Volunteer skill updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update volunteer skill: ${error.message}`);
    }
  }

  /**
   * Remove skill from volunteer
   */
  async removeSkillFromVolunteer(volunteerId, skillId) {
    try {
      await prisma.volunteer_skills.delete({
        where: {
          volunteer_id_skill_id: {
            volunteer_id: parseInt(volunteerId),
            skill_id: parseInt(skillId)
          }
        }
      });

      return {
        success: true,
        message: 'Skill removed from volunteer successfully'
      };
    } catch (error) {
      throw new Error(`Failed to remove skill from volunteer: ${error.message}`);
    }
  }

  /**
   * Verify volunteer skill
   */
  async verifyVolunteerSkill(volunteerId, skillId) {
    try {
      const volunteerSkill = await prisma.volunteer_skills.update({
        where: {
          volunteer_id_skill_id: {
            volunteer_id: parseInt(volunteerId),
            skill_id: parseInt(skillId)
          }
        },
        data: { is_verified: true },
        include: {
          skills: true
        }
      });

      // Convert BigInt to string for JSON serialization
      const serializedVolunteerSkill = {
        ...volunteerSkill,
        volunteer_id: volunteerSkill.volunteer_id.toString(),
        skill_id: volunteerSkill.skill_id.toString(),
        skills: {
          ...volunteerSkill.skills,
          id: volunteerSkill.skills.id.toString()
        }
      };

      return {
        success: true,
        data: serializedVolunteerSkill,
        message: 'Volunteer skill verified successfully'
      };
    } catch (error) {
      throw new Error(`Failed to verify volunteer skill: ${error.message}`);
    }
  }

  /**
   * Get skill categories
   */
  async getSkillCategories() {
    try {
      const categories = await prisma.skills.findMany({
        select: { category: true },
        where: { category: { not: null } },
        distinct: ['category']
      });

      return {
        success: true,
        data: categories.map(cat => cat.category).sort()
      };
    } catch (error) {
      throw new Error(`Failed to fetch skill categories: ${error.message}`);
    }
  }

  /**
   * Get skills statistics
   */
  async getSkillsStats() {
    try {
      const totalSkills = await prisma.skills.count();
      const totalAssignments = await prisma.volunteer_skills.count();
      const verifiedAssignments = await prisma.volunteer_skills.count({
        where: { is_verified: true }
      });

      const skillsByCategory = await prisma.skills.groupBy({
        by: ['category'],
        _count: { id: true }
      });

      const proficiencyDistribution = await prisma.volunteer_skills.groupBy({
        by: ['proficiency_level'],
        _count: { volunteer_id: true }
      });

      // Convert BigInt to string for JSON serialization
      const serializedSkillsByCategory = skillsByCategory.map(cat => ({
        ...cat,
        _count: {
          ...cat._count,
          id: cat._count.id.toString()
        }
      }));

      const serializedProficiencyDistribution = proficiencyDistribution.map(prof => ({
        ...prof,
        _count: {
          ...prof._count,
          volunteer_id: prof._count.volunteer_id.toString()
        }
      }));

      return {
        success: true,
        data: {
          totalSkills: totalSkills.toString(),
          totalAssignments: totalAssignments.toString(),
          verifiedAssignments: verifiedAssignments.toString(),
          verificationRate: totalAssignments > 0 ? (verifiedAssignments / totalAssignments * 100).toFixed(2) : 0,
          skillsByCategory: serializedSkillsByCategory,
          proficiencyDistribution: serializedProficiencyDistribution
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch skills statistics: ${error.message}`);
    }
  }
}

module.exports = new SkillService(); 