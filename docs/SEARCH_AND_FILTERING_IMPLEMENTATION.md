# 🔍 **Search & Filtering Implementation Guide**

## 📋 **Overview**

This document outlines the comprehensive search and filtering functionality implemented across all major modules in the GIV Society Backend system. The implementation provides consistent, powerful, and flexible querying capabilities for users, volunteers, donors, donations, events, campaigns, and skills.

## 🎯 **Key Features**

### **✅ Implemented Modules**
- **Users** - User management with profile filtering
- **Volunteers** - Volunteer profiles with skills and experience filtering
- **Donors** - Donor profiles with donation history filtering
- **Donations** - Transaction filtering with payment and donor details
- **Events** - Event management with date and capacity filtering
- **Campaigns** - Campaign filtering with progress and goal tracking
- **Skills** - Skill management with volunteer count filtering

### **🔧 Core Functionality**
- **Text Search** - Full-text search across relevant fields
- **Date Range Filtering** - Created/updated date filtering
- **Boolean Filters** - True/false toggles for various properties
- **Numeric Range Filtering** - Min/max values for amounts, counts, etc.
- **Pagination** - Consistent pagination with configurable limits
- **Sorting** - Flexible sorting by any field with asc/desc order
- **Access Control** - Role-based filtering and data access

---

## 🔍 **Search Endpoints**

### **1. User Search**
```
GET /api/v1/users/search
```

**Query Parameters:**
- `q` - General search query (name, email, phone)
- `role` - User role filter (admin, user, etc.)
- `email_verified` - Email verification status (true/false)
- `language_preference` - Language preference (en, am)
- `is_donor` - Donor status (true/false)
- `is_volunteer` - Volunteer status (true/false)
- `has_profile_image` - Profile image presence (true/false)
- `phone` - Phone number search
- `created_after` - Created after date (YYYY-MM-DD)
- `created_before` - Created before date (YYYY-MM-DD)
- `updated_after` - Updated after date (YYYY-MM-DD)
- `updated_before` - Updated before date (YYYY-MM-DD)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Sort field (default: created_at)
- `sortOrder` - Sort order (asc/desc, default: desc)

### **2. Volunteer Search**
```
GET /api/v1/volunteers/search
```

**Query Parameters:**
- `q` - General search query (name, email, expertise, location)
- `location` - Location filter
- `area_of_expertise` - Expertise area filter
- `background_check_status` - Background check status
- `training_completed` - Training completion status (true/false)
- `has_skills` - Skills presence (true/false)
- `has_certificate` - Certificate presence (true/false)
- `has_emergency_contact` - Emergency contact presence (true/false)
- `min_hours` - Minimum volunteer hours
- `max_hours` - Maximum volunteer hours
- `min_rating` - Minimum rating
- `max_rating` - Maximum rating
- `min_events` - Minimum events participated
- `max_events` - Maximum events participated
- `skill_category` - Skill category filter
- `skill_name` - Skill name search
- `proficiency_level` - Skill proficiency level
- Standard pagination and date filters

### **3. Donor Search**
```
GET /api/v1/donors/search
```

**Query Parameters:**
- `q` - General search query (name, email)
- `donation_tier` - Donor tier (Bronze, Silver, Gold, Platinum)
- `is_recurring_donor` - Recurring donor status (true/false)
- `donation_frequency` - Donation frequency
- `min_total_donated` - Minimum total donated amount
- `max_total_donated` - Maximum total donated amount
- `min_donations` - Minimum number of donations
- `max_donations` - Maximum number of donations
- `is_anonymous` - Anonymous donor status (true/false)
- `has_tax_receipt` - Tax receipt presence (true/false)
- `preferred_causes` - Preferred causes search
- `last_donation_after` - Last donation after date
- `last_donation_before` - Last donation before date
- Standard pagination and date filters

### **4. Donation Search**
```
GET /api/v1/donations/search
```

**Query Parameters:**
- `q` - General search query (notes, transaction ID, currency)
- `status` - Payment status (pending, completed, failed, etc.)
- `payment_method` - Payment method (stripe, bank_transfer, etc.)
- `is_anonymous` - Anonymous donation (true/false)
- `is_recurring` - Recurring donation (true/false)
- `has_tax_receipt` - Tax receipt presence (true/false)
- `min_amount` - Minimum donation amount
- `max_amount` - Maximum donation amount
- `currency` - Currency filter
- `campaign_id` - Specific campaign ID
- `donor_id` - Specific donor ID
- `donor_email` - Donor email search
- `donor_name` - Donor name search
- Standard pagination and date filters

