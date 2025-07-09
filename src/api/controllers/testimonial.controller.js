const testimonialService = require('../../services/testimonial.service');
const TestimonialService = require('../../services/testimonial.service')
const { validateName, sanitizeString } = require('../../utils/validation.util')
/**
 * Testimonial Controller for GIV Society Backend
 * Handles all Testimonial-related HTTP requests
 */
class TestimonialController {
    /**
      * Get all Testimonials
      */
    async getTestimonial(req, res) {
        try {
            const testimonial = await TestimonialService.getAll()

            // Convert BigInt to string
            const formatted = testimonial.map(t => ({
                ...t,
                id: t.id.toString()
            }));

            res.status(200).json({
                success: true,
                data: formatted
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                success: false,
                message: 'Failed to fetch testimonials'
            })
        }
    }

    /**
   * Create new Testimonial
   */
    async createTestimonial(req, res) {
        try {
            const { name, role, message, type, language, image_url, translation_group_id, is_featured
            } = req.body;
            const data = {
                name, role, message, type, language, image_url, translation_group_id, is_featured
            }

            const errors = [];

            // Validate Name
            const validatedName = validateName(name);
            if (!validatedName.isValid) errors.push(...validatedName.errors);

            // Validate Language
            const correctLanguage = ['en', 'am'];
            if (!correctLanguage.includes(language)) {
                errors.push('Language must be "en" or "am"');
            }

            // Validate Image Url
            let sanitizedImageUrl = sanitizeString(image_url);
            if (sanitizedImageUrl) {
                try {
                    new URL(sanitizedImageUrl);
                } catch {
                    errors.push('Image URL must be a valid URL');
                }
            } else {
                sanitizedImageUrl = null;
            }

            // Validate Message
            if (!message || typeof message !== 'string' || message.trim().length < 10) {
                errors.push('Message is required and must be at least 10 characters long');
            }

            // Validate Role
            if (typeof role !== 'string' || role.trim().length < 2 || role.trim().length > 100) {
                errors.push('Role must be 2-100 characters long');
            }

            // Validate Type
            const validTypes = ['volunteer', 'beneficiary', 'partner'];
            if (!type || !validTypes.includes(type)) {
                errors.push('Type must be one of: volunteer, beneficiary, partner');
            }

            // Validate Transation Group ID
            if (!translation_group_id || typeof translation_group_id !== 'string' || translation_group_id.trim().length > 36) {
                errors.push('Translation group id must be a string with max 36 characters');
            }

            // Validate is Featured
            if (typeof is_featured !== 'boolean') {
                errors.push('is featured must be a boolean');
            }

            if (errors.length > 0) {
                return res.status(400).json({ success: false, message: errors });
            }

            const testimonial = await TestimonialService.create(data)

            // Convert BigInt id to string before sending response
            const formatted = {
                ...testimonial,
                id: testimonial.id.toString(),
            };

            res.status(201).json({
                success: true,
                message: 'Testimonial created',
                data: formatted
            })
        } catch (error) {
            console.error('Error creating testimonial:', error.message);
            res.status(500).json({
                success: false,
                message: 'Failed to create testimonial'
            })
        }
    }

    /**
   * Delete Testimonial
   */
    async deleteTestimonial(req, res) {
        try {
            const id = req.params.id

            // Validate that ID is provided
            if (!id) {
                return res.status(400).json({ success: false, message: "ID Required" });
            }
            const testimonial = await TestimonialService.delete(id)
            res.status(200).json({
                success: true,
                message: 'Testimonial deleted successfully',
            })
        } catch (error) {
            const errorMessage = error.message === 'Testimonial not found'
                ? 'Testimonial not found'
                : 'Failed to delete testimonial';

            res.status(error.message === 'Testimonial not found' ? 404 : 500).json({
                success: false,
                message: errorMessage
            });
        }
    }

    /**
   * Get Testimonial Translation
   */
    async getTranslationTestimonial(req, res) {
        try {
            const id = req.params.id
            // Validate that ID is provided
            if (!id) {
                return res.status(400).json({ success: false, message: "ID Required" });
            }
            const testimonial = await testimonialService.getTranslation(id)
            const formatted = testimonial.map(t => ({
                ...t,
                id: t.id.toString()
            }));

            res.status(200).json({
                success: true,
                data: formatted
            })
        } catch (error) {
            const errorMessage = error.message === 'Translation group not found'
                ? 'Translation group not found'
                : 'Failed to fetch Transition testimonials'
            console.log(error)
            res.status(500).json({
                success: false,
                message: errorMessage
            })
        }
    }
}

module.exports = new TestimonialController();