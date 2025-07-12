const express = require('express');
const router = express.Router();
const TestimonialController = require('../controllers/testimonial.controller')

router.get('/', TestimonialController.getTestimonial)
router.post('/', TestimonialController.createTestimonial)
router.delete('/:id', TestimonialController.deleteTestimonial)
router.get('/:id/translations', TestimonialController.getTranslationTestimonial)
module.exports = router; 