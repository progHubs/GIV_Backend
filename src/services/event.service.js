const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const emailService = require('./email.service.js');
const { Parser } = require('json2csv');
const { convertBigIntToString } = require('../utils/validation.util');

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

      // Send registration confirmation email (non-blocking)
      try {
        // Load event and user details for the email
        await emailService.sendEventRegistrationConfirmation(user.email, user.full_name, event);
      } catch (e) {
        console.error('Failed to send event registration confirmation email:', e);
      }

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
      const updateData = { ...data };
      if (data.status === 'attended') {
        updateData.attended_at = new Date();
      }
      // Optionally allow setting status to 'reminded'
      if (data.status && !['registered', 'confirmed', 'reminded', 'attended', 'no_show'].includes(data.status)) {
        return { success: false, error: 'Invalid status value' };
      }
      const updated = await prisma.event_participants.update({
        where: { event_id_user_id: { event_id: BigInt(eventId), user_id: BigInt(userId) } },
        data: updateData,
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

  /**
   * Get analytics for a single event
   * @param {string|number} eventId
   * @returns {Promise<Object>}
   */
  async getEventAnalytics(eventId) {
    try {
      const event = await prisma.events.findUnique({ where: { id: BigInt(eventId) } });
      if (!event || event.deleted_at) return { success: false, error: 'Event not found' };
      const participants = await prisma.event_participants.findMany({ where: { event_id: BigInt(eventId) } });
      const totalRegistrations = participants.length;
      const attended = participants.filter(p => p.status === 'attended');
      const totalAttended = attended.length;
      const totalConfirmed = participants.filter(p => p.status === 'confirmed').length;
      const totalNoShow = participants.filter(p => p.status === 'no_show').length;
      const feedbackCount = participants.filter(p => p.feedback && p.feedback.trim() !== '').length;
      const avgRating = participants.reduce((sum, p) => sum + (p.rating || 0), 0) / (participants.filter(p => p.rating).length || 1);
      const totalHours = attended.reduce((sum, p) => sum + (Number(p.hours_contributed) || 0), 0);
      const analytics = {
        eventId: eventId.toString(),
        totalRegistrations,
        totalAttended,
        totalConfirmed,
        totalNoShow,
        feedbackCount,
        avgRating: Number(avgRating.toFixed(2)),
        totalVolunteerHours: Number(totalHours.toFixed(2)),
      };
      console.log('DEBUG analytics (event):', JSON.stringify(analytics));
      return { success: true, analytics };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get aggregate analytics for all events
   * @returns {Promise<Object>}
   */
  async getAggregateEventAnalytics() {
    try {
      const events = await prisma.events.findMany({ where: { deleted_at: null } });
      const participants = await prisma.event_participants.findMany({});
      const totalEvents = Number(events.length);
      const totalRegistrations = Number(participants.length);
      const totalAttended = Number(participants.filter(p => p.status === 'attended').length);
      const totalConfirmed = Number(participants.filter(p => p.status === 'confirmed').length);
      const totalNoShow = Number(participants.filter(p => p.status === 'no_show').length);
      const feedbackCount = Number(participants.filter(p => p.feedback && p.feedback.trim() !== '').length);
      const avgRating = participants.reduce((sum, p) => sum + (p.rating || 0), 0) / (participants.filter(p => p.rating).length || 1);
      const totalHours = participants.reduce((sum, p) => sum + (Number(p.hours_contributed) || 0), 0);
      const analytics = {
        totalEvents,
        totalRegistrations,
        totalAttended,
        totalConfirmed,
        totalNoShow,
        feedbackCount,
        avgRating: Number(avgRating.toFixed(2)),
        totalVolunteerHours: Number(totalHours.toFixed(2)),
      };
      console.log('DEBUG analytics (aggregate):', JSON.stringify(analytics));
      return { success: true, analytics };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Export analytics for a single event as CSV
   * @param {string|number} eventId
   * @returns {Promise<{success: boolean, csv?: string, error?: string}>}
   */
  async getEventAnalyticsCSV(eventId) {
    const result = await this.getEventAnalytics(eventId);
    if (!result.success) return result;
    try {
      const parser = new Parser();
      const csv = parser.parse([convertBigIntToString(result.analytics)]);
      return { success: true, csv };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Export aggregate analytics for all events as CSV
   * @returns {Promise<{success: boolean, csv?: string, error?: string}>}
   */
  async getAggregateEventAnalyticsCSV() {
    const result = await this.getAggregateEventAnalytics();
    if (!result.success) return result;
    try {
      const parser = new Parser();
      const csv = parser.parse([convertBigIntToString(result.analytics)]);
      return { success: true, csv };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get events for public calendar view (optionally filter by date/category)
   * @param {Object} filters
   * @returns {Promise<Object>}
   */
  async getCalendarEvents(filters = {}) {
    try {
      // Only allow known filters
      const allowedFilters = ['category', 'start_date', 'end_date', 'language'];
      const safeFilters = {};
      for (const key of allowedFilters) {
        if (filters[key]) safeFilters[key] = filters[key];
      }
      const where = { deleted_at: null };
      if (safeFilters.category) where.category = safeFilters.category;
      if (safeFilters.start_date) where.event_date = { gte: new Date(safeFilters.start_date) };
      if (safeFilters.end_date) {
        where.event_date = where.event_date || {};
        where.event_date.lte = new Date(safeFilters.end_date);
      }
      if (safeFilters.language) where.language = safeFilters.language;
      const events = await prisma.events.findMany({
        where,
        orderBy: { event_date: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          event_date: true,
          event_time: true,
          location: true,
          category: true,
          is_featured: true,
          status: true,
          language: true,
          translation_group_id: true,
        }
      });
      return { success: true, events };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get featured events
   * @returns {Promise<Object>}
   */
  async getFeaturedEvents() {
    try {
      const events = await prisma.events.findMany({
        where: { is_featured: true, deleted_at: null },
        orderBy: { event_date: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          event_date: true,
          event_time: true,
          location: true,
          category: true,
          is_featured: true,
          status: true,
          language: true,
          translation_group_id: true,
        }
      });
      return { success: true, events };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all translations for an event (by translation_group_id)
   * @param {string|number} eventId
   * @returns {Promise<Object>}
   */
  async getEventTranslations(eventId) {
    try {
      const event = await prisma.events.findUnique({ where: { id: BigInt(eventId) } });
      if (!event || !event.translation_group_id) return { success: false, error: 'Event or translation group not found' };
      const translations = await prisma.events.findMany({
        where: { translation_group_id: event.translation_group_id, deleted_at: null },
        orderBy: { language: 'asc' },
      });
      return { success: true, translations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add a new translation for an event (new language in translation group)
   * @param {string|number} eventId
   * @param {Object} data
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async addEventTranslation(eventId, data, user) {
    try {
      const event = await prisma.events.findUnique({ where: { id: BigInt(eventId) } });
      if (!event || !event.translation_group_id) return { success: false, error: 'Event or translation group not found' };
      // Only admin/editor can add
      if (!user || !['admin', 'editor'].includes(user.role)) return { success: false, error: 'Insufficient permissions' };
      // Prevent duplicate language
      const exists = await prisma.events.findFirst({ where: { translation_group_id: event.translation_group_id, language: data.language, deleted_at: null } });
      if (exists) return { success: false, error: 'Translation for this language already exists' };
      const newTranslation = await prisma.events.create({
        data: {
          ...data,
          translation_group_id: event.translation_group_id,
          created_by: user.id,
          created_at: new Date(),
          updated_at: new Date(),
        }
      });
      return { success: true, translation: newTranslation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update an existing translation for an event (by language in translation group)
   * @param {string|number} eventId
   * @param {string} language
   * @param {Object} data
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async updateEventTranslation(eventId, language, data, user) {
    try {
      const event = await prisma.events.findUnique({ where: { id: BigInt(eventId) } });
      if (!event || !event.translation_group_id) return { success: false, error: 'Event or translation group not found' };
      // Only admin/editor can update
      if (!user || !['admin', 'editor'].includes(user.role)) return { success: false, error: 'Insufficient permissions' };
      const translation = await prisma.events.findFirst({ where: { translation_group_id: event.translation_group_id, language, deleted_at: null } });
      if (!translation) return { success: false, error: 'Translation not found for this language' };
      const updated = await prisma.events.update({
        where: { id: translation.id },
        data: { ...data, updated_at: new Date() },
      });
      return { success: true, translation: updated };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Allow a user to unregister themselves from an event
   * @param {string|number} eventId
   * @param {Object} user
   * @returns {Promise<Object>}
   */
  async unregisterFromEvent(eventId, user) {
    try {
      if (!user) return { success: false, error: 'Authentication required' };
      const event = await prisma.events.findUnique({ where: { id: BigInt(eventId) } });
      if (!event || event.deleted_at) return { success: false, error: 'Event not found' };
      const participant = await prisma.event_participants.findUnique({ where: { event_id_user_id: { event_id: BigInt(eventId), user_id: BigInt(user.id) } } });
      if (!participant) return { success: false, error: 'You are not registered for this event' };
      await prisma.event_participants.delete({ where: { event_id_user_id: { event_id: BigInt(eventId), user_id: BigInt(user.id) } } });
      await prisma.events.update({ where: { id: BigInt(eventId) }, data: { registered_count: { decrement: 1 } } });
      return { success: true, message: 'Successfully unregistered from event' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Search events with advanced filtering
   * @param {Object} searchCriteria - Search criteria
   * @param {Object} pagination - Pagination options
   * @param {string} lang - Language preference
   * @returns {Object} - Search results
   */
  async searchEvents(searchCriteria, pagination = {}, lang = 'en') {
    try {
      const {
        query,
        status,
        event_type,
        location,
        is_featured,
        is_recurring,
        requires_registration,
        has_capacity_limit,
        min_capacity,
        max_capacity,
        min_registered,
        max_registered,
        start_date_after,
        start_date_before,
        end_date_after,
        end_date_before,
        created_after,
        created_before,
        updated_after,
        updated_before
      } = searchCriteria;

      const {
        page = 1,
        limit = 10,
        sortBy = 'event_date',
        sortOrder = 'asc'
      } = pagination;

      // Build where clause
      const where = {
        deleted_at: null
      };

      if (lang) {
        where.language = lang;
      }

      if (query) {
        where.OR = [
          { title: { contains: query } },
          { description: { contains: query } },
          { location: { contains: query } },
          { category: { contains: query } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (event_type) {
        where.category = event_type;
      }

      if (location) {
        where.location = { contains: location };
      }

      if (is_featured !== undefined) {
        where.is_featured = is_featured;
      }

      if (is_recurring !== undefined) {
        where.is_recurring = is_recurring;
      }

      if (requires_registration !== undefined) {
        where.requires_registration = requires_registration;
      }

      if (has_capacity_limit !== undefined) {
        if (has_capacity_limit) {
          where.capacity = { not: null };
        } else {
          where.capacity = null;
        }
      }

      if (min_capacity !== undefined) {
        where.capacity = {
          ...where.capacity,
          gte: parseInt(min_capacity)
        };
      }

      if (max_capacity !== undefined) {
        where.capacity = {
          ...where.capacity,
          lte: parseInt(max_capacity)
        };
      }

      if (min_registered !== undefined) {
        where.registered_count = {
          ...where.registered_count,
          gte: parseInt(min_registered)
        };
      }

      if (max_registered !== undefined) {
        where.registered_count = {
          ...where.registered_count,
          lte: parseInt(max_registered)
        };
      }

      if (start_date_after) {
        where.event_date = {
          ...where.event_date,
          gte: new Date(start_date_after)
        };
      }

      if (start_date_before) {
        where.event_date = {
          ...where.event_date,
          lte: new Date(start_date_before)
        };
      }

      if (end_date_after) {
        where.event_date = {
          ...where.event_date,
          gte: new Date(end_date_after)
        };
      }

      if (end_date_before) {
        where.event_date = {
          ...where.event_date,
          lte: new Date(end_date_before)
        };
      }

      if (created_after) {
        where.created_at = {
          ...where.created_at,
          gte: new Date(created_after)
        };
      }

      if (created_before) {
        where.created_at = {
          ...where.created_at,
          lte: new Date(created_before)
        };
      }

      if (updated_after) {
        where.updated_at = {
          ...where.updated_at,
          gte: new Date(updated_after)
        };
      }

      if (updated_before) {
        where.updated_at = {
          ...where.updated_at,
          lte: new Date(updated_before)
        };
      }

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Search events with pagination
      const [events, totalCount] = await Promise.all([
        prisma.events.findMany({
          where,
          include: {
            event_participants: {
              select: {
                user_id: true,
                status: true,
                role: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        prisma.events.count({ where })
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      return {
        success: true,
        events: events.map(convertBigIntToString),
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
      console.error('Error searching events:', error);
      return {
        success: false,
        error: 'Failed to search events',
        code: 'EVENT_SEARCH_ERROR'
      };
    }
  }
}

module.exports = new EventService();