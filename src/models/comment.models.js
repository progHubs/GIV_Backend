const prisma = require("../config/prisma");

const serializeComment = (comment) => {
  if (!comment) return null;
  return {
    ...comment,
    id: comment.id.toString(),
    post_id: comment.post_id ? comment.post_id.toString() : null,
    user_id: comment.user_id ? comment.user_id.toString() : null,
    parent_id: comment.parent_id ? comment.parent_id.toString() : null,
  };
};

class Comment {
  static async findByPostId(postId) {
    const comments = await prisma.comments.findMany({
      where: { post_id: BigInt(postId), deleted_at: null },
      orderBy: { created_at: "asc" },
    });
    const serialized = comments.map(serializeComment);
    // Build a map of id -> comment
    const map = {};
    serialized.forEach((c) => {
      c.children = [];
      map[c.id] = c;
    });
    const roots = [];
    serialized.forEach((c) => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].children.push(c);
      } else {
        roots.push(c);
      }
    });
    return roots;
  }

  static async create({ postId, userId, content }) {
    const comment = await prisma.comments.create({
      data: {
        post_id: BigInt(postId),
        user_id: BigInt(userId),
        content,
        deleted_at: null,
        is_approved: false,
      },
    });
    return serializeComment(comment);
  }

  static async reply({ postId, parentId, userId, content }) {
    const comment = await prisma.comments.create({
      data: {
        post_id: BigInt(postId),
        parent_id: BigInt(parentId),
        user_id: BigInt(userId),
        content,
        deleted_at: null,
        is_approved: false,
      },
    });
    return serializeComment(comment);
  }

  static async update(commentId, userId, data) {
    const comment = await prisma.comments.findUnique({
      where: { id: BigInt(commentId) },
    });
    if (!comment || comment.user_id.toString() !== userId.toString())
      return null;
    const updated = await prisma.comments.update({
      where: { id: BigInt(commentId) },
      data,
    });
    return serializeComment(updated);
  }

  static async softDelete(commentId, userId) {
    const comment = await prisma.comments.findUnique({
      where: { id: BigInt(commentId) },
    });
    if (!comment || comment.user_id.toString() !== userId.toString())
      return null;
    const deleted = await prisma.comments.update({
      where: { id: BigInt(commentId) },
      data: { deleted_at: new Date() },
    });
    return serializeComment(deleted);
  }

  static async approve(commentId, isApproved) {
    const updated = await prisma.comments.update({
      where: { id: BigInt(commentId) },
      data: { is_approved: isApproved },
    });
    return serializeComment(updated);
  }

  static async toggleLike(commentId) {
    const comment = await prisma.comments.findUnique({
      where: { id: BigInt(commentId) },
    });
    return serializeComment(comment);
  }
}

module.exports = Comment;
