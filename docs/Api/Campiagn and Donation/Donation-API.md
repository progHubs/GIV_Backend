# Donation API Documentation

## Base URL
All donation endpoints are prefixed with `/api/donations`

## Authentication
- **Public Routes**: Donation creation supports both anonymous and authenticated users
- **Protected Routes**: Require valid JWT token in Authorization header
- **Admin Routes**: Require admin role for donation management

## Endpoints

### Public/Optional Authentication Endpoints

#### POST /api/donations
Create a new donation (supports both anonymous and authenticated users).

**Authentication:** Optional (uses `optionalAuthenticateToken` middleware)

**Request Body:**
```json
{
  "campaign_id": 1,
  "amount": 100.00,
  "currency": "USD",
  "donation_type": "one_time",
  "payment_method": "stripe",
  "payment_status": "pending",
  "transaction_id": "txn_1234567890",
  "receipt_url": "https://stripe.com/receipt/123",
  "is_tax_deductible": true,
  "notes": "Happy to support this cause"
}
```

**Field Descriptions:**
- `campaign_id` (integer, required): ID of the campaign to donate to
- `amount` (decimal, required): Donation amount (minimum 0.01)
- `currency` (string, optional): Currency code (default: "USD")
- `donation_type` (string, required): One of "one_time", "recurring", "in_kind"
- `payment_method` (string, optional): Payment method used
- `payment_status` (string, required): One of "pending", "completed", "failed"
- `transaction_id` (string, optional): Unique transaction identifier
- `receipt_url` (string, optional): URL to payment receipt
- `is_tax_deductible` (boolean, optional): Whether donation is tax deductible (default: true)
- `notes` (string, optional): Additional notes from donor

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "donor_id": "456", // or "0" for anonymous
    "campaign_id": "1",
    "amount": "100.00",
    "currency": "USD",
    "donation_type": "one_time",
    "payment_method": "stripe",
    "payment_status": "pending",
    "transaction_id": "txn_1234567890",
    "receipt_url": "https://stripe.com/receipt/123",
    "is_acknowledged": false,
    "is_tax_deductible": true,
    "is_anonymous": false,
    "notes": "Happy to support this cause",
    "donated_at": "2024-01-01T12:00:00.000Z",
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z"
  },
  "message": "Donation created successfully"
}
```

**Anonymous Donation Behavior:**
- If no authentication token provided, donation is marked as anonymous
- `donor_id` is set to special anonymous donor ID (0)
- `is_anonymous` is automatically set to true
- No email receipt is sent for anonymous donations

**Authenticated Donation Behavior:**
- If user is authenticated, donation is linked to their account
- If user doesn't have a donor profile, one is automatically created
- User's `is_donor` flag is set to true
- Email receipt is sent to user's email
- Donor profile statistics are updated

### Protected Endpoints (Authentication Required)

#### GET /api/donations
List donations with filtering and pagination.

**Authentication:** Required

**Access Control:**
- **Admin users**: Can see all donations
- **Regular users**: Can only see their own donations

**Query Parameters:**
- `campaign_id` (integer): Filter by campaign
- `donation_type` (string): Filter by donation type
- `payment_status` (string): Filter by payment status
- `start_date` (date): Filter donations from this date
- `end_date` (date): Filter donations until this date
- `min_amount` (decimal): Minimum donation amount
- `max_amount` (decimal): Maximum donation amount
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10, max: 50)
- `sortBy` (string): Sort field (default: 'donated_at')
- `sortOrder` (string): Sort order 'asc' or 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "123",
      "donor_id": "456",
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
      "created_at": "2024-01-01T12:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z",
      "campaigns": {
        "id": "1",
        "title": "Clean Water Initiative",
        "slug": "clean-water-initiative"
      },
      "donor_profiles": {
        "user_id": "456",
        "users": {
          "id": "456",
          "full_name": "John Doe",
          "email": "john@example.com"
        }
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

#### GET /api/donations/search
Search donations with advanced filtering.

**Authentication:** Required

**Access Control:** Same as GET /api/donations

**Query Parameters:**
- `q` (string): Search query (searches in notes, transaction_id)
- `campaign_id` (integer): Filter by campaign
- `donation_type` (string): Filter by donation type
- `payment_status` (string): Filter by payment status
- `page` (integer): Page number
- `limit` (integer): Items per page

**Response:** Same as GET /api/donations

#### GET /api/donations/:id
Get donation by ID.

**Authentication:** Required

**Access Control:**
- **Admin users**: Can view any donation
- **Regular users**: Can only view their own donations

**Parameters:**
- `id` (integer): Donation ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "donor_id": "456",
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
    "created_at": "2024-01-01T12:00:00.000Z",
    "updated_at": "2024-01-01T12:00:00.000Z",
    "campaigns": {
      "id": "1",
      "title": "Clean Water Initiative",
      "slug": "clean-water-initiative",
      "goal_amount": "50000.00",
      "current_amount": "25000.00"
    },
    "donor_profiles": {
      "user_id": "456",
      "total_donated": "500.00",
      "donation_tier": "silver",
      "users": {
        "id": "456",
        "full_name": "John Doe",
        "email": "john@example.com"
      }
    }
  }
}
```

