# Campaign and Donation System Documentation

## Overview

This documentation covers the comprehensive Campaign and Donation system implementation in the GIV Society backend. The system provides full functionality for managing fundraising campaigns, processing donations (both anonymous and authenticated), donor profile management, and payment processing through Stripe integration.

## System Architecture

### Core Components

1. **Campaign Management System**
   - Campaign CRUD operations
   - Multi-language support with translation groups
   - Featured and active campaign filtering
   - Campaign statistics and analytics
   - Search and filtering capabilities

2. **Donation Processing System**
   - Anonymous and authenticated donations
   - One-time and recurring donation support
   - Stripe payment integration
   - Donation status tracking
   - Receipt generation and email notifications

3. **Donor Management System**
   - Automatic donor profile creation
   - Donor tier management (Bronze, Silver, Gold, Platinum)
   - Donation history tracking
   - Tax receipt generation
   - Anonymous donation support

4. **Payment Processing**
   - Stripe Checkout integration
   - Webhook handling for payment events
   - Support for both one-time and subscription payments
   - Secure payment verification

## Database Schema

### Key Tables

#### Campaigns Table
```sql
CREATE TABLE campaigns (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    goal_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    category VARCHAR(50),
    progress_bar_color VARCHAR(20),
    image_url VARCHAR(512),
    video_url VARCHAR(512),
    donor_count INT UNSIGNED DEFAULT 0,
    success_stories JSON,
    created_by BIGINT UNSIGNED,
    language ENUM('en', 'am') DEFAULT 'en',
    translation_group_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)
);
```

#### Donations Table
```sql
CREATE TABLE donations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT UNSIGNED NOT NULL,
    campaign_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    donation_type ENUM('one_time', 'recurring', 'in_kind') NOT NULL,
    payment_method VARCHAR(50),
    payment_status ENUM('pending', 'completed', 'failed') NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    receipt_url VARCHAR(512),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    is_tax_deductible BOOLEAN DEFAULT TRUE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    notes TEXT,
    donated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(user_id),
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);
```

#### Donor Profiles Table
```sql
CREATE TABLE donor_profiles (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    is_recurring_donor BOOLEAN DEFAULT FALSE,
    preferred_payment_method VARCHAR(50),
    total_donated DECIMAL(15,2) DEFAULT 0.00,
    donation_frequency ENUM('monthly', 'quarterly', 'yearly'),
    tax_receipt_email VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT FALSE,
    last_donation_date TIMESTAMP NULL,
    donation_tier ENUM('bronze', 'silver', 'gold', 'platinum'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Business Logic

### Campaign Lifecycle
1. **Creation**: Admin creates campaign with required fields
2. **Activation**: Campaign becomes active and visible to public
3. **Donation Collection**: Users can donate to active campaigns
4. **Progress Tracking**: Real-time updates of current_amount and donor_count
5. **Completion**: Campaign reaches goal or end date
6. **Reporting**: Statistics and success stories compilation

### Donation Flow
1. **Initiation**: User selects campaign and donation amount
2. **Authentication Check**: System determines if user is authenticated
3. **Donor Profile**: Creates or updates donor profile as needed
4. **Payment Processing**: Stripe handles secure payment
5. **Confirmation**: Webhook confirms payment success
6. **Updates**: Campaign and donor statistics updated
7. **Notification**: Receipt email sent (if not anonymous)

### Donor Management
1. **Profile Creation**: Automatic creation on first donation
2. **Tier Calculation**: Based on total donation amount
3. **History Tracking**: All donations linked to donor profile
4. **Tax Receipts**: Annual tax receipt generation
5. **Anonymity**: Support for anonymous donations

## File Structure

```
src/
├── api/
│   ├── controllers/
│   │   ├── campaign.controller.js
│   │   ├── donation.controller.js
│   │   ├── donor.controller.js
│   │   └── stripe.controller.js
│   ├── routes/
│   │   ├── campaign.routes.js
│   │   ├── donation.routes.js
│   │   ├── donor.routes.js
│   │   └── stripe.routes.js
│   └── validators/
│       ├── donation.validator.js
│       └── donor.validator.js
├── services/
│   ├── campaign.service.js
│   ├── donation.service.js
│   ├── donor.service.js
│   ├── stripe.service.js
│   └── email.service.js
├── middlewares/
│   └── auth.middleware.js
└── utils/
    └── validation.util.js
```

## Next Steps

For detailed API documentation, please refer to:
- [Campaign API Documentation](./Campaign-API.md)
- [Donation API Documentation](./Donation-API.md)
- [Donor API Documentation](./Donor-API.md)
- [Payment Processing Documentation](./Payment-Processing.md)
