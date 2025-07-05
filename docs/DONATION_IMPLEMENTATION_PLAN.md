# Donation Functionality Implementation Plan

## 1. Project & Structure Analysis

### Project Purpose
- **GIV Society Backend**: Node.js/Express REST API for managing volunteers, donors, donations, campaigns, events, content, and analytics for a non-profit organization.
- **Key Features**: Multilingual support, role-based access, secure authentication, donation/payment processing, campaign/event management, analytics, and content/document/media management.

### Backend Structure
- **Express.js**: Main web framework.
- **Prisma ORM**: For MySQL database access.
- **Folder Structure** (from `/src`):
  - `api/controllers/`: Route logic (controllers).
  - `api/routes/`: Express route definitions.
  - `api/validators/`: Joi validation schemas.
  - `services/`: Business logic/services.
  - `middlewares/`: Auth, error, rate-limiting, etc.
  - `config/`: DB and other configs.
  - `utils/`: Utility functions (JWT, logger, validation, etc.).
  - `prisma/`: Database schema and seed files.
  - `uploads/`: File uploads.

### Database
- **Key Tables**: `users`, `donor_profiles`, `campaigns`, `donations`, etc.
- **Donation Table**: Tracks all donation transactions, linked to donors and campaigns.

### API Patterns
- **RESTful**: CRUD endpoints for each resource.
- **Validation**: Joi schemas for request validation.
- **Services**: Controllers call service methods for business logic.
- **Authentication**: JWT-based, with role checks in middleware.
- **Pagination, Filtering, Sorting**: Standardized in list endpoints.

---

## 2. Donation Functionality: Requirements & Integration Points

### Requirements
- **Donation Types**: One-time, recurring, in-kind.
- **Payment Methods**: Telebirr, PayPal, Stripe.
- **Features**:
  - Create donation (with/without user account)
  - List/filter/search donations (admin, donor)
  - Donation stats/analytics
  - PDF receipt generation
  - Campaign progress update
  - Donor profile update (total donated, last donation, etc.)
  - Validation and error handling
  - Secure access (role-based)
  - Multilingual support (where needed)

### Integration Points
- **Controllers**: `donation.controller.js`
- **Routes**: `donation.routes.js`
- **Validators**: `donation.validator.js`
- **Services**: `donation.service.js`
- **Prisma Schema**: `donations` model in `schema.prisma`
- **Donor/Campaign Services**: Update donor/campaign stats on donation
- **Email Service**: For receipts/notifications

---

## 3. Implementation Plan: Donation Functionality

### A. Database Layer
- **Prisma Model**: Ensure `donations` model in `schema.prisma` matches requirements (already present).
- **Migrations**: If schema changes, update and migrate.

### B. Validation Layer
- **File**: `src/api/validators/donation.validator.js`
- **Tasks**:
  - Joi schemas for: create, update, query/filter.
  - Enum validation for type/status.
  - Amount, currency, and required fields validation.

### C. Service Layer
- **File**: `src/services/donation.service.js`
- **Tasks**:
  - `createDonation(data, userId)`: Create donation, update donor/campaign, handle payment status.
  - `getDonations(filters, user)`: List/filter donations (admin/donor).
  - `getDonationById(id, user)`: Fetch single donation (with access control).
  - `getDonationStats(filters)`: Aggregate stats for admin.
  - `updateDonationStatus(id, data)`: Admin updates status.
  - `deleteDonation(id)`: Admin deletes donation.
  - **Integrate**: With donor/campaign services for stats, with email service for receipts.

### D. Controller Layer
- **File**: `src/api/controllers/donation.controller.js`
- **Tasks**:
  - Map HTTP requests to service methods.
  - Validate input using validator.
  - Handle responses and errors.
  - Enforce access control (middleware).

### E. Routes Layer
- **File**: `src/api/routes/donation.routes.js`
- **Tasks**:
  - Define endpoints:
    - `POST /donations` (create)
    - `GET /donations` (list)
    - `GET /donations/:id` (single)
    - `GET /donations/stats` (stats)
    - `PATCH /donations/:id/status` (update status)
    - `DELETE /donations/:id` (delete)
  - Attach authentication and role middleware.

### F. Donor/Campaign Integration
- **Update**: Donor profile (total donated, last donation, etc.) and campaign (current amount, donor count) on donation creation.

### G. Email/Receipt Integration
- **Send**: Receipt email after successful donation (use `email.service.js`).

### H. Testing
- **Unit/Integration Tests**: For all endpoints and business logic.

---

## 4. Implementation Steps Checklist

1. **Prisma Model**: Confirm/adjust `donations` model.
2. **Validator**: Implement Joi schemas for donation operations.
3. **Service**: Implement all donation business logic.
4. **Controller**: Implement controller methods for all endpoints.
5. **Routes**: Define and secure all donation routes.
6. **Integrate**: With donor/campaign/email services.
7. **Test**: Write and run tests for all donation features.
8. **Docs**: Update API documentation.

---

## 5. File Structure to Create/Restore

```
src/
├── api/
│   ├── controllers/
│   │   └── donation.controller.js
│   ├── routes/
│   │   └── donation.routes.js
│   └── validators/
│       └── donation.validator.js
├── services/
│   └── donation.service.js
```

---

## 6. Best Practices & Patterns

- **Validation**: All input validated before service logic.
- **Service Layer**: All business logic in services, not controllers.
- **Error Handling**: Consistent error responses.
- **Access Control**: Use middleware for authentication/authorization.
- **Integration**: Update related entities (donor, campaign) atomically.
- **Testing**: Unit and integration tests for all endpoints.

---

## 7. Anonymous Donation Handling (Approach 1: Special "Anonymous" Donor Profile)

### Approach Description
- Create a single, reserved donor profile (e.g., user_id = 0 or a dedicated "anonymous" user) in the `donor_profiles` table.
- All anonymous donations are linked to this profile by setting `donor_id` to the reserved value.
- Set `is_anonymous = true` in the `donations` table for these records.
- No personal information is stored for anonymous donors.

### Implementation Steps
1. **Create a Reserved Anonymous Donor Profile:**
   - Insert a record in `users` and `donor_profiles` for the anonymous donor (e.g., user_id = 0 or another reserved value).
   - Example: `INSERT INTO users (id, full_name, is_donor, ...) VALUES (0, 'Anonymous', true, ...);`
   - Example: `INSERT INTO donor_profiles (user_id, is_anonymous, ...) VALUES (0, true, ...);`
2. **Donation Service Logic:**
   - When an unregistered user makes a donation, set `donor_id` to the reserved anonymous user_id (e.g., 0).
   - Set `is_anonymous = true` in the donation record.
3. **Validation:**
   - Allow donations with the reserved anonymous donor_id only if the user is not authenticated.
4. **Analytics/Reporting:**
   - When aggregating donations, treat all donations with the anonymous donor_id as anonymous.
5. **Security:**
   - Do not store any personal information for anonymous donations. 