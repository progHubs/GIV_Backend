# 🚀 GIV Society Backend API Documentation

## 📋 Overview

This documentation provides comprehensive API endpoints for the GIV Society Backend system. The API is built with Node.js, Express.js, and uses JWT authentication with role-based access control.

**Base URL:** `http://localhost:3000/api/v1`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Register** → Get access and refresh tokens
2. **Login** → Get access and refresh tokens  
3. **Use access token** → Include in Authorization header
4. **Refresh token** → When access token expires

### Token Management

- **Access Token:** Valid for 15 minutes, used for API requests
- **Refresh Token:** Valid for 7 days, used to get new access tokens
- **Cookies:** Tokens are automatically set as HTTP-only cookies

### Authorization Headers

```javascript
// Include in all authenticated requests
headers: {
  'Authorization': 'Bearer YOUR_ACCESS_TOKEN',
  'Content-Type': 'application/json'
}
```

---

## 👤 User Management

### 1. User Registration

**Endpoint:** `POST /auth/register`  
**Access:** Public  
**Rate Limit:** 2 registrations per hour per IP

**Request Body:**
```json
{
  "full_name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!",
  "phone": "+251912345678",
  "role": "volunteer",
  "language_preference": "en"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "role": "volunteer",
    "language_preference": "en",
    "email_verified": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "verificationToken": "abc123..." // Remove in production
}
```

### 2. User Login

**Endpoint:** `POST /auth/login`  
**Access:** Public  
**Rate Limit:** 3 login attempts per 15 minutes per IP

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "role": "volunteer",
    "language_preference": "en",
    "email_verified": true
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "sessionId": "session_123"
}
```

### 3. Get Current User

**Endpoint:** `GET /auth/me`  
**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+251912345678",
    "role": "volunteer",
    "profile_image_url": "https://example.com/avatar.jpg",
    "language_preference": "en",
    "email_verified": true,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Update User Profile

**Endpoint:** `PUT /auth/profile`  
**Access:** Private

**Request Body:**
```json
{
  "full_name": "John Smith",
  "phone": "+251912345679",
  "language_preference": "am",
  "profile_image_url": "https://example.com/new-avatar.jpg"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "full_name": "John Smith",
    "email": "john.doe@example.com",
    "phone": "+251912345679",
    "language_preference": "am",
    "profile_image_url": "https://example.com/new-avatar.jpg"
  }
}
```

### 5. Change Password

**Endpoint:** `PUT /auth/change-password`  
**Access:** Private

**Request Body:**
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePassword456!",
  "confirm_password": "NewSecurePassword456!"
}
```

### 6. Logout

**Endpoint:** `POST /auth/logout`  
**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 7. Refresh Token

**Endpoint:** `POST /auth/refresh`  
**Access:** Public

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## 🙋 Volunteer Management

### 1. Create Volunteer Profile

**Endpoint:** `POST /volunteers`  
**Access:** Private (Authenticated user)

