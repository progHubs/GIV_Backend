# FAQ API Documentation

## Overview

The FAQ API provides endpoints to manage Frequently Asked Questions, including creating, updating, deleting, searching, sorting, toggling visibility, and retrieving FAQs by category or language. Most endpoints are public, but creation, update, and deletion require authentication.

---

## Authentication

- **JWT Bearer Token** is required for protected endpoints (create, update, delete, sort, toggle visibility).
- Pass the token in the `Authorization: Bearer <token>` header.

---

## Endpoints

### Get All FAQs

- **GET** `/api/faqs`
- **Query Params:** `page`, `limit`, `category`, `language`, `is_active`, `sort_by`, `sort_order`
- **Description:** Returns paginated list of FAQs with optional filters.

### Get FAQ by ID

- **GET** `/api/faqs/id/:id`
- **Description:** Returns a single FAQ by its ID.

### Search FAQs

- **GET** `/api/faqs/search?q=...`
- **Description:** Full-text search on FAQs.

### Get FAQs by Category

- **GET** `/api/faqs/category/:category`
- **Query Params:** `page`, `limit`, `language`, `is_active`, `sort_by`, `sort_order`
- **Description:** Get FAQs for a specific category.

### Get All Categories

- **GET** `/api/faqs/categories`
- **Description:** List all FAQ categories.

### Get Recent FAQs

- **GET** `/api/faqs/recent?limit=5`
- **Description:** Get the most recent FAQs (default 5, max 50).

### Create FAQ

- **POST** `/api/faqs`
- **Auth:** Required
- **Body:** `question`, `answer`, `category`, `language`, `is_active`, `sort_order`
- **Description:** Create a new FAQ.

### Update FAQ

- **PUT** `/api/faqs/:id`
- **Auth:** Required
- **Body:** Any updatable fields
- **Description:** Update an existing FAQ.

### Delete FAQ

- **DELETE** `/api/faqs/:id`
- **Auth:** Required
- **Description:** Delete a FAQ.

### Bulk Update Sort Order

- **PUT** `/api/faqs/sort/bulk`
- **Auth:** Required
- **Body:** `sortData` (array of `{id, sort_order}`)
- **Description:** Update sort order for multiple FAQs.

### Toggle FAQ Visibility

- **PATCH** `/api/faqs/:id/toggle-visibility`
- **Auth:** Required
- **Description:** Toggle the `is_active` status of a FAQ.

---

## Request/Response Examples

### Create FAQ

```http
POST /api/faqs
Content-Type: application/json
Authorization: Bearer <token>

{
  "question": "How do I reset my password?",
  "answer": "Click the reset link on the login page.",
  "category": "Account",
  "language": "en",
  "is_active": true,
  "sort_order": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* FAQ object */
  },
  "message": "FAQ created successfully"
}
```

### Get FAQs (Paginated)

```http
GET /api/faqs?page=1&limit=10
```

**Response:**

```json
{
  "success": true,
  "data": [ /* array of FAQs */ ],
  "pagination": { "page": 1, "limit": 10, ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": ["Question is required"]
}
```

---

## Best Practices

- Always validate input data.
- Use pagination for large result sets.
- Use categories and language filters for better organization.
- Only authenticated users can create, update, or delete FAQs.
- Use bulk sort for efficient ordering.
- Handle errors gracefully and check for error messages in the response.

---

## Features

- Full CRUD for FAQs
- Advanced search and filtering
- Pagination and sorting
- Category and language support
- Bulk sort order update
- Visibility toggling
- Role-based access control
