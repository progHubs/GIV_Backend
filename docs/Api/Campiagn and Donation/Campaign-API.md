# Campaign API Documentation

## Base URL
All campaign endpoints are prefixed with `/api/campaigns`

## Authentication
- **Public Routes**: No authentication required for viewing campaigns
- **Protected Routes**: Require valid JWT token in Authorization header
- **Admin Routes**: Require admin role for campaign management

## Endpoints

### Public Endpoints

#### GET /api/campaigns
Get all campaigns with filtering and pagination support.

**Query Parameters:**
- `search` (string): Search in title, description, or slug
- `category` (string): Filter by campaign category
- `language` (string): Language preference (default: 'en')
- `is_active` (boolean): Filter by active status
- `is_featured` (boolean): Filter by featured status
- `start_date` (date): Filter campaigns starting from this date
- `end_date` (date): Filter campaigns ending before this date
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 50)
- `sortBy` (string): Sort field (default: 'created_at')
- `sortOrder` (string): Sort order 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Clean Water Initiative",
      "slug": "clean-water-initiative",
      "description": "Providing clean water access to rural communities",
      "goal_amount": "50000.00",
      "current_amount": "25000.00",
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "is_active": true,
      "is_featured": true,
      "category": "health",
      "progress_bar_color": "#4CAF50",
      "image_url": "https://example.com/image.jpg",
      "video_url": "https://example.com/video.mp4",
      "donor_count": 150,
      "success_stories": [],
      "language": "en",
      "translation_group_id": "uuid-here",
      "progress_percentage": 50,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "created_by": "1",
      "users": {
        "id": "1",
        "full_name": "Admin User",
        "email": "admin@example.com"
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### GET /api/campaigns/search
Search campaigns with advanced filtering.

**Query Parameters:**
- `q` (string): Search query
- `category` (string): Campaign category
- `language` (string): Language preference
- `page` (integer): Page number
- `limit` (integer): Items per page
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order

**Response:** Same as GET /api/campaigns

#### GET /api/campaigns/featured
Get featured campaigns only.

**Query Parameters:**
- `language` (string): Language preference
- `category` (string): Filter by category
- `page` (integer): Page number
- `limit` (integer): Items per page (default: 12)

**Response:** Same as GET /api/campaigns

#### GET /api/campaigns/active
Get active campaigns only.

**Query Parameters:**
- `language` (string): Language preference
- `category` (string): Filter by category
- `page` (integer): Page number
- `limit` (integer): Items per page (default: 12)

**Response:** Same as GET /api/campaigns

#### GET /api/campaigns/stats
Get campaign statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCampaigns": 25,
    "activeCampaigns": 15,
    "completedCampaigns": 8,
    "featuredCampaigns": 5,
    "totalRaised": "500000.00",
    "totalDonors": 1250,
    "averageDonation": "400.00",
    "categoryBreakdown": {
      "health": 8,
      "education": 6,
      "environment": 5,
      "community": 6
    },
    "monthlyProgress": [
      {
        "month": "2024-01",
        "campaigns": 3,
        "raised": "50000.00"
      }
    ]
  }
}
```

#### GET /api/campaigns/:id
Get campaign by ID.

**Parameters:**
- `id` (integer): Campaign ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Clean Water Initiative",
    "slug": "clean-water-initiative",
    "description": "Providing clean water access to rural communities",
    "goal_amount": "50000.00",
    "current_amount": "25000.00",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "is_active": true,
    "is_featured": true,
    "category": "health",
    "progress_bar_color": "#4CAF50",
    "image_url": "https://example.com/image.jpg",
    "video_url": "https://example.com/video.mp4",
    "donor_count": 150,
    "success_stories": [],
    "language": "en",
    "translation_group_id": "uuid-here",
    "progress_percentage": 50,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "created_by": "1",
    "users": {
      "id": "1",
      "full_name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

#### GET /api/campaigns/:id/translations
Get all translations for a campaign.

**Parameters:**
- `id` (integer): Campaign ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Clean Water Initiative",
      "language": "en",
      "translation_group_id": "uuid-here"
    },
    {
      "id": "2",
      "title": "የንጹህ ውሃ ተነሳሽነት",
      "language": "am",
      "translation_group_id": "uuid-here"
    }
  ]
}
```

