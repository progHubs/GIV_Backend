const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

class TestimonialService {
    async getAll() {
        try {
            return await prisma.testimonials.findMany();
        } catch (error) {
            throw new Error('Failed to fetch testimonials');
        }
    }

    async create(data) {
        try {
            return await prisma.testimonials.create({ data })
        } catch (error) {
            throw new Error('Failed to create testimonial');
        }
    }
    async delete(id) {
        try {
            return await prisma.testimonials.delete({
                where: { id: BigInt(id) }
            })
        } catch (error) {
            if (error.code === 'P2025') {
                throw new Error('Testimonial not found');
            }
            console.log('Error deleting testimonial:', error.message);
            throw error;
        }
    }
    async getTranslation(id) {
        try {
            const testimonialID = await prisma.testimonials.findUnique({
                where: { id: BigInt(id) }
            })
            if (!testimonialID || !testimonialID.translation_group_id) {
                throw new Error('Translation group not found');
            }
            const groupID = testimonialID.translation_group_id

            const testimonial = await prisma.testimonials.findMany({
                where: { translation_group_id: groupID }
            })
            return testimonial
        } catch (error) {
            console.log('error with getting translation of testimonial service')
            throw error
        }
    }
}

module.exports = new TestimonialService();