### Admin-Only Endpoints

#### GET /api/donations/stats
Get donation statistics.

**Authentication:** Required (Admin)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDonations": 1250,
    "totalAmount": "125000.00",
    "completedDonations": 1200,
    "pendingDonations": 30,
    "failedDonations": 20,
    "averageDonation": "100.00",
    "recurringDonations": 150,
    "oneTimeDonations": 1100,
    "anonymousDonations": 200,
    "monthlyStats": [
      {
        "month": "2024-01",
        "donations": 100,
        "amount": "10000.00"
      }
    ],
    "topCampaigns": [
      {
        "campaign_id": "1",
        "title": "Clean Water Initiative",
        "total_donations": 50,
        "total_amount": "5000.00"
      }
    ],
    "donorTierBreakdown": {
      "bronze": 800,
      "silver": 300,
      "gold": 100,
      "platinum": 50
    }
  }
}
```

#### PATCH /api/donations/:id/status
Update donation status.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (integer): Donation ID

**Request Body:**
```json
{
  "payment_status": "completed",
  "transaction_id": "txn_updated_123",
  "receipt_url": "https://stripe.com/receipt/updated"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "123",
    "payment_status": "completed",
    "transaction_id": "txn_updated_123",
    "receipt_url": "https://stripe.com/receipt/updated",
    "updated_at": "2024-01-01T12:30:00.000Z"
  },
  "message": "Donation status updated"
}
```

#### DELETE /api/donations/:id
Delete a donation.

**Authentication:** Required (Admin)

**Parameters:**
- `id` (integer): Donation ID

**Response:**
```json
{
  "success": true,
  "message": "Donation deleted successfully"
}
```

## Webhook Integration

### Stripe Webhook Handler
The system includes a webhook handler for processing Stripe payment events:

**Endpoint:** `/api/v1/payments/stripe/webhook`
**Method:** POST
**Authentication:** Stripe signature verification

**Supported Events:**
- `checkout.session.completed`: One-time payment completed
- `invoice.paid`: Recurring payment completed
- `checkout.session.async_payment_succeeded`: Delayed payment succeeded

**Webhook Processing:**
1. Verifies Stripe signature
2. Extracts metadata (campaign_id, donor_id, etc.)
3. Calls `donationService.handleStripeDonationSuccess()`
4. Updates campaign and donor statistics
5. Sends email receipt (if not anonymous)

## Error Responses

### Common Error Codes
- `DONATION_NOT_FOUND`: Donation does not exist
- `VALIDATION_ERROR`: Invalid input data
- `CAMPAIGN_NOT_FOUND`: Referenced campaign does not exist
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Admin access required or access to other user's donation
- `DONATION_CREATE_ERROR`: Database error creating donation

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

1. **Anonymous Donations**: Supported with special donor_id (0)
2. **Automatic Donor Profile Creation**: Created on first authenticated donation
3. **Campaign Statistics**: Automatically updated on successful donations
4. **Email Receipts**: Sent for authenticated donations only
5. **Payment Status**: Must be 'completed' to update campaign statistics
6. **Currency**: Defaults to USD, supports multiple currencies
7. **Minimum Amount**: 0.01 (configurable)
8. **Transaction Uniqueness**: transaction_id must be unique if provided
9. **Soft Delete**: Donations can be deleted by admins only
10. **Access Control**: Users can only view their own donations (except admins)