**Request Body:**
```json
{
  "area_of_expertise": "Healthcare",
  "location": "Addis Ababa, Ethiopia",
  "availability": {
    "weekdays": ["monday", "wednesday", "friday"],
    "weekends": ["saturday"],
    "hours": "9:00 AM - 5:00 PM"
  },
  "motivation": "I want to help improve healthcare access in Ethiopia",
  "emergency_contact_name": "Jane Doe",
  "emergency_contact_phone": "+251912345679"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Volunteer profile created successfully",
  "data": {
    "user_id": 1,
    "area_of_expertise": "Healthcare",
    "location": "Addis Ababa, Ethiopia",
    "availability": {
      "weekdays": ["monday", "wednesday", "friday"],
      "weekends": ["saturday"],
      "hours": "9:00 AM - 5:00 PM"
    },
    "motivation": "I want to help improve healthcare access in Ethiopia",
    "total_hours": 0,
    "registered_events_count": 0,
    "training_completed": false,
    "background_check_status": "pending",
    "rating": 0.00,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Current Volunteer Profile

**Endpoint:** `GET /volunteers/me`  
**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "area_of_expertise": "Healthcare",
    "location": "Addis Ababa, Ethiopia",
    "availability": {
      "weekdays": ["monday", "wednesday", "friday"],
      "weekends": ["saturday"],
      "hours": "9:00 AM - 5:00 PM"
    },
    "motivation": "I want to help improve healthcare access in Ethiopia",
    "total_hours": 45,
    "registered_events_count": 3,
    "training_completed": true,
    "background_check_status": "approved",
    "rating": 4.5,
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_phone": "+251912345679",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Update Volunteer Profile

**Endpoint:** `PUT /volunteers/me`  
**Access:** Private

**Request Body:**
```json
{
  "area_of_expertise": "Mental Health",
  "location": "Addis Ababa, Ethiopia",
  "availability": {
    "weekdays": ["tuesday", "thursday"],
    "weekends": ["saturday", "sunday"],
    "hours": "10:00 AM - 6:00 PM"
  },
  "motivation": "Updated motivation text"
}
```

### 4. Get Volunteer by ID (Admin)

**Endpoint:** `GET /volunteers/:id`  
**Access:** Private (Admin or own profile)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "user": {
      "id": 1,
      "full_name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+251912345678",
      "role": "volunteer"
    },
    "area_of_expertise": "Healthcare",
    "location": "Addis Ababa, Ethiopia",
    "total_hours": 45,
    "background_check_status": "approved",
    "rating": 4.5
  }
}
```

### 5. Search Volunteers (Admin)

**Endpoint:** `GET /volunteers/search?search=john&location=addis&background_check_status=approved`  
**Access:** Private (Admin)

**Query Parameters:**
- `search`: Search by name or email
- `location`: Filter by location
- `area_of_expertise`: Filter by expertise
- `background_check_status`: Filter by status (pending/approved/rejected)
- `training_completed`: Filter by training status (true/false)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "user": {
        "id": 1,
        "full_name": "John Doe",
        "email": "john.doe@example.com"
      },
      "area_of_expertise": "Healthcare",
      "location": "Addis Ababa, Ethiopia",
      "total_hours": 45,
      "background_check_status": "approved"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

### 6. Get Volunteer Statistics (Admin)