### Protected Endpoints (Admin Only)

#### POST /api/campaigns
Create a new campaign.

**Authentication:** Required (Admin)

**Request Body:**
```json
{
  "title": "New Campaign",
  "description": "Campaign description",
  "goal_amount": 50000.00,
  "start_date": "2024-01-01",
  "end_date": "2024-12-31",
  "category": "health",
  "progress_bar_color": "#4CAF50",
  "image_url": "https://example.com/image.jpg",
  "video_url": "https://example.com/video.mp4",
  "language": "en",
  "is_active": true,
  "is_featured": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "26",
    "title": "New Campaign",
    "slug": "new-campaign",
    "description": "Campaign description",
    "goal_amount": "50000.00",
    "current_amount": "0.00",
    "start_date": "2024-01-01",
    "end_date": "2024-12-31",
    "is_active": true,
    "is_featured": false,
    "category": "health",
    "progress_bar_color": "#4CAF50",
    "image_url": "https://example.com/image.jpg",
    "video_url": "https://example.com/video.mp4",
    "donor_count": 0,
    "success_stories": null,
    "language": "en",
    "translation_group_id": "new-uuid-here",
    "progress_percentage": 0,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "created_by": "1"
  },
  "message": "Campaign created successfully"
}
```

#### PUT /api/campaigns/:id
Update an existing campaign.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (integer): Campaign ID

**Request Body:** Same as POST (all fields optional for update)

**Response:** Same as POST

#### DELETE /api/campaigns/:id
Delete a campaign (soft delete).

**Authentication:** Required (Admin)

**Parameters:**
- `id` (integer): Campaign ID

**Response:**
```json
{
  "success": true,
  "message": "Campaign deleted successfully"
}
```

#### POST /api/campaigns/:id/translations
Add translation for a campaign.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (integer): Campaign ID

**Request Body:**
```json
{
  "title": "የንጹህ ውሃ ተነሳሽነት",
  "description": "የገጠር ማህበረሰቦች ንጹህ ውሃ ማግኘት",
  "language": "am"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "27",
    "title": "የንጹህ ውሃ ተነሳሽነት",
    "language": "am",
    "translation_group_id": "uuid-here"
  },
  "message": "Translation added successfully"
}
```

#### PATCH /api/campaigns/:id/translations/:language
Update campaign translation.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (integer): Campaign ID
- `language` (string): Language code

**Request Body:**
```json
{
  "title": "Updated Translation Title",
  "description": "Updated translation description"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "27",
    "title": "Updated Translation Title",
    "language": "am",
    "translation_group_id": "uuid-here"
  },
  "message": "Translation updated successfully"
}
```

## Error Responses

### Common Error Codes
- `CAMPAIGN_NOT_FOUND`: Campaign does not exist
- `VALIDATION_ERROR`: Invalid input data
- `SLUG_EXISTS`: Campaign slug already exists
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Admin access required
- `CAMPAIGN_FETCH_ERROR`: Database error retrieving campaign

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "errors": ["Detailed error messages"] // For validation errors
}
```

## Business Rules

1. **Slug Generation**: Automatically generated from title, must be unique
2. **Translation Groups**: Campaigns with same translation_group_id are translations of each other
3. **Soft Delete**: Campaigns are soft deleted (deleted_at timestamp)
4. **Progress Calculation**: progress_percentage = (current_amount / goal_amount) * 100
5. **Admin Only**: Only admins can create, update, or delete campaigns
6. **Active Campaigns**: Only active campaigns accept donations
7. **Featured Campaigns**: Limited number of campaigns can be featured at once
