# Comment API Documentation

## Overview

The Comment API enables users to create, reply, update, delete, approve, and like comments on posts. It supports threaded comments, soft deletion, moderation, and like toggling. Most endpoints require authentication, while comment retrieval is public.

---

## Authentication

- **JWT Bearer Token** is required for all write operations (create, reply, update, delete, like, approve).
- Pass the token in the `Authorization: Bearer <token>` header.

---

## Endpoints

### Get Comments for a Post

- **GET** `/api/comments/:post_id/comments`
- **Description:** Get all comments for a specific post (threaded structure).

### Create Comment

- **POST** `/api/comments/:post_id/comments`
- **Auth:** Required
- **Body:** `content`
- **Description:** Create a new comment on a post.

### Reply to Comment

- **POST** `/api/comments/:post_id/comments/:parent_id/reply`
- **Auth:** Required
- **Body:** `content`
- **Description:** Reply to an existing comment (threaded).

### Update Comment

- **PUT** `/api/comments/comments/:comment_id`
- **Auth:** Required (owner)
- **Body:** `content`
- **Description:** Update your own comment.

### Delete Comment (Soft Delete)

- **DELETE** `/api/comments/comments/:comment_id`
- **Auth:** Required (owner)
- **Description:** Soft delete your own comment.

### Approve/Reject Comment

- **POST** `/api/comments/comments/:comment_id/approve`
- **Auth:** Required (admin)
- **Body:** `is_approved` (boolean)
- **Description:** Approve or reject a comment (moderation).

### Like/Unlike Comment

- **POST** `/api/comments/comments/:comment_id/like`
- **Auth:** Required
- **Description:** Toggle like status for a comment.

---

## Request/Response Examples

### Create Comment

```http
POST /api/comments/123/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "content": "This is a comment."
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* comment object */
  }
}
```

### Get Comments for a Post

```http
GET /api/comments/123/comments
```

**Response:**

```json
{
  "success": true,
  "data": [
    /* array of comments (threaded) */
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Content is required"
}
```

---

## Best Practices

- Always validate input data.
- Use authentication for all write operations.
- Use soft delete to allow comment recovery.
- Only admins can approve/reject comments.
- Use threaded replies for discussions.
- Handle errors gracefully and check for error messages in the response.

---

## Features

- Threaded (nested) comments
- Soft deletion
- Moderation (approve/reject)
- Like/unlike functionality
- Role-based access control
- Public retrieval of comments
