# FAQ API Documentation

## Overview

The FAQ API provides endpoints to manage Frequently Asked Questions for the GIV Society backend. It supports full CRUD operations, search, category filtering, sorting, visibility toggling, and fetching recent FAQs.

**Base Path:** `/api/v1/faqs`

---

## FAQ Model Schema

| Field                | Type    | Required | Description                                      |
| -------------------- | ------- | -------- | ------------------------------------------------ |
| id                   | string  | Yes      | Unique FAQ ID (auto-generated, bigint as string) |
| question             | string  | Yes      | The FAQ question (10-1000 chars)                 |
| answer               | string  | Yes      | The FAQ answer (20-5000 chars)                   |
| category             | string  | No       | Category name (max 50 chars)                     |
| language             | enum    | No       | 'en' or 'am' (default: 'en')                     |
| translation_group_id | string  | No       | Translation group UUID                           |
| is_active            | boolean | No       | FAQ visibility (default: true)                   |
| sort_order           | integer | No       | Custom sort order (default: 0)                   |
| created_at           | string  | Yes      | ISO timestamp                                    |
| updated_at           | string  | Yes      | ISO timestamp                                    |

---

## Endpoints

### 1. Create FAQ

- **POST** `/api/v1/faqs`
- **Description:** Create a new FAQ entry.
- **Request Body (JSON):**
  ```json
  {
    "question": "What is GIV Society?",
    "answer": "GIV Society is a non-profit...",
    "category": "General",
    "language": "en",
    "is_active": true,
    "sort_order": 1
  }
  ```
- **Required Fields:** `question`, `answer`
- **Response (201):**
  ```json
  {
    "success": true,
    "data": {
      /* FAQ object */
    },
    "message": "FAQ created successfully"
  }
  ```
- **Error (400):**
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "errors": ["question is required", ...]
  }
  ```

---

### 2. Get All FAQs

- **GET** `/api/v1/faqs`
- **Description:** List FAQs with optional filters and pagination.
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 10)
  - `category` (string, optional)
  - `language` (enum: 'en', 'am', optional)
  - `is_active` (boolean, optional)
  - `sort_by` (string, default: 'sort_order')
  - `sort_order` (string: 'asc'|'desc', default: 'asc')
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      /* FAQ objects */
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "limit": 10,
      "pages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
  ```

---

### 3. Get FAQ by ID

- **GET** `/api/v1/faqs/id/:id`
- **Description:** Retrieve a single FAQ by its ID.
- **Path Parameter:**
  - `id` (string, required)
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      /* FAQ object */
    }
  }
  ```
- **Error (404):**
  ```json
  {
    "success": false,
    "error": "FAQ not found",
    "details": "The requested FAQ does not exist"
  }
  ```

---

### 4. Update FAQ

- **PUT** `/api/v1/faqs/:id`
- **Description:** Update an existing FAQ. Only provided fields will be updated.
- **Path Parameter:**
  - `id` (string, required)
- **Request Body (JSON):**
  ```json
  {
    "question": "Updated question?",
    "answer": "Updated answer.",
    "category": "General",
    "language": "am",
    "is_active": false,
    "sort_order": 2
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      /* updated FAQ object */
    },
    "message": "FAQ updated successfully"
  }
  ```
- **Error (400):**
  ```json
  {
    "success": false,
    "error": "Validation failed",
    "errors": ["question must be at least 10 characters"]
  }
  ```

---

### 5. Delete FAQ

- **DELETE** `/api/v1/faqs/:id`
- **Description:** Delete a FAQ by ID.
- **Path Parameter:**
  - `id` (string, required)
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "FAQ deleted successfully"
  }
  ```
- **Error (404):**
  ```json
  {
    "success": false,
    "error": "FAQ not found",
    "details": "The FAQ you're trying to delete doesn't exist"
  }
  ```

---

### 6. Search FAQs

