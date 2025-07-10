# System Architecture - Campaign and Donation System

## Overview

This document provides a comprehensive overview of the system architecture for the Campaign and Donation management system in the GIV Society backend. The architecture follows a layered approach with clear separation of concerns.

## Architecture Layers

### 1. API Layer (Controllers)
**Location**: `src/api/controllers/`

#### Campaign Controller (`campaign.controller.js`)
- **Purpose**: Handles all HTTP requests related to campaigns
- **Key Methods**:
  - `getCampaigns()`: Retrieve campaigns with filtering and pagination
  - `createCampaign()`: Create new campaign (Admin only)
  - `getCampaignById()`: Get specific campaign details
  - `updateCampaign()`: Update campaign (Admin only)
  - `deleteCampaign()`: Soft delete campaign (Admin only)
  - `searchCampaigns()`: Advanced campaign search
  - `getFeaturedCampaigns()`: Get featured campaigns
  - `getActiveCampaigns()`: Get active campaigns
  - `getCampaignStats()`: Get campaign statistics
  - `addCampaignTranslation()`: Add translation (Admin only)
  - `updateCampaignTranslation()`: Update translation (Admin only)

#### Donation Controller (`donation.controller.js`)
- **Purpose**: Handles all HTTP requests related to donations
- **Key Methods**:
  - `createDonation()`: Create new donation (Anonymous/Authenticated)
  - `getDonations()`: List donations with access control
  - `getDonationById()`: Get specific donation
  - `searchDonations()`: Search donations
  - `getDonationStats()`: Get donation statistics (Admin only)
  - `updateDonationStatus()`: Update donation status (Admin only)
  - `deleteDonation()`: Delete donation (Admin only)

#### Donor Controller (`donor.controller.js`)
- **Purpose**: Handles all HTTP requests related to donor profiles
- **Key Methods**:
  - `getDonors()`: Get all donors (Admin only)
  - `getCurrentDonor()`: Get current user's donor profile
  - `createDonor()`: Create donor profile
  - `updateCurrentDonor()`: Update current user's profile
  - `getDonorStats()`: Get donor statistics (Admin only)
  - `searchDonors()`: Search donors (Admin only)
  - `getCurrentDonorDonations()`: Get current user's donations
  - `getDonorDonations()`: Get donor's donations
  - `updateDonationTier()`: Update tier (Admin only)
  - `generateTaxReceipt()`: Generate tax receipt
  - `deleteDonor()`: Delete donor profile

#### Stripe Controller (`stripe.controller.js`)
- **Purpose**: Handles Stripe payment integration
- **Key Methods**:
  - `createStripeSession()`: Create payment session
  - `stripeWebhook()`: Handle Stripe webhooks

### 2. Service Layer (Business Logic)
**Location**: `src/services/`

#### Campaign Service (`campaign.service.js`)
- **Purpose**: Contains all business logic for campaign management
- **Key Features**:
  - Campaign CRUD operations with validation
  - Slug generation and uniqueness checking
  - Translation group management
  - Search and filtering logic
  - Statistics calculation
  - Data conversion (BigInt to String)
  - Soft delete implementation

**Core Methods**:
```javascript
class CampaignService {
  async getAllCampaigns(filters, pagination)
  async createCampaign(campaignData, userId)
  async getCampaignById(campaignId)
  async updateCampaign(campaignId, updateData, userId)
  async deleteCampaign(campaignId, userId)
  async searchCampaigns(searchQuery, filters, pagination)
  async getCampaignStats()
  async addCampaignTranslation(campaignId, translationData, userId)
  async updateCampaignTranslation(campaignId, language, updateData, userId)
  async getCampaignTranslations(campaignId)
}
```

#### Donation Service (`donation.service.js`)
- **Purpose**: Contains all business logic for donation processing
- **Key Features**:
  - Anonymous and authenticated donation handling
  - Automatic donor profile creation
  - Campaign statistics updates
  - Stripe webhook processing
  - Email receipt sending
  - Idempotency handling

**Core Methods**:
```javascript
class DonationService {
  async createDonation(donationData, user)
  async getDonations(filters, user)
  async getDonationById(donationId, user)
  async updateDonationStatus(donationId, statusData)
  async deleteDonation(donationId)
  async getDonationStats()
  async searchDonations(searchQuery, filters, user)
  async handleStripeDonationSuccess(webhookData)
}
```

#### Donor Service (`donor.service.js`)
- **Purpose**: Contains all business logic for donor management
- **Key Features**:
  - Donor profile lifecycle management
  - Donation tier calculation
  - Tax receipt generation
  - Donation history tracking
  - Statistics aggregation

**Core Methods**:
```javascript
class DonorService {
  async getAllDonors(filters, pagination)
  async getDonorById(donorId)
  async createDonorProfile(userId, donorData)
  async updateDonorProfile(donorId, updateData)
  async deleteDonorProfile(userId)
  async getDonorStats()
  async searchDonors(searchQuery, filters, pagination)
  async getDonorDonations(donorId, filters, pagination)
  async updateDonationTier(donorId, tier)
  async generateTaxReceipt(donorId, year)
}
```

#### Stripe Service (`stripe.service.js`)
- **Purpose**: Handles Stripe API interactions
- **Key Features**:
  - Checkout session creation
  - Webhook event verification
  - Session retrieval
  - Subscription management

