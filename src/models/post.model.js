const prisma = require("../config/prisma");

/**
 * Helper function to serialize post data
 * @param {Object} post - Post object from Prisma
 * @returns {Object} - Serialized post object
 */
const serializePost = (post) => {
  if (!post) return null;

  // Only include safe user data
  const safeUserData = post.users
    ? {
        id: post.users.id.toString(),
        full_name: post.users.full_name,
        profile_image_url: post.users.profile_image_url,
        role: post.users.role,
      }
    : null;

  return {
    ...post,
    id: post.id.toString(),
    author_id: post.author_id ? post.author_id.toString() : null,
    users: safeUserData,
  };
};

class Post {
  static async create(postData) {
    // Convert author_id to BigInt if it exists
    if (postData.author_id) {
      postData.author_id = BigInt(postData.author_id);
    }

    const post = await prisma.posts.create({
      data: postData,
      include: {
        users: true, // Include author information
      },
    });

    return serializePost(post);
  }

  static async findById(id) {
    const post = await prisma.posts.findUnique({
      where: { id: BigInt(id) },
      include: {
        users: true,
      },
    });

    return serializePost(post);
  }

  static async findBySlug(slug) {
    const post = await prisma.posts.findUnique({
      where: { slug },
      include: {
        users: true,
      },
    });

    return serializePost(post);
  }

  static async findAll(options = {}) {
    const { page = 1, limit = 10, post_type, language } = options;

    const where = {};
    if (post_type) where.post_type = post_type;
    if (language) where.language = language;

    const [posts, total] = await Promise.all([
      prisma.posts.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          users: true,
        },
        orderBy: {
          created_at: "desc",
        },
      }),
      prisma.posts.count({ where }),
    ]);

    return {
      posts: posts.map(serializePost),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async update(id, postData) {
    try {
      // Convert author_id to BigInt if it exists
      if (postData.author_id) {
        postData.author_id = BigInt(postData.author_id);
      }

      // Check if post exists before updating
      const existingPost = await prisma.posts.findUnique({
        where: { id: BigInt(id) },
      });

      if (!existingPost) {
        throw new Error(`Post with ID ${id} not found`);
      }

      const post = await prisma.posts.update({
        where: { id: BigInt(id) },
        data: postData,
        include: {
          users: true,
        },
      });

      return serializePost(post);
    } catch (error) {
      // Re-throw the error with more context
      if (error.code === "P2025") {
        throw new Error(`Post with ID ${id} not found`);
      }

      if (error.code === "P2002") {
        throw new Error("A post with this slug already exists");
      }

      throw error;
    }
  }

  static async delete(id) {
    return prisma.posts.delete({
      where: { id: BigInt(id) },
    });
  }

  static async search(query) {
    const posts = await prisma.posts.findMany({
      where: {
        OR: [{ title: { contains: query } }, { content: { contains: query } }],
      },
      include: {
        users: true,
      },
    });

    return posts.map(serializePost);
  }
}

module.exports = Post;
