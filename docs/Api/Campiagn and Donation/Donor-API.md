# Donor API Documentation

## Base URL
All donor endpoints are prefixed with `/api/donors`

## Authentication
- **All Routes**: Require valid JWT token in Authorization header
- **Admin Routes**: Require admin role for donor management
- **Self-Access Routes**: Users can access their own donor profile

## Donor Tier System

The system automatically assigns donation tiers based on total donated amount:
- **Bronze**: $1 - $499
- **Silver**: $500 - $1,999
- **Gold**: $2,000 - $9,999
- **Platinum**: $10,000+

## Endpoints

### Admin-Only Endpoints

#### GET /api/donors
Get all donors with filtering and pagination.

**Authentication:** Required (Admin)

**Query Parameters:**
- `search` (string): Search in donor name or email
- `donation_tier` (string): Filter by tier (bronze, silver, gold, platinum)
- `is_recurring_donor` (boolean): Filter by recurring donor status
- `is_anonymous` (boolean): Filter by anonymity preference
- `min_total_donated` (decimal): Minimum total donated amount
- `max_total_donated` (decimal): Maximum total donated amount
- `last_donation_start` (date): Filter donors who donated after this date
- `last_donation_end` (date): Filter donors who donated before this date
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
      "user_id": "456",
      "is_recurring_donor": true,
      "preferred_payment_method": "stripe",
      "total_donated": "1500.00",
      "donation_frequency": "monthly",
      "tax_receipt_email": "john@example.com",
      "is_anonymous": false,
      "last_donation_date": "2024-01-15T10:30:00.000Z",
      "donation_tier": "silver",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "users": {
        "id": "456",
        "full_name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "role": "user",
        "profile_image_url": "https://example.com/profile.jpg",
        "language_preference": "en",
        "email_verified": true
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalItems": 100,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### GET /api/donors/search
Search donors with advanced filtering.

**Authentication:** Required (Admin)

**Query Parameters:**
- `q` (string): Search query (searches in name, email)
- `donation_tier` (string): Filter by tier
- `is_recurring_donor` (boolean): Filter by recurring status
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:** Same as GET /api/donors

#### GET /api/donors/stats
Get donor statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDonors": 1250,
    "activeDonors": 800,
    "recurringDonors": 300,
    "anonymousDonors": 150,
    "totalDonated": "500000.00",
    "averageDonation": "400.00",
    "tierBreakdown": {
      "bronze": 800,
      "silver": 300,
      "gold": 100,
      "platinum": 50
    },
    "monthlyGrowth": [
      {
        "month": "2024-01",
        "newDonors": 50,
        "totalDonated": "25000.00"
      }
    ],
    "topDonors": [
      {
        "user_id": "123",
        "full_name": "Jane Smith",
        "total_donated": "10000.00",
        "donation_tier": "platinum"
      }
    ],
    "retentionRate": 75.5,
    "averageLifetimeValue": "800.00"
  }
}
```

#### GET /api/donors/:id
Get donor by ID.

**Authentication:** Required (Admin or own profile)

**Parameters:**
- `id` (integer): Donor user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "456",
    "is_recurring_donor": true,
    "preferred_payment_method": "stripe",
    "total_donated": "1500.00",
    "donation_frequency": "monthly",
    "tax_receipt_email": "john@example.com",
    "is_anonymous": false,
    "last_donation_date": "2024-01-15T10:30:00.000Z",
    "donation_tier": "silver",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "users": {
      "id": "456",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "profile_image_url": "https://example.com/profile.jpg",
      "language_preference": "en",
      "email_verified": true
    }
  }
}
```

#### PUT /api/donors/:id/tier
Update donor tier (admin override).

**Authentication:** Required (Admin)

**Parameters:**
- `id` (integer): Donor user ID

**Request Body:**
```json
{
  "donation_tier": "gold"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "456",
    "donation_tier": "gold",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Donor tier updated successfully"
}
```

### User-Accessible Endpoints

#### GET /api/donors/me
Get current user's donor profile.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "456",
    "is_recurring_donor": true,
    "preferred_payment_method": "stripe",
    "total_donated": "1500.00",
    "donation_frequency": "monthly",
    "tax_receipt_email": "john@example.com",
    "is_anonymous": false,
    "last_donation_date": "2024-01-15T10:30:00.000Z",
    "donation_tier": "silver",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "users": {
      "id": "456",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "profile_image_url": "https://example.com/profile.jpg",
      "language_preference": "en",
      "email_verified": true
    }
  }
}
```

**Error Response (No Profile):**
```json
{
  "success": false,
  "error": "You do not have a donor profile",
  "code": "NO_DONOR_PROFILE"
}
```

#### POST /api/donors
Create donor profile for current user.

**Authentication:** Required

**Request Body:**
```json
{
  "is_recurring_donor": true,
  "preferred_payment_method": "stripe",
  "donation_frequency": "monthly",
  "tax_receipt_email": "john@example.com",
  "is_anonymous": false
}
```

**Field Descriptions:**
- `is_recurring_donor` (boolean, optional): Whether user prefers recurring donations
- `preferred_payment_method` (string, optional): Preferred payment method
- `donation_frequency` (string, optional): One of "monthly", "quarterly", "yearly"
- `tax_receipt_email` (string, optional): Email for tax receipts (defaults to user email)
- `is_anonymous` (boolean, optional): Whether to make donations anonymous by default

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "456",
    "is_recurring_donor": true,
    "preferred_payment_method": "stripe",
    "total_donated": "0.00",
    "donation_frequency": "monthly",
    "tax_receipt_email": "john@example.com",
    "is_anonymous": false,
    "last_donation_date": null,
    "donation_tier": null,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "users": {
      "id": "456",
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "role": "user",
      "profile_image_url": "https://example.com/profile.jpg",
      "language_preference": "en",
      "email_verified": true
    }
  },
  "message": "Donor profile created successfully"
}
```