**Core Methods**:
```javascript
class StripeService {
  async createCheckoutSession(sessionParams)
  async retrieveSession(sessionId)
  async listSessionsBySubscription(subscriptionId)
  constructWebhookEvent(rawBody, signature)
}
```

#### Email Service (`email.service.js`)
- **Purpose**: Handles email notifications
- **Key Features**:
  - Donation receipt emails
  - Template rendering
  - Email logging
  - Error handling

### 3. Data Access Layer (Database)
**Location**: `prisma/schema.prisma` and `prisma/schema.sql`

#### Key Tables and Relationships

```sql
-- Core Tables
campaigns (id, title, slug, description, goal_amount, current_amount, ...)
donations (id, donor_id, campaign_id, amount, payment_status, ...)
donor_profiles (user_id, total_donated, donation_tier, ...)
users (id, full_name, email, role, is_donor, ...)

-- Relationships
donations.donor_id -> donor_profiles.user_id
donations.campaign_id -> campaigns.id
donor_profiles.user_id -> users.id
campaigns.created_by -> users.id
```

#### Database Triggers
- **Comment Count Management**: Automatically updates post comment counts
- **Translation Group IDs**: Auto-generates UUIDs for translation groups

### 4. Middleware Layer
**Location**: `src/middlewares/`

#### Authentication Middleware (`auth.middleware.js`)
- **authenticateToken**: Validates JWT tokens
- **requireAdmin**: Ensures admin role
- **requireDonorFlag**: Ensures donor profile exists
- **optionalAuth**: Optional authentication for public endpoints

#### Validation Layer
**Location**: `src/api/validators/` and `src/utils/validation.util.js`

#### Donation Validator (`donation.validator.js`)
- Input validation using Joi schema
- Sanitization of donation data
- Error message formatting

#### Donor Validation (`validation.util.js`)
- Donor profile data validation
- Field sanitization
- Business rule enforcement

## Data Flow Architecture

### 1. Campaign Creation Flow
```
Frontend Request → Campaign Controller → Campaign Service → Database
                                    ↓
                              Slug Generation
                                    ↓
                           Translation Group Creation
                                    ↓
                              Validation & Storage
```

### 2. Donation Processing Flow
```
Frontend → Stripe Controller → Stripe API → Webhook
                                              ↓
                                    Donation Service
                                              ↓
                              ┌─────────────────────────┐
                              │  Donor Profile Check    │
                              │  Campaign Update        │
                              │  Email Receipt          │
                              │  Statistics Update      │
                              └─────────────────────────┘
```

### 3. Authentication Flow
```
Request → Auth Middleware → JWT Validation → Role Check → Controller
                               ↓
                        User Context Injection
```

## Security Architecture

### 1. Authentication & Authorization
- **JWT-based authentication** for stateless sessions
- **Role-based access control** (Admin, User)
- **Resource-level permissions** (own profile access)
- **Optional authentication** for public endpoints

### 2. Input Validation
- **Joi schema validation** for all inputs
- **SQL injection prevention** through Prisma ORM
- **XSS protection** through input sanitization
- **Rate limiting** on sensitive endpoints

### 3. Payment Security
- **Stripe signature verification** for webhooks
- **No sensitive payment data storage**
- **Idempotency protection** against duplicate processing
- **Metadata validation** for payment integrity

## Scalability Considerations

### 1. Database Optimization
- **Proper indexing** on frequently queried fields
- **Pagination** for large result sets
- **Soft deletes** to maintain data integrity
- **BigInt handling** for large numeric values

### 2. Caching Strategy
- **Campaign data caching** for frequently accessed campaigns
- **Statistics caching** for dashboard data
- **Translation caching** for multi-language support

### 3. Performance Optimization
- **Lazy loading** of related data
- **Batch operations** for bulk updates
- **Connection pooling** for database connections
- **Async processing** for non-critical operations

## Error Handling Strategy

### 1. Layered Error Handling
- **Controller Level**: HTTP status codes and user-friendly messages
- **Service Level**: Business logic errors and validation
- **Database Level**: Constraint violations and data integrity

### 2. Error Response Format
```json
{
  "success": false,
  "error": "User-friendly error message",
  "code": "ERROR_CODE",
  "errors": ["Detailed validation errors"]
}
```

### 3. Logging Strategy
- **Structured logging** with Winston
- **Error tracking** with stack traces
- **Performance monitoring** for slow queries
- **Audit logging** for sensitive operations

## Integration Points

### 1. External Services
- **Stripe API**: Payment processing
- **Resend API**: Email notifications
- **File Storage**: Image and document uploads

### 2. Frontend Integration
- **RESTful API** endpoints
- **Consistent response format**
- **CORS configuration** for cross-origin requests
- **API documentation** for frontend developers

### 3. Webhook Integration
- **Stripe webhooks** for payment events
- **Idempotency handling** for reliable processing
- **Retry mechanisms** for failed webhooks

## Monitoring and Observability

### 1. Application Metrics
- **API response times**
- **Error rates by endpoint**
- **Database query performance**
- **Payment success rates**

### 2. Business Metrics
- **Campaign creation rates**
- **Donation conversion rates**
- **Donor retention rates**
- **Revenue tracking**

### 3. Health Checks
- **Database connectivity**
- **External service availability**
- **Memory and CPU usage**
- **Disk space monitoring**
