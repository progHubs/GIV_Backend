# 👤 **User Profile Management**

## 📋 **Overview**

This document covers user profile management endpoints including profile updates, account deletion, and profile-specific operations.

---

## ✏️ **Update Profile**

### **PUT** `/auth/profile`

Update authenticated user's profile information.

#### **Authentication**: Required
#### **Rate Limit**: General API limit

#### **Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### **Request Body**
```json
{
  "full_name": "John Smith",
  "phone": "+1234567890",
  "language_preference": "en",
  "profile_image_url": "https://example.com/new-profile.jpg"
}
```

#### **Validation Rules**
- **full_name**: 2-100 characters, letters, spaces, hyphens, apostrophes only
- **phone**: Valid international phone format (optional)
- **language_preference**: `en` or `am`
- **profile_image_url**: Valid URL format (optional)

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "full_name": "John Smith",
    "phone": "+1234567890",
    "role": "volunteer",
    "email_verified": true,
    "language_preference": "en",
    "profile_image_url": "https://example.com/new-profile.jpg",
    "created_at": "2024-07-07T10:00:00.000Z",
    "updated_at": "2024-07-07T14:30:00.000Z"
  }
}
```

#### **Error Responses**
```json
// Validation Error (400)
{
  "success": false,
  "errors": ["Full name must be between 2 and 100 characters"],
  "code": "VALIDATION_ERROR"
}

// Unauthorized (401)
{
  "success": false,
  "errors": ["Access token is required"],
  "code": "MISSING_TOKEN"
}
```

---

## 🗑️ **Delete Account**

### **DELETE** `/auth/account`

Permanently delete user account and all associated data.

#### **Authentication**: Required
#### **Rate Limit**: General API limit

#### **Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Request Body** (Optional)
```json
{
  "confirmation": "DELETE_MY_ACCOUNT",
  "reason": "No longer needed"
}
```

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "message": "Account deleted successfully",
  "deletedAt": "2024-07-07T14:30:00.000Z"
}
```

#### **Error Responses**
```json
// Unauthorized (401)
{
  "success": false,
  "errors": ["Access token is required"],
  "code": "MISSING_TOKEN"
}

// Account Not Found (404)
{
  "success": false,
  "errors": ["User account not found"],
  "code": "USER_NOT_FOUND"
}
```

---

## 📊 **Profile Statistics**

### **GET** `/auth/profile/stats`

Get user profile statistics and activity summary.

#### **Authentication**: Required
#### **Rate Limit**: General API limit

#### **Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "stats": {
    "profile_completion": 85,
    "account_age_days": 45,
    "last_login": "2024-07-07T12:00:00.000Z",
    "login_count": 23,
    "email_verified": true,
    "phone_verified": false,
    "role_specific": {
      // For volunteers
      "volunteer": {
        "events_participated": 5,
        "hours_volunteered": 25.5,
        "skills_count": 3,
        "certificates_count": 1
      },
      // For donors
      "donor": {
        "total_donated": "1250.00",
        "donations_count": 8,
        "campaigns_supported": 4,
        "donation_tier": "gold"
      }
    }
  }
}
```

---

## 🔄 **Profile Activity**

### **GET** `/auth/profile/activity`

Get user activity history and recent actions.

#### **Authentication**: Required
#### **Rate Limit**: General API limit

#### **Query Parameters**
- `limit`: Number of activities to return (default: 20, max: 100)
- `offset`: Number of activities to skip (default: 0)
- `type`: Filter by activity type (optional)

#### **Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "activities": [
    {
      "id": "1",
      "type": "LOGIN",
      "description": "User logged in",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "occurred_at": "2024-07-07T12:00:00.000Z"
    },
    {
      "id": "2",
      "type": "PROFILE_UPDATE",
      "description": "Profile information updated",
      "changes": ["full_name", "phone"],
      "occurred_at": "2024-07-07T11:30:00.000Z"
    },
    {
      "id": "3",
      "type": "PASSWORD_CHANGE",
      "description": "Password changed successfully",
      "occurred_at": "2024-07-06T15:20:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

---

## 🔐 **Security Settings**

### **GET** `/auth/profile/security`

Get user security settings and session information.

#### **Authentication**: Required
#### **Rate Limit**: General API limit

#### **Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "security": {
    "email_verified": true,
    "phone_verified": false,
    "two_factor_enabled": false,
    "password_last_changed": "2024-07-06T15:20:00.000Z",
    "failed_login_attempts": 0,
    "account_locked": false,
    "active_sessions": [
      {
        "session_id": "sess_1234567890abcdef",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2024-07-07T10:00:00.000Z",
        "last_activity": "2024-07-07T12:00:00.000Z",
        "is_current": true
      }
    ]
  }
}
```

---

## 🚪 **Terminate Sessions**

### **POST** `/auth/profile/terminate-sessions`

Terminate specific or all user sessions.

#### **Authentication**: Required
#### **Rate Limit**: General API limit

#### **Request Headers**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### **Request Body**
```json
{
  "session_ids": ["sess_1234567890abcdef"],
  "terminate_all": false,
  "exclude_current": true
}
```

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "message": "Sessions terminated successfully",
  "terminated_count": 2,
  "remaining_sessions": 1
}
```

---

## 📱 **Frontend Integration Examples**

### **Update Profile**
```javascript
const updateProfile = async (profileData) => {
  try {
    const response = await fetch('/api/v1/auth/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      setUser(data.user);
      showSuccess('Profile updated successfully');
    } else {
      showError(data.errors[0]);
    }
  } catch (error) {
    showError('Failed to update profile');
  }
};
```

### **Get Profile Statistics**
```javascript
const getProfileStats = async () => {
  try {
    const response = await fetch('/api/v1/auth/profile/stats', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      setStats(data.stats);
    }
  } catch (error) {
    console.error('Failed to fetch profile stats:', error);
  }
};
```

### **Delete Account with Confirmation**
```javascript
const deleteAccount = async (confirmation) => {
  if (confirmation !== 'DELETE_MY_ACCOUNT') {
    showError('Please type DELETE_MY_ACCOUNT to confirm');
    return;
  }
  
  try {
    const response = await fetch('/api/v1/auth/account', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ confirmation }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to goodbye page
      window.location.href = '/goodbye';
    } else {
      showError(data.errors[0]);
    }
  } catch (error) {
    showError('Failed to delete account');
  }
};
```

---

## 🔒 **Security Considerations**

### **Profile Updates**
- All profile changes are logged for security
- Sensitive changes may require re-authentication
- Profile image URLs are validated for security
- Phone number changes may require verification

### **Account Deletion**
- Soft delete with 30-day recovery period
- All personal data is anonymized
- Associated content is preserved but anonymized
- Deletion is logged for compliance

### **Session Management**
- Users can view all active sessions
- Sessions can be terminated remotely
- Suspicious activity triggers security alerts
- Session data includes IP and user agent for security

---

**Previous**: [Authentication Endpoints](./authentication.md)  
**Next**: [Password Management](./password.md)