#### PUT /api/donors/me
Update current user's donor profile.

**Authentication:** Required

**Request Body:** Same as POST (all fields optional)

**Response:** Same as POST

#### GET /api/donors/me/donations
Get current user's donation history.

**Authentication:** Required

**Query Parameters:**
- `campaign_id` (integer): Filter by campaign
- `donation_type` (string): Filter by donation type
- `payment_status` (string): Filter by payment status
- `start_date` (date): Filter donations from this date
- `end_date` (date): Filter donations until this date
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "campaign_id": "1",
      "amount": "100.00",
      "currency": "USD",
      "donation_type": "one_time",
      "payment_method": "stripe",
      "payment_status": "completed",
      "transaction_id": "txn_1234567890",
      "receipt_url": "https://stripe.com/receipt/123",
      "is_acknowledged": false,
      "is_tax_deductible": true,
      "is_anonymous": false,
      "notes": "Happy to support this cause",
      "donated_at": "2024-01-01T12:00:00.000Z",
      "campaigns": {
        "id": "1",
        "title": "Clean Water Initiative",
        "slug": "clean-water-initiative"
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

#### GET /api/donors/:id/donations
Get donor's donation history.

**Authentication:** Required (Admin or own profile)

**Parameters:**
- `id` (integer): Donor user ID

**Query Parameters:** Same as GET /api/donors/me/donations

**Response:** Same as GET /api/donors/me/donations

#### GET /api/donors/:id/tax-receipt/:year
Generate tax receipt for a specific year.

**Authentication:** Required (Admin or own profile)

**Parameters:**
- `id` (integer): Donor user ID
- `year` (integer): Tax year (e.g., 2024)

**Response:**
```json
{
  "success": true,
  "data": {
    "donor": {
      "user_id": "456",
      "full_name": "John Doe",
      "email": "john@example.com",
      "tax_receipt_email": "john@example.com"
    },
    "year": 2024,
    "totalDonated": "1500.00",
    "taxDeductibleAmount": "1500.00",
    "donations": [
      {
        "id": "123",
        "campaign_title": "Clean Water Initiative",
        "amount": "100.00",
        "donated_at": "2024-01-01T12:00:00.000Z",
        "transaction_id": "txn_1234567890",
        "is_tax_deductible": true
      }
    ],
    "receiptNumber": "TR-2024-456-001",
    "generatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

#### DELETE /api/donors/me
Delete current user's donor profile.

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Donor profile deleted and is_donor flag unset."
}
```

#### DELETE /api/donors/:id
Delete donor profile by ID.

**Authentication:** Required (Admin or own profile)

**Parameters:**
- `id` (integer): Donor user ID

**Response:**
```json
{
  "success": true,
  "message": "Donor profile deleted and is_donor flag unset."
}
```

## Automatic Donor Profile Creation

When a user makes their first authenticated donation, the system automatically:

1. Sets the user's `is_donor` flag to `true`
2. Creates a basic donor profile with default values:
   ```json
   {
     "user_id": userId,
     "is_recurring_donor": false,
     "is_anonymous": false,
     "total_donated": "0.00"
   }
   ```
3. Updates the profile with donation statistics after successful payment

## Error Responses

### Common Error Codes
- `DONOR_NOT_FOUND`: Donor profile does not exist
- `NO_DONOR_PROFILE`: User doesn't have a donor profile
- `PROFILE_EXISTS`: User already has a donor profile
- `USER_NOT_FOUND`: Referenced user does not exist
- `VALIDATION_ERROR`: Invalid input data
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Admin access required or access to other user's profile

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

1. **One Profile Per User**: Each user can have only one donor profile
2. **Automatic Creation**: Created automatically on first authenticated donation
3. **Tier Calculation**: Based on total_donated amount, updated automatically
4. **Anonymous Support**: Users can set default anonymity preference
5. **Tax Receipts**: Generated for tax-deductible donations only
6. **Email Preferences**: Separate email for tax receipts (optional)
7. **Profile Deletion**: Removes profile but preserves donation history
8. **Access Control**: Users can only access their own profile (except admins)
9. **Statistics Updates**: Automatically updated when donations are processed
10. **Recurring Preferences**: Stored for future donation suggestions