- **GET** `/api/v1/faqs/search`
- **Description:** Search FAQs by question, answer, or category.
- **Query Parameters:**
  - `q` (string, required)
  - `page`, `limit`, `category`, `language`, `is_active` (optional, as above)
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [ /* matching FAQ objects */ ],
    "pagination": { ... },
    "query": "search term"
  }
  ```
- **Error (400):**
  ```json
  {
    "success": false,
    "error": "Search query required",
    "details": "Please provide a search term"
  }
  ```

---

### 7. Get FAQs by Category

- **GET** `/api/v1/faqs/category/:category`
- **Description:** List FAQs in a specific category.
- **Path Parameter:**
  - `category` (string, required)
- **Query Parameters:**
  - `page`, `limit`, `language`, `is_active`, `sort_by`, `sort_order` (optional)
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [ /* FAQ objects */ ],
    "pagination": { ... },
    "category": "General"
  }
  ```
- **Error (400):**
  ```json
  {
    "success": false,
    "error": "Category required",
    "details": "Please provide a category name"
  }
  ```

---

### 8. Get FAQ Categories

- **GET** `/api/v1/faqs/categories`
- **Description:** List all unique FAQ categories.
- **Response (200):**
  ```json
  {
    "success": true,
    "data": ["General", "Donations", ...],
    "count": 2
  }
  ```

---

### 9. Bulk Update FAQ Sort Order

- **PUT** `/api/v1/faqs/sort/bulk`
- **Description:** Bulk update the sort order of multiple FAQs.
- **Request Body (JSON):**
  ```json
  {
    "sortData": [
      { "id": 1, "sort_order": 2 },
      { "id": 2, "sort_order": 1 }
    ]
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "FAQ sort order updated successfully",
    "updated": 2
  }
  ```
- **Error (400):**
  ```json
  {
    "success": false,
    "error": "Invalid sort data structure",
    "details": "Each item must have 'id' and 'sort_order' properties"
  }
  ```

---

### 10. Toggle FAQ Visibility

- **PATCH** `/api/v1/faqs/:id/toggle-visibility`
- **Description:** Toggle the `is_active` state of a FAQ (active/inactive).
- **Path Parameter:**
  - `id` (string, required)
- **Response (200):**
  ```json
  {
    "success": true,
    "data": {
      /* updated FAQ object */
    },
    "message": "FAQ is now inactive"
  }
  ```
- **Error (404):**
  ```json
  {
    "success": false,
    "error": "FAQ not found"
  }
  ```

---

### 11. Get Recent FAQs

- **GET** `/api/v1/faqs/recent?limit=5`
- **Description:** Get the most recent FAQs, with optional `limit` (default 5, max 50).
- **Query Parameters:**
  - `limit` (integer, optional, default: 5, max: 50)
- **Response (200):**
  ```json
  {
    "success": true,
    "data": [
      /* recent FAQ objects */
    ],
    "count": 5
  }
  ```

---

## Error Handling

- All errors return JSON with `success: false`, an `error` message, and optionally `details` or `errors` array.
- Validation errors return 400. Not found returns 404. Server errors return 500.

---

## Notes

- All endpoints are public by default (no authentication required).
- Pagination is supported on list/search endpoints via `page` and `limit`.
- Sorting is supported via `sort_by` and `sort_order` where applicable.
- The `id` field is a stringified bigint for compatibility.
- The `language` field supports 'en' and 'am'.
- The `is_active` field controls FAQ visibility.
- The `sort_order` field can be used to customize FAQ display order.

---

## Example: FAQ Object

```json
{
  "id": "1",
  "question": "What is GIV Society?",
  "answer": "GIV Society is a non-profit...",
  "category": "General",
  "language": "en",
  "translation_group_id": "uuid-1234",
  "is_active": true,
  "sort_order": 1,
  "created_at": "2024-06-30T12:00:00.000Z",
  "updated_at": "2024-06-30T12:00:00.000Z"
}
```