### **5. Event Search**
```
GET /api/v1/events/search
```

**Query Parameters:**
- `q` - General search query (title, description, location, category)
- `status` - Event status (upcoming, ongoing, completed, cancelled)
- `event_type` - Event category/type
- `location` - Location filter
- `is_featured` - Featured event status (true/false)
- `is_recurring` - Recurring event status (true/false)
- `requires_registration` - Registration requirement (true/false)
- `has_capacity_limit` - Capacity limit presence (true/false)
- `min_capacity` - Minimum capacity
- `max_capacity` - Maximum capacity
- `min_registered` - Minimum registered participants
- `max_registered` - Maximum registered participants
- `start_date_after` - Start date after
- `start_date_before` - Start date before
- `end_date_after` - End date after
- `end_date_before` - End date before
- `lang` - Language preference (en, am)
- Standard pagination and date filters

### **6. Campaign Search**
```
GET /api/v1/campaigns/search
```

**Query Parameters:**
- `q` - General search query (title, description, slug, category)
- `status` - Campaign status (active, completed, paused, etc.)
- `category` - Campaign category
- `is_featured` - Featured campaign status (true/false)
- `is_urgent` - Urgent campaign status (true/false)
- `has_image` - Image presence (true/false)
- `min_goal` - Minimum goal amount
- `max_goal` - Maximum goal amount
- `min_raised` - Minimum raised amount
- `max_raised` - Maximum raised amount
- `min_donors` - Minimum donor count
- `max_donors` - Maximum donor count
- `min_progress` - Minimum progress percentage
- `max_progress` - Maximum progress percentage
- `start_date_after` - Start date after
- `start_date_before` - Start date before
- `end_date_after` - End date after
- `end_date_before` - End date before
- `language` - Language preference (en, am)
- Standard pagination and date filters

### **7. Skill Search**
```
GET /api/v1/skills/search
```

**Query Parameters:**
- `q` - General search query (name, description, category)
- `category` - Skill category
- `is_verified` - Verification status (true/false)
- `is_active` - Active status (true/false)
- `has_description` - Description presence (true/false)
- `min_volunteers` - Minimum volunteer count
- `max_volunteers` - Maximum volunteer count
- `proficiency_level` - Proficiency level filter
- Standard pagination and date filters

---

## 📊 **Response Format**

All search endpoints return a consistent response format:

```json
{
  "success": true,
  "data": [...], // Array of results
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "total": 150
}
```

---

## 🔒 **Access Control**

### **Role-Based Filtering**
- **Admin**: Full access to all data
- **User**: Limited to own data where applicable
- **Donor**: Can only see own donations
- **Volunteer**: Can see own volunteer data

### **Data Privacy**
- Sensitive information is filtered based on user role
- Anonymous donations respect privacy settings
- Personal contact information is protected

---

## 🚀 **Usage Examples**

### **Search Active Volunteers with Skills**
```
GET /api/v1/volunteers/search?has_skills=true&training_completed=true&min_rating=4&limit=20
```

### **Find Recent Large Donations**
```
GET /api/v1/donations/search?min_amount=1000&created_after=2024-01-01&sortBy=amount&sortOrder=desc
```

### **Search Featured Campaigns by Category**
```
GET /api/v1/campaigns/search?is_featured=true&category=education&min_progress=50
```

### **Find Upcoming Events in Location**
```
GET /api/v1/events/search?status=upcoming&location=Addis Ababa&start_date_after=2024-07-01
```

---

## ⚡ **Performance Considerations**

- **Database Indexing**: Ensure proper indexes on searchable fields
- **Pagination Limits**: Maximum 100 items per page to prevent overload
- **Query Optimization**: Use efficient Prisma queries with proper includes
- **Caching**: Consider implementing Redis caching for frequent searches

---

## 🔧 **Technical Implementation**

### **Service Layer Pattern**
Each module follows the same pattern:
1. **Controller** - Handles HTTP requests and parameter validation
2. **Service** - Contains business logic and database queries
3. **Consistent Error Handling** - Standardized error responses
4. **BigInt Conversion** - Proper handling of database BigInt fields

### **Database Queries**
- Uses Prisma ORM for type-safe database operations
- Implements proper WHERE clause building
- Supports complex filtering with AND/OR conditions
- Includes related data with proper joins

---

**Status**: ✅ **FULLY IMPLEMENTED**  
**Date**: July 2024  
**Coverage**: 7 modules with comprehensive filtering
