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

  static async query(options = {}) {
    console.log("=== POST QUERY DEBUG START ===");
    console.log("Input options:", JSON.stringify(options, null, 2));

    const {
      page = 1,
      limit = 10,
      post_type,
      language,
      title_search,
      content_search,
      slug_search,
      created_after,
      created_before,
      updated_after,
      updated_before,
      author_id,
      author_name,
      sort_by = "created_at",
      sort_order = "desc",
      has_image,
      content_length_min,
      content_length_max,
      post_types,
      languages,
      author_ids,
    } = options;

    console.log("Parsed options:", {
      page,
      limit,
      post_type,
      language,
      title_search,
      content_search,
      slug_search,
      created_after,
      created_before,
      updated_after,
      updated_before,
      author_id,
      author_name,
      sort_by,
      sort_order,
      has_image,
      content_length_min,
      content_length_max,
      post_types,
      languages,
      author_ids,
    });

    // Build where conditions
    const where = {};
    console.log("Initial where object:", where);

    // Basic filters
    if (post_type) {
      where.post_type = post_type;
      console.log("Added post_type filter:", post_type);
    }
    if (language) {
      where.language = language;
      console.log("Added language filter:", language);
    }
    if (author_id) {
      where.author_id = BigInt(author_id);
      console.log("Added author_id filter:", author_id);
    }

    // Multiple value filters
    if (post_types && post_types.length > 0) {
      where.post_type = { in: post_types };
      console.log("Added post_types filter:", post_types);
    }
    if (languages && languages.length > 0) {
      where.language = { in: languages };
      console.log("Added languages filter:", languages);
    }
    if (author_ids && author_ids.length > 0) {
      where.author_id = { in: author_ids.map((id) => BigInt(id)) };
      console.log("Added author_ids filter:", author_ids);
    }

    // Date filters
    if (created_after || created_before) {
      where.created_at = {};
      if (created_after) {
        where.created_at.gte = new Date(created_after);
        console.log("Added created_after filter:", created_after);
      }
      if (created_before) {
        where.created_at.lte = new Date(created_before);
        console.log("Added created_before filter:", created_before);
      }
    }

    if (updated_after || updated_before) {
      where.updated_at = {};
      if (updated_after) {
        where.updated_at.gte = new Date(updated_after);
        console.log("Added updated_after filter:", updated_after);
      }
      if (updated_before) {
        where.updated_at.lte = new Date(updated_before);
        console.log("Added updated_before filter:", updated_before);
      }
    }

    // Text search filters
    const textConditions = [];
    if (title_search) {
      textConditions.push({ title: { contains: title_search } });
      console.log("Added title_search filter:", title_search);
    }
    if (content_search) {
      textConditions.push({ content: { contains: content_search } });
      console.log("Added content_search filter:", content_search);
    }
    if (slug_search) {
      textConditions.push({ slug: { contains: slug_search } });
      console.log("Added slug_search filter:", slug_search);
    }

    if (textConditions.length > 0) {
      where.OR = textConditions;
      console.log("Added OR conditions for text search:", textConditions);
    }

    // Content length filters
    if (content_length_min || content_length_max) {
      where.content = where.content || {};
      if (content_length_min) {
        where.content.gte = content_length_min;
        console.log("Added content_length_min filter:", content_length_min);
      }
      if (content_length_max) {
        where.content.lte = content_length_max;
        console.log("Added content_length_max filter:", content_length_max);
      }
    }

    // Image filter
    if (has_image !== undefined) {
      if (has_image) {
        where.feature_image = { not: null };
        console.log("Added has_image filter: true (not null)");
      } else {
        where.feature_image = null;
        console.log("Added has_image filter: false (null)");
      }
    }

    console.log("Final where object:", JSON.stringify(where, null, 2));

    // Build include conditions
    const include = {
      users: true,
    };
    console.log("Initial include object:", include);

    // Add author name filter if specified
    if (author_name) {
      include.users = {
        where: {
          full_name: { contains: author_name },
        },
      };

      console.log("Added author_name filter to include:", author_name);
    }

    console.log("Final include object:", JSON.stringify(include, null, 2));

    // Build order by
    const orderBy = {};
    orderBy[sort_by] = sort_order;
    console.log("Order by object:", orderBy);

    console.log("About to execute Prisma queries...");
    console.log("FindMany options:", {
      where,
      skip: (page - 1) * limit,
      take: limit,
      include,
      orderBy,
    });

    // Execute query
    try {
      const [posts, total] = await Promise.all([
        prisma.posts.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include,
          orderBy,
        }),
        prisma.posts.count({ where }),
      ]);

      console.log("Query results:", {
        postsCount: posts.length,
        total,
        firstPost: posts[0] ? { id: posts[0].id, title: posts[0].title } : null,
      });

      const result = {
        posts: posts.map(serializePost),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      };

      console.log("Final result:", {
        postsCount: result.posts.length,
        pagination: result.pagination,
      });
      console.log("=== POST QUERY DEBUG END ===");

      return result;
    } catch (error) {
      console.error("=== POST QUERY ERROR ===");
      console.error("Error details:", error);
      console.error(
        "Where object that caused error:",
        JSON.stringify(where, null, 2)
      );
      console.error(
        "Include object that caused error:",
        JSON.stringify(include, null, 2)
      );
      console.error("=== POST QUERY ERROR END ===");
      throw error;
    }
  }
}

module.exports = Post;
