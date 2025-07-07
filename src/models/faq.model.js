const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger.util");

const prisma = new PrismaClient();

class FAQ {
  /**
   * Serialize FAQ data for API response
   * @param {Object} faq - FAQ object from database
   * @returns {Object} Serialized FAQ
   */
  static serializeFAQ(faq) {
    return {
      id: faq.id.toString(),
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      language: faq.language,
      translation_group_id: faq.translation_group_id,
      is_active: faq.is_active,
      sort_order: faq.sort_order,
      created_at: faq.created_at,
      updated_at: faq.updated_at,
    };
  }

  /**
   * Create a new FAQ
   * @param {Object} data - FAQ data
   * @returns {Object} Created FAQ
   */
  static async create(data) {
    try {
      const faq = await prisma.faqs.create({
        data: {
          question: data.question,
          answer: data.answer,
          category: data.category,
          language: data.language || "en",
          translation_group_id: data.translation_group_id,
          is_active: data.is_active !== undefined ? data.is_active : true,
          sort_order: data.sort_order || 0,
        },
      });

      return this.serializeFAQ(faq);
    } catch (error) {
      logger.error("Error creating FAQ:", error);
      throw error;
    }
  }

  /**
   * Get all FAQs with optional filters
   * @param {Object} options - Query options
   * @returns {Array} Array of FAQs
   */
  static async getAll(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        language,
        is_active,
        sort_by = "sort_order",
        sort_order = "asc",
      } = options;

      const where = {};

      if (category) where.category = category;
      if (language) where.language = language;
      if (is_active !== undefined) where.is_active = is_active;

      const [faqs, total] = await Promise.all([
        prisma.faqs.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sort_by]: sort_order },
        }),
        prisma.faqs.count({ where }),
      ]);

      return {
        faqs: faqs.map(this.serializeFAQ),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting FAQs:", error);
      throw error;
    }
  }

  /**
   * Get FAQ by ID
   * @param {string|number} id - FAQ ID
   * @returns {Object} FAQ object
   */
  static async getById(id) {
    try {
      const faq = await prisma.faqs.findUnique({
        where: { id: BigInt(id) },
      });

      if (!faq) {
        throw new Error("FAQ not found");
      }

      return this.serializeFAQ(faq);
    } catch (error) {
      logger.error("Error getting FAQ by ID:", error);
      throw error;
    }
  }

  /**
   * Update FAQ
   * @param {string|number} id - FAQ ID
   * @param {Object} data - Update data
   * @returns {Object} Updated FAQ
   */
  static async update(id, data) {
    try {
      const updateData = {};

      if (data.question !== undefined) updateData.question = data.question;
      if (data.answer !== undefined) updateData.answer = data.answer;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.language !== undefined) updateData.language = data.language;
      if (data.translation_group_id !== undefined)
        updateData.translation_group_id = data.translation_group_id;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.sort_order !== undefined)
        updateData.sort_order = data.sort_order;
      if (data.updated_at !== undefined)
        updateData.updated_at = data.updated_at;

      const faq = await prisma.faqs.update({
        where: { id: BigInt(id) },
        data: updateData,
      });

      return this.serializeFAQ(faq);
    } catch (error) {
      logger.error("Error updating FAQ:", error);
      throw error;
    }
  }

  /**
   * Delete FAQ
   * @param {string|number} id - FAQ ID
   * @returns {boolean} Success status
   */
  static async delete(id) {
    try {
      await prisma.faqs.delete({
        where: { id: BigInt(id) },
      });

      return true;
    } catch (error) {
      logger.error("Error deleting FAQ:", error);
      throw error;
    }
  }

  /**
   * Search FAQs
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Array of matching FAQs
   */
  static async search(query, options = {}) {
    try {
      const { page = 1, limit = 10, category, language, is_active } = options;

      const where = {
        OR: [
          { question: { contains: query } },
          { answer: { contains: query } },
          { category: { contains: query } },
        ],
      };

      if (category) where.category = category;
      if (language) where.language = language;
      if (is_active !== undefined) where.is_active = is_active;

      const [faqs, total] = await Promise.all([
        prisma.faqs.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { sort_order: "asc" },
        }),
        prisma.faqs.count({ where }),
      ]);

      return {
        faqs: faqs.map(this.serializeFAQ),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error searching FAQs:", error);
      throw error;
    }
  }

  /**
   * Get FAQs by category
   * @param {string} category - Category name
   * @param {Object} options - Query options
   * @returns {Array} Array of FAQs in category
   */
  static async getByCategory(category, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        language,
        is_active = true,
        sort_by = "sort_order",
        sort_order = "asc",
      } = options;

      const where = { category };

      if (language) where.language = language;
      if (is_active !== undefined) where.is_active = is_active;

      const [faqs, total] = await Promise.all([
        prisma.faqs.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { [sort_by]: sort_order },
        }),
        prisma.faqs.count({ where }),
      ]);

      return {
        faqs: faqs.map(this.serializeFAQ),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      logger.error("Error getting FAQs by category:", error);
      throw error;
    }
  }

  /**
   * Get all categories
   * @returns {Array} Array of unique categories
   */
  static async getCategories() {
    try {
      const categories = await prisma.faqs.findMany({
        select: { category: true },
        where: {
          category: { not: null },
          is_active: true,
        },
        distinct: ["category"],
        orderBy: { category: "asc" },
      });

      return categories.map((cat) => cat.category);
    } catch (error) {
      logger.error("Error getting FAQ categories:", error);
      throw error;
    }
  }

  /**
   * Bulk update sort order
   * @param {Array} sortData - Array of {id, sort_order}
   * @returns {boolean} Success status
   */
  static async updateSortOrder(sortData) {
    try {
      const updates = sortData.map((item) =>
        prisma.faqs.update({
          where: { id: BigInt(item.id) },
          data: { sort_order: item.sort_order },
        })
      );

      await prisma.$transaction(updates);
      return true;
    } catch (error) {
      logger.error("Error updating FAQ sort order:", error);
      throw error;
    }
  }

  /**
   * Get the most recent FAQs
   * @param {number} limit - Number of FAQs to return (default 5)
   * @returns {Array} Array of recent FAQs
   */
  static async getRecent(limit = 5) {
    try {
      const faqs = await prisma.faqs.findMany({
        orderBy: { created_at: "desc" },
        take: limit,
      });
      return faqs.map(this.serializeFAQ);
    } catch (error) {
      logger.error("Error getting recent FAQs:", error);
      throw error;
    }
  }
}

module.exports = FAQ;
