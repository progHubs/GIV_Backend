# Campaign Management API Endpoints

This document describes the REST API endpoints for managing campaigns in the GIV Society Backend.

---

## Base Path
```
/api/v1/campaigns
```

---

## Endpoints

### 1. List All Campaigns
- **GET** `/api/v1/campaigns`
- **Description:** Retrieve a paginated list of all campaigns.
- **Query Parameters:**
  - `page` (integer, optional): Page number (default: 1)
  - `limit` (integer, optional): Items per page (default: 10)
  - `category` (string, optional): Filter by category
  - `language` (string, optional): Filter by language (`en`, `am`)
  - `is_active` (boolean, optional): Filter by active status
  - `is_featured` (boolean, optional): Filter by featured status
- **Authentication:** Not required
- **Response Example:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Medical Outreach Campaign",
      "slug": "medical-outreach-campaign",
      "description": "A campaign for rural medical outreach.",
      "goal_amount": "50000.00",
      "current_amount": "0.00",
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-12-31T23:59:59.999Z",
      "category": "medical_outreach",
      "progress_bar_color": "#FF5733",
      "image_url": "https://example.com/campaign-image.jpg",
      "language": "en",
      "is_active": true,
      "is_featured": false,
      "progress_percentage": 0,
      "donor_count": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 1,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

### 2. Get Campaign by ID
- **GET** `/api/v1/campaigns/:id`
- **Description:** Retrieve a single campaign by its ID.
- **Authentication:** Not required
- **Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Medical Outreach Campaign",
    "slug": "medical-outreach-campaign",
    "description": "A campaign for rural medical outreach.",
    "goal_amount": "50000.00",
    "current_amount": "0.00",
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-12-31T23:59:59.999Z",
    "category": "medical_outreach",
    "progress_bar_color": "#FF5733",
    "image_url": "https://example.com/campaign-image.jpg",
    "language": "en",
    "is_active": true,
    "is_featured": false,
    "progress_percentage": 0,
    "donor_count": 0
  }
}
```

---

### 3. Search Campaigns
- **GET** `/api/v1/campaigns/search?q=...`
- **Description:** Search campaigns by keyword in title or description.
- **Query Parameters:**
  - `q` (string, required): Search query
- **Authentication:** Not required
- **Response Example:**
```json
{
  "success": true,
  "data": [ ... ],
  "count": 1
}
```

---

### 4. Get Featured Campaigns
- **GET** `/api/v1/campaigns/featured`
- **Description:** Retrieve a list of featured and active campaigns.
- **Query Parameters:**
  - `limit` (integer, optional): Number of campaigns to return (default: 6)
  - `language` (string, optional): Filter by language
- **Authentication:** Not required

---

### 5. Get Active Campaigns
- **GET** `/api/v1/campaigns/active`
- **Description:** Retrieve a list of active campaigns.
- **Query Parameters:**
  - `page` (integer, optional): Page number
  - `limit` (integer, optional): Items per page
  - `category` (string, optional): Filter by category
  - `language` (string, optional): Filter by language
  - `sortBy` (string, optional): Sort field (default: `created_at`)
  - `sortOrder` (string, optional): Sort order (`asc` or `desc`, default: `desc`)
- **Authentication:** Not required

---

### 6. Get Campaign Statistics
- **GET** `/api/v1/campaigns/stats`
- **Description:** Retrieve statistics about campaigns (total, active, featured, sums, etc.).
- **Query Parameters:**
  - `start_date` (string, optional): Filter by creation date (from)
  - `end_date` (string, optional): Filter by creation date (to)
  - `category` (string, optional): Filter by category
- **Authentication:** Not required
- **Response Example:**
```json
{
  "success": true,
  "data": {
    "total_campaigns": 10,
    "active_campaigns": 8,
    "featured_campaigns": 2,
    "total_goal_amount": "500000.00",
    "total_current_amount": "120000.00",
    "overall_progress_percentage": 24,
    "category_breakdown": [
      {
        "category": "medical_outreach",
        "count": 5,
        "goal_amount": "250000.00",
        "current_amount": "60000.00",
        "progress_percentage": 24
      }
    ]
  }
}
```

---

### 7. Create Campaign
- **POST** `/api/v1/campaigns`
- **Description:** Create a new campaign.
- **Authentication:** Required (role: `editor` or `admin`)
- **Request Body Example:**
```json
{
  "title": "Medical Outreach Campaign",
  "description": "A campaign for rural medical outreach.",
  "goal_amount": 50000,
  "start_date": "2025-01-01T00:00:00.000Z",
  "end_date": "2025-12-31T23:59:59.999Z",
  "category": "medical_outreach",
  "progress_bar_color": "#FF5733",
  "image_url": "https://example.com/campaign-image.jpg",
  "language": "en",
  "is_active": true,
  "is_featured": false
}
```
- **Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Medical Outreach Campaign",
    "slug": "medical-outreach-campaign",
    ...
  },
  "message": "Campaign created successfully"
}
```

---

### 8. Update Campaign
- **PUT** `/api/v1/campaigns/:id`
- **Description:** Update an existing campaign.
- **Authentication:** Required (role: `editor` or `admin`)
- **Request Body Example:**
```json
{
  "title": "Updated Medical Outreach Campaign",
  "description": "Updated description.",
  "goal_amount": 75000,
  "is_featured": true
}
```
- **Response Example:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Updated Medical Outreach Campaign",
    ...
  }
}
```

---

### 9. Delete Campaign
- **DELETE** `/api/v1/campaigns/:id`
- **Description:** Delete a campaign (admin only).
- **Authentication:** Required (role: `admin`)
- **Response Example:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

---

## Notes
- All endpoints return JSON responses.
- Authentication is via Bearer JWT in the `Authorization` header for protected routes.
- The `/api/v1/campaigns/:id/donations` endpoint has been removed; use the donation endpoints to fetch campaign donations. 