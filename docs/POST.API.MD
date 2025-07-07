# Post API Documentation

## Overview

The Post API allows you to create, retrieve, update, delete, search, and interact with posts (such as blog articles, news, etc.). It supports advanced querying, filtering, pagination, likes, views, and related post discovery. Authentication is required for creating, updating, and deleting posts, while most read operations are public.

---

## Authentication

- **JWT Bearer Token** is required for protected endpoints (create, update, delete).
- Pass the token in the `Authorization: Bearer <token>` header.

---

## Endpoints

### Get All Posts

- **GET** `/api/posts`
- **Query Params:** `page`, `limit`, `post_type`, `language`
- **Description:** Returns paginated list of posts.

### Get Post by ID

- **GET** `/api/posts/id/:id`
- **Description:** Returns a single post by its ID.

### Get Post by Slug

- **GET** `/api/posts/slug/:slug`
- **Description:** Returns a single post by its slug.

### Search Posts

- **GET** `/api/posts/search?q=...`
- **Description:** Full-text search on posts.

### Advanced Query

- **GET** `/api/posts/query?[filters]`
- **Description:** Query posts with advanced filters (see below).

### Create Post

- **POST** `/api/posts`
- **Auth:** Required
- **Body:** `title`, `slug`, `content`, `post_type`, `language`, `tags`, `is_featured`, `feature_image` (file)
- **Description:** Create a new post. Supports image upload.

### Update Post

- **PUT** `/api/posts/:id`
- **Auth:** Required (owner or admin)
- **Body:** Any updatable fields
- **Description:** Update an existing post.

### Delete Post

- **DELETE** `/api/posts/:id`
- **Auth:** Required (admin)
- **Description:** Delete a post.

### Like/Unlike Post

- **POST** `/api/posts/id/:id/like`
- **Auth:** Optional
- **Description:** Toggle like status for a post.

### Increment Post View

- **POST** `/api/posts/id/:id/view`
- **Description:** Increment the view count for a post.

### Get Featured Posts

- **GET** `/api/posts/featured/all`
- **Description:** Get all featured posts.

### Get Posts by Author

- **GET** `/api/posts/author/:user_id`
- **Description:** Get all posts by a specific author.

### Get Posts by Tag

- **GET** `/api/posts/tag/:tag`
- **Description:** Get all posts with a specific tag.

### Get Posts by Type

- **GET** `/api/posts/type/:type`
- **Description:** Get all posts of a specific type (e.g., blog, news).

### Get Related Posts

- **GET** `/api/posts/id/:id/related`
- **Description:** Get posts related to a given post (by tags).

---

## Advanced Query Parameters

- `page`, `limit`: Pagination
- `post_type`, `language`, `title_search`, `content_search`, `slug_search`
- `created_after`, `created_before`, `updated_after`, `updated_before`
- `author_id`, `author_name`, `sort_by`, `sort_order`
- `has_image`, `content_length_min`, `content_length_max`
- `post_types`, `languages`, `author_ids` (comma-separated)

---

## Request/Response Examples

### Create Post

```http
POST /api/posts
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "title": "My First Post",
  "slug": "my-first-post",
  "content": "This is the content...",
  "post_type": "blog",
  "language": "en",
  "tags": "news,update",
  "is_featured": true,
  "feature_image": <file>
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* post object */
  },
  "message": "Post created successfully"
}
```

### Get Posts (Paginated)

```http
GET /api/posts?page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": [ /* array of posts */ ],
  "pagination": { "page": 1, "limit": 10, ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["Title is required"]
}
```

---

## Best Practices

- Always validate input data.
- Use pagination for large result sets.
- Use advanced query for flexible filtering.
- Only admins can delete posts.
- Use JWT authentication for protected actions.
- Handle errors gracefully and check for error messages in the response.

---

## Features

- Full CRUD for posts
- Advanced search and filtering
- Pagination and sorting
- Likes and views tracking
- Tag and type filtering
- Related post discovery
- Image upload support
- Role-based access control
