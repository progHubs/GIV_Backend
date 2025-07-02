const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class EventService {
  /**
   * Create a new event
   * @param {Object} data
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async createEvent(data, user) {
    try {
      // Only admin/editor can create
      if (!user || !['admin', 'editor'].includes(user.role)) {
        return { success: false, error: 'Insufficient permissions' };
      }
      // Set created_by and translation_group_id
      const eventData = {
        ...data,
        created_by: user.id,
        created_at: new Date(),
        updated_at: new Date(),
        translation_group_id: data.translation_group_id || undefined, // Let DB trigger set if not provided
      };
      const event = await prisma.events.create({ data: eventData });
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List/filter events (with multilingual support)
   * @param {Object} filters
   * @param {string} lang
   * @returns {Promise<Object>}
   */
  async getEvents(filters, lang) {
    try {
      const where = { deleted_at: null };
      if (lang) where.language = lang;
      if (filters.category) where.category = filters.category;
      if (filters.status) where.status = filters.status;
      if (filters.is_featured !== undefined) where.is_featured = filters.is_featured === 'true';
      if (filters.start_date) where.event_date = { gte: new Date(filters.start_date) };
      if (filters.end_date) {
        where.event_date = where.event_date || {};
        where.event_date.lte = new Date(filters.end_date);
      }
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 10;
      const skip = (page - 1) * limit;
      const [events, totalCount] = await Promise.all([
        prisma.events.findMany({ where, orderBy: { event_date: 'asc' }, skip, take: limit }),
        prisma.events.count({ where })
      ]);
      return {
        success: true,
        events,
        pagination: { page, limit, totalCount, totalPages: Math.ceil(totalCount / limit) }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get event by ID
   * @param {string|number} id
   * @param {string} lang
   * @returns {Promise<Object>}
   */
  async getEventById(id, lang) {
    try {
      const where = { id: BigInt(id), deleted_at: null };
      if (lang) where.language = lang;
      const event = await prisma.events.findFirst({ where });
      if (!event) return { success: false, error: 'Event not found' };
      return { success: true, event };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update event
   * @param {string|number} id
   * @param {Object} data
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async updateEvent(id, data, user) {
    try {
      // Only admin/editor can update
      if (!user || !['admin', 'editor'].includes(user.role)) {
        return { success: false, error: 'Insufficient permissions' };
      }
      const event = await prisma.events.findUnique({ where: { id: BigInt(id) } });
      if (!event || event.deleted_at) return { success: false, error: 'Event not found' };
      // If language changes, handle translation_group_id (advanced: not implemented here)
      const updated = await prisma.events.update({
        where: { id: BigInt(id) },
        data: { ...data, updated_at: new Date() },
      });
      return { success: true, event: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Soft delete event
   * @param {string|number} id
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async deleteEvent(id, user) {
    try {
      // Only admin can delete
      if (!user || user.role !== 'admin') {
        return { success: false, error: 'Insufficient permissions' };
      }
      const event = await prisma.events.findUnique({ where: { id: BigInt(id) } });
      if (!event || event.deleted_at) return { success: false, error: 'Event not found' };
      await prisma.events.update({
        where: { id: BigInt(id) },
        data: { deleted_at: new Date(), updated_at: new Date() },
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Register a user for an event
   * @param {string|number} eventId
   * @param {Object} user
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async registerForEvent(eventId, user, data) {
    try {
      if (!user) return { success: false, error: 'Authentication required' };
      const event = await prisma.events.findUnique({ where: { id: BigInt(eventId) } });
      if (!event || event.deleted_at) return { success: false, error: 'Event not found' };
      if (event.status !== 'upcoming') return { success: false, error: 'Event is not open for registration' };
      if (event.registration_deadline && new Date() > event.registration_deadline) return { success: false, error: 'Registration deadline has passed' };
      if (event.capacity && event.registered_count >= event.capacity) return { success: false, error: 'Event is full' };
      // Prevent duplicate registration
      const existing = await prisma.event_participants.findUnique({ where: { event_id_user_id: { event_id: BigInt(eventId), user_id: BigInt(user.id) } } });
      if (existing) return { success: false, error: 'Already registered for this event' };
      // Register
      const participant = await prisma.event_participants.create({
        data: {
          event_id: BigInt(eventId),
          user_id: BigInt(user.id),
          role: data.role || 'attendee',
          status: 'registered',
          registered_at: new Date(),
        }
      });
      // Increment registered_count
      await prisma.events.update({ where: { id: BigInt(eventId) }, data: { registered_count: { increment: 1 } } });
      return { success: true, participant };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * List participants for an event
   * @param {string|number} eventId
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async listParticipants(eventId, user) {
    try {
      const event = await prisma.events.findUnique({ where: { id: BigInt(eventId) } });
      if (!event || event.deleted_at) return { success: false, error: 'Event not found' };
      let where = { event_id: BigInt(eventId) };
      if (!user || (!['admin', 'organizer'].includes(user.role))) {
        if (!user) return { success: false, error: 'Authentication required' };
        where.user_id = BigInt(user.id);
      }
      const participants = await prisma.event_participants.findMany({ where });
      return { success: true, participants };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update participant status/feedback
   * @param {string|number} eventId
   * @param {string|number} userId
   * @param {Object} data
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async updateParticipant(eventId, userId, data, user) {
    try {
      if (!user || (!['admin', 'organizer'].includes(user.role))) {
        return { success: false, error: 'Insufficient permissions' };
      }
      const participant = await prisma.event_participants.findUnique({ where: { event_id_user_id: { event_id: BigInt(eventId), user_id: BigInt(userId) } } });
      if (!participant) return { success: false, error: 'Participant not found' };
      const updated = await prisma.event_participants.update({
        where: { event_id_user_id: { event_id: BigInt(eventId), user_id: BigInt(userId) } },
        data: { ...data },
      });
      return { success: true, participant: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove participant from event
   * @param {string|number} eventId
   * @param {string|number} userId
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async removeParticipant(eventId, userId, user) {
    try {
      if (!user || (!['admin', 'organizer'].includes(user.role))) {
        return { success: false, error: 'Insufficient permissions' };
      }
      const participant = await prisma.event_participants.findUnique({ where: { event_id_user_id: { event_id: BigInt(eventId), user_id: BigInt(userId) } } });
      if (!participant) return { success: false, error: 'Participant not found' };
      await prisma.event_participants.delete({ where: { event_id_user_id: { event_id: BigInt(eventId), user_id: BigInt(userId) } } });
      await prisma.events.update({ where: { id: BigInt(eventId) }, data: { registered_count: { decrement: 1 } } });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EventService(); 