**Endpoint:** `GET /volunteers/stats`  
**Access:** Private (Admin)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_volunteers": 150,
    "active_volunteers": 120,
    "pending_background_checks": 15,
    "approved_background_checks": 100,
    "total_hours_contributed": 2500,
    "average_rating": 4.2,
    "top_expertise_areas": [
      { "area": "Healthcare", "count": 45 },
      { "area": "Education", "count": 30 },
      { "area": "Community Service", "count": 25 }
    ]
  }
}
```

---

## 💰 Donor Management

### 1. Create Donor Profile

**Endpoint:** `POST /donors`  
**Access:** Private (Authenticated user)

**Request Body:**
```json
{
  "is_recurring_donor": true,
  "preferred_payment_method": "telebirr",
  "donation_frequency": "monthly",
  "tax_receipt_email": "john.doe@example.com",
  "is_anonymous": false,
  "donation_tier": "silver"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Donor profile created successfully",
  "data": {
    "user_id": 1,
    "is_recurring_donor": true,
    "preferred_payment_method": "telebirr",
    "total_donated": 0.00,
    "donation_frequency": "monthly",
    "tax_receipt_email": "john.doe@example.com",
    "is_anonymous": false,
    "donation_tier": "silver",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Current Donor Profile

**Endpoint:** `GET /donors/me`  
**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "is_recurring_donor": true,
    "preferred_payment_method": "telebirr",
    "total_donated": 1500.00,
    "donation_frequency": "monthly",
    "tax_receipt_email": "john.doe@example.com",
    "is_anonymous": false,
    "last_donation_date": "2024-01-10T10:30:00.000Z",
    "donation_tier": "silver",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Update Donor Profile

**Endpoint:** `PUT /donors/me`  
**Access:** Private

**Request Body:**
```json
{
  "preferred_payment_method": "paypal",
  "donation_frequency": "quarterly",
  "is_anonymous": true,
  "tax_receipt_email": "john.smith@example.com"
}
```

### 4. Get Donor Donation History

**Endpoint:** `GET /donors/me/donations`  
**Access:** Private

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `start_date`: Filter donations from date
- `end_date`: Filter donations to date

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "campaign_id": 1,
      "campaign_title": "Healthcare for All",
      "amount": 500.00,
      "currency": "USD",
      "donation_type": "one_time",
      "payment_method": "telebirr",
      "payment_status": "completed",
      "is_anonymous": false,
      "donated_at": "2024-01-10T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "pages": 2
  }
}
```

### 5. Generate Tax Receipt

**Endpoint:** `GET /donors/me/tax-receipt/2024`  
**Access:** Private

**Response (200):**
```json
{
  "success": true,
  "data": {
    "donor_name": "John Doe",
    "year": 2024,
    "total_donations": 1500.00,
    "currency": "USD",
    "donations": [
      {
        "date": "2024-01-10",
        "campaign": "Healthcare for All",
        "amount": 500.00
      }
    ],
    "receipt_url": "https://example.com/receipts/john-doe-2024.pdf"
  }
}
```

### 6. Get Donor Statistics (Admin)

**Endpoint:** `GET /donors/stats`  
**Access:** Private (Admin)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total_donors": 500,
    "recurring_donors": 150,
    "total_donations": 75000.00,
    "average_donation": 150.00,
    "donation_tiers": {
      "bronze": 200,
      "silver": 150,
      "gold": 100,
      "platinum": 50
    },
    "top_payment_methods": [
      { "method": "telebirr", "count": 300 },
      { "method": "paypal", "count": 150 },
      { "method": "stripe", "count": 50 }
    ]
  }
}
```

---

## 🛠️ Skills Management

### 1. Get All Skills

**Endpoint:** `GET /skills`  
**Access:** Public

**Query Parameters:**
- `category`: Filter by skill category
- `search`: Search skills by name

**Response (200):**
```json
{
  "success": true,
  "message": "Skills retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "First Aid",
      "category": "Healthcare",
      "description": "Basic first aid and emergency response skills"
    },
    {
      "id": 2,
      "name": "Teaching",
      "category": "Education",
      "description": "Educational instruction and curriculum development"
    }
  ],
  "count": 25
}
```

### 2. Search Skills

**Endpoint:** `GET /skills/search?q=first&category=Healthcare`  
**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "message": "Skills search completed",
  "data": [
    {
      "id": 1,
      "name": "First Aid",
      "category": "Healthcare",
      "description": "Basic first aid and emergency response skills"
    }
  ],
  "count": 1
}
```

### 3. Get Skill Categories

**Endpoint:** `GET /skills/categories`  
**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "message": "Skill categories retrieved",
  "data": [
    "Healthcare",
    "Education",
    "Technology",
    "Community Service",
    "Administration"
  ]
}
```

### 4. Get Volunteer Skills

**Endpoint:** `GET /skills/volunteers/:volunteerId`  
**Access:** Public (or authenticated for own skills)

