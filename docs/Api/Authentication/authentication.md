# 🔐 **Authentication Endpoints**

## 📋 **Overview**

This document covers all authentication-related endpoints including user registration, login, logout, token refresh, and account management.

---

## 🔑 **User Registration**

### **POST** `/auth/register`

Register a new user account.

#### **Rate Limit**: 2 requests per hour per IP

#### **Request Body**

```json
{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": "volunteer",
    "language_preference": "en"
}
```

#### **Validation Rules**

- **email**: Valid email format, unique in system
- **password**: Minimum 8 characters, must include uppercase, lowercase, number, and special character
- **full_name**: 2-100 characters, letters, spaces, hyphens, apostrophes only
- **phone**: Valid international phone format (optional)
- **role**: One of: `volunteer`, `donor`, `editor` (admin accounts created separately)
- **language_preference**: `en` or `am` (optional, defaults to `en`)

#### **Success Response** (201 Created)

```json
{
    "success": true,
    "message": "Registration successful. Please check your email for verification.",
    "user": {
        "id": "1",
        "email": "user@example.com",
        "full_name": "John Doe",
        "role": "volunteer",
        "email_verified": false,
        "language_preference": "en",
        "created_at": "2024-07-07T10:00:00.000Z"
    },
    "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 900
    },
    "sessionId": "sess_1234567890abcdef"
}
```

#### **Error Responses**

```json
// Validation Error (400)
{
  "success": false,
  "errors": ["Email is already registered"],
  "code": "VALIDATION_ERROR"
}

// Rate Limit (429)
{
  "success": false,
  "errors": ["Too many registration attempts from this IP, please try again later."],
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600
}
```

---

## 🚪 **User Login**

### **POST** `/auth/login`

Authenticate user and receive access tokens.

#### **Rate Limit**: 3 requests per 15 minutes per IP

#### **Request Body**

```json
{
    "email": "user@example.com",
    "password": "SecurePassword123!"
}
```

#### **Success Response** (200 OK)

```json
{
    "success": true,
    "message": "Login successful",
    "user": {
        "id": "1",
        "email": "user@example.com",
        "full_name": "John Doe",
        "role": "volunteer",
        "email_verified": true,
        "language_preference": "en",
        "profile_image_url": null,
        "created_at": "2024-07-07T10:00:00.000Z"
    },
    "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 900
    },
    "sessionId": "sess_1234567890abcdef"
}
```

#### **Error Responses**

```json
// Invalid Credentials (401)
{
  "success": false,
  "errors": ["Invalid email or password"],
  "code": "INVALID_CREDENTIALS"
}

// Account Locked (423)
{
  "success": false,
  "errors": ["Account temporarily locked due to multiple failed attempts"],
  "code": "ACCOUNT_LOCKED",
  "lockoutUntil": "2024-07-07T10:15:00.000Z"
}

// Email Not Verified (403)
{
  "success": false,
  "errors": ["Email verification required"],
  "code": "EMAIL_NOT_VERIFIED"
}
```

---

## 🚪 **User Logout**

### **POST** `/auth/logout`

Logout user and invalidate tokens.

#### **Authentication**: Required

#### **Rate Limit**: General API limit

#### **Request Headers**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **Request Body** (Optional)

```json
{
    "all_devices": false
}
```

#### **Success Response** (200 OK)

```json
{
    "success": true,
    "message": "Logout successful"
}
```

---

## 🔄 **Token Refresh**

### **POST** `/auth/refresh`

Refresh access token using refresh token.

#### **Rate Limit**: 5 requests per 15 minutes per IP

#### **Request Body**

```json
{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### **Success Response** (200 OK)

```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 900
    }
}
```

#### **Error Responses**

```json
// Invalid Refresh Token (401)
{
  "success": false,
  "errors": ["Invalid or expired refresh token"],
  "code": "INVALID_REFRESH_TOKEN"
}

// Token Revoked (401)
{
  "success": false,
  "errors": ["Refresh token has been revoked"],
  "code": "TOKEN_REVOKED"
}
```

---

## 👤 **Get Current User**

### **GET** `/auth/me`

Get current authenticated user profile.

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
    "user": {
        "id": "1",
        "email": "user@example.com",
        "full_name": "John Doe",
        "phone": "+1234567890",
        "role": "volunteer",
        "email_verified": true,
        "language_preference": "en",
        "profile_image_url": "https://example.com/profile.jpg",
        "created_at": "2024-07-07T10:00:00.000Z",
        "updated_at": "2024-07-07T12:00:00.000Z"
    }
}
```

---

## 🔧 **Health Check**

### **GET** `/auth/health`

Check authentication service health.

#### **Rate Limit**: General API limit

#### **Success Response** (200 OK)

```json
{
    "success": true,
    "message": "Authentication service is healthy",
    "timestamp": "2024-07-07T10:00:00.000Z",
    "version": "1.0.0",
    "uptime": 86400
}
```

---

## 🍪 **Cookie Management**

The API automatically sets secure HTTP-only cookies for token management:

### **Cookies Set on Login/Registration**

- `accessToken`: HTTP-only, 15-minute expiration
- `refreshToken`: HTTP-only, 7-day expiration
- `sessionId`: HTTP-only, 7-day expiration

### **Cookie Security Settings**

- `httpOnly: true` - Prevents XSS attacks
- `secure: true` - HTTPS only in production
- `sameSite: 'strict'` - CSRF protection

---

## 🔒 **Security Considerations**

### **Password Requirements**

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Cannot be common passwords
- Cannot contain repeated characters
- Cannot contain keyboard sequences

### **Account Lockout**

- 5 failed login attempts trigger lockout
- 15-minute lockout duration
- Lockout applies per email + IP combination
- Security events are logged

### **Token Security**

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Tokens can be revoked/blacklisted
- Session tracking for security monitoring

---

## 📱 **Frontend Integration Examples**

### **JavaScript/React Example**

```javascript
// Login function
const login = async (email, password) => {
    try {
        const response = await fetch("/api/v1/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include", // Include cookies
        });

        const data = await response.json();

        if (data.success) {
            // Store access token in memory/state
            setAccessToken(data.tokens.accessToken);
            setUser(data.user);
        } else {
            throw new Error(data.errors[0]);
        }
    } catch (error) {
        console.error("Login failed:", error);
    }
};

// API request with token
const apiRequest = async (url, options = {}) => {
    const response = await fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            ...options.headers,
        },
        credentials: "include",
    });

    if (response.status === 401) {
        // Token expired, try refresh
        await refreshToken();
        // Retry request
    }

    return response.json();
};
```

---

---

**Next**: [User Profile Management](./profile.md)
