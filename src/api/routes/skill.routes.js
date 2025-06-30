const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skill.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { validateSkillId, validateVolunteerId } = require('../validators/skill.validator');

/**
 * @route   GET /api/skills
 * @desc    Get all skills with optional filtering
 * @access  Public
 */
router.get('/', skillController.getSkills);

/**
 * @route   GET /api/skills/search
 * @desc    Search skills by term
 * @access  Public
 */
router.get('/search', skillController.searchSkills);

/**
 * @route   GET /api/skills/categories
 * @desc    Get all skill categories
 * @access  Public
 */
router.get('/categories', skillController.getSkillCategories);

/**
 * @route   GET /api/skills/stats
 * @desc    Get skills statistics
 * @access  Admin only
 */
router.get('/stats', authMiddleware.authenticateToken, authMiddleware.requireRole('admin'), skillController.getSkillsStats);

/**
 * @route   GET /api/skills/volunteers/:volunteerId
 * @desc    Get volunteer's skills
 * @access  Public (or authenticated for own skills)
 */
router.get('/volunteers/:volunteerId', skillController.getVolunteerSkills);

/**
 * @route   POST /api/skills/volunteers/:volunteerId
 * @desc    Add skill to volunteer
 * @access  Admin/Volunteer Manager only
 */
router.post('/volunteers/:volunteerId', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireRole('admin', 'volunteer_manager'), 
  skillController.addSkillToVolunteer
);

/**
 * @route   PUT /api/skills/volunteers/:volunteerId/:skillId
 * @desc    Update volunteer skill
 * @access  Admin/Volunteer Manager only
 */
router.put('/volunteers/:volunteerId/:skillId', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireRole('admin', 'volunteer_manager'), 
  skillController.updateVolunteerSkill
);

/**
 * @route   DELETE /api/skills/volunteers/:volunteerId/:skillId
 * @desc    Remove skill from volunteer
 * @access  Admin/Volunteer Manager only
 */
router.delete('/volunteers/:volunteerId/:skillId', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireRole('admin', 'volunteer_manager'), 
  skillController.removeSkillFromVolunteer
);

/**
 * @route   PUT /api/skills/volunteers/:volunteerId/:skillId/verify
 * @desc    Verify volunteer skill
 * @access  Admin/Volunteer Manager only
 */
router.put('/volunteers/:volunteerId/:skillId/verify', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireRole('admin', 'volunteer_manager'), 
  skillController.verifyVolunteerSkill
);

/**
 * @route   GET /api/skills/:id
 * @desc    Get skill by ID
 * @access  Public
 */
router.get('/:id', skillController.getSkillById);

/**
 * @route   POST /api/skills
 * @desc    Create new skill
 * @access  Admin only
 */
router.post('/', authMiddleware.authenticateToken, authMiddleware.requireRole('admin'), skillController.createSkill);

/**
 * @route   PUT /api/skills/:id
 * @desc    Update skill
 * @access  Admin only
 */
router.put('/:id', authMiddleware.authenticateToken, authMiddleware.requireRole('admin'), skillController.updateSkill);

/**
 * @route   DELETE /api/skills/:id
 * @desc    Delete skill
 * @access  Admin only
 */
router.delete('/:id', authMiddleware.authenticateToken, authMiddleware.requireRole('admin'), skillController.deleteSkill);

module.exports = router; 