**Response (200):**
```json
{
  "success": true,
  "message": "Volunteer skills retrieved",
  "data": [
    {
      "skill_id": 1,
      "skill_name": "First Aid",
      "skill_category": "Healthcare",
      "proficiency_level": "expert",
      "is_verified": true,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 5. Add Skill to Volunteer (Admin/Manager)

**Endpoint:** `POST /skills/volunteers/:volunteerId`  
**Access:** Private (Admin/Volunteer Manager)

**Request Body:**
```json
{
  "skill_id": 1,
  "proficiency_level": "expert"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Skill added to volunteer successfully",
  "data": {
    "volunteer_id": 1,
    "skill_id": 1,
    "skill_name": "First Aid",
    "proficiency_level": "expert",
    "is_verified": false,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 6. Update Volunteer Skill (Admin/Manager)

**Endpoint:** `PUT /skills/volunteers/:volunteerId/:skillId`  
**Access:** Private (Admin/Volunteer Manager)

**Request Body:**
```json
{
  "proficiency_level": "intermediate",
  "is_verified": true
}
```

### 7. Remove Skill from Volunteer (Admin/Manager)

**Endpoint:** `DELETE /skills/volunteers/:volunteerId/:skillId`  
**Access:** Private (Admin/Volunteer Manager)

**Response (200):**
```json
{
  "success": true,
  "message": "Skill removed from volunteer successfully"
}
```

### 8. Verify Volunteer Skill (Admin/Manager)

**Endpoint:** `PUT /skills/volunteers/:volunteerId/:skillId/verify`  
**Access:** Private (Admin/Volunteer Manager)

**Response (200):**
```json
{
  "success": true,
  "message": "Volunteer skill verified successfully",
  "data": {
    "volunteer_id": 1,
    "skill_id": 1,
    "is_verified": true,
    "verified_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### 9. Create New Skill (Admin)

**Endpoint:** `POST /skills`  
**Access:** Private (Admin)

**Request Body:**
```json
{
  "name": "Digital Marketing",
  "category": "Technology",
  "description": "Social media marketing and digital advertising skills"
}
```

### 10. Update Skill (Admin)

**Endpoint:** `PUT /skills/:id`  
**Access:** Private (Admin)

**Request Body:**
```json
{
  "name": "Advanced Digital Marketing",
  "description": "Updated description for advanced digital marketing skills"
}
```

### 11. Delete Skill (Admin)

**Endpoint:** `DELETE /skills/:id`  
**Access:** Private (Admin)

**Response (200):**
```json
{
  "success": true,
  "message": "Skill deleted successfully"
}
```

---

## 🔧 Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `AUTHENTICATION_FAILED` | Invalid credentials | 401 |
| `INSUFFICIENT_PERMISSIONS` | Role-based access denied | 403 |
| `RESOURCE_NOT_FOUND` | Requested resource not found | 404 |
| `RESOURCE_EXISTS` | Resource already exists | 409 |
| `INTERNAL_ERROR` | Server error | 500 |

### Validation Error Response

```json
{
  "success": false,
  "errors": [
    "Email is required",
    "Password must be at least 8 characters long"
  ],
  "code": "VALIDATION_ERROR"
}
```

---

## 📝 Frontend Integration Examples

### JavaScript/React Example

```javascript
// API configuration
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Authentication helper
class AuthService {
  static async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // For cookies
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
    }
    return data;
  }

  static async getCurrentUser() {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });
    
    return response.json();
  }

  static async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
    }
    return data;
  }
}

// Volunteer service
class VolunteerService {
  static async createProfile(profileData) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/volunteers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData)
    });
    
    return response.json();
  }

  static async getCurrentProfile() {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}/volunteers/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    return response.json();
  }
}

// Skills service
class SkillsService {
  static async getAllSkills(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/skills?${params}`);
    return response.json();
  }

  static async getVolunteerSkills(volunteerId) {
    const response = await fetch(`${API_BASE_URL}/skills/volunteers/${volunteerId}`);
    return response.json();
  }
}
```

### React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await AuthService.getCurrentUser();
        if (response.success) {
          setUser(response.user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const response = await AuthService.login(email, password);
    if (response.success) {
      setUser(response.user);
    }
    return response;
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

---

## 🚀 Getting Started

1. **Start the backend server:**
   ```bash
   npm start
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:3000/api/v1/test
   ```

3. **Register a user:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Test User",
       "email": "test@example.com",
       "password": "SecurePassword123!",
       "role": "volunteer"
     }'
   ```

---

## 📞 Support

For API support and questions, please contact the backend development team or refer to the internal documentation.

**Last Updated:** January 15, 2024  
**Version:** 1.0.0 