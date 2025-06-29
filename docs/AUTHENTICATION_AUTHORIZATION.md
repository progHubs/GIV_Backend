# Authentication & Authorization System Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Security Features](#security-features)
4. [API Endpoints](#api-endpoints)
5. [Token Management](#token-management)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Frontend Integration](#frontend-integration)
8. [Error Handling](#error-handling)
9. [Security Best Practices](#security-best-practices)
10. [Testing](#testing)
11. [Configuration](#configuration)

## Overview

The GIV Society Authentication & Authorization system provides a secure, scalable solution for user management with JWT-based authentication, role-based access control, and comprehensive security features.

### Key Features
- **JWT-based Authentication** with access and refresh tokens
- **Role-based Access Control** (RBAC) with multiple user roles
- **Password Security** with bcrypt hashing and strength validation
- **Rate Limiting** to prevent brute force attacks
- **Account Lockout** protection
- **Email Verification** (optional)
- **Session Management** with refresh token rotation
- **Soft Delete** for user accounts
- **Input Validation** and sanitization

## System Architecture

### Components
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Layer     │    │   Database      │
│                 │    │                 │    │                 │
│ - React/Vue     │◄──►│ - Controllers   │◄──►│ - MySQL         │
│ - Mobile App    │    │ - Middleware    │    │ - Prisma ORM    │
│ - Web App       │    │ - Services      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Authentication Flow
1. **Registration**: User creates account → Password hashed → User stored → Verification email sent
2. **Login**: Credentials validated → JWT tokens generated → Session created → Tokens returned
3. **Token Refresh**: Refresh token validated → New token pair generated → Old tokens invalidated
4. **Logout**: Refresh token revoked → Session terminated → Cookies cleared

## Security Features

### Password Security
- **Hashing**: bcrypt with 12 salt rounds
- **Strength Requirements**:
  - Minimum 8 characters, maximum 128
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character
  - No common passwords
  - No repeated characters
  - No keyboard sequences

### Rate Limiting
- **Registration**: 2 attempts per hour per IP
- **Login**: 5 attempts per 15 minutes per IP
- **Password Reset**: 3 attempts per hour per IP
- **Email Verification**: 5 attempts per 15 minutes per IP
- **General Auth**: 5 attempts per 15 minutes per IP

### Account Protection
- **Account Lockout**: Temporary lockout after failed attempts
- **IP Tracking**: Monitor login attempts by IP address
- **Session Management**: Track active sessions and devices
- **Token Rotation**: Refresh tokens rotated on each use

## API Endpoints

### Base URL
```
https://api.givsociety.org/api/auth
```

### 1. User Registration
```http
POST /api/auth/register
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+251912345678",
  "role": "volunteer",
  "language_preference": "en"
}
```

**Response (Success - 201)**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "1",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "volunteer",
    "language_preference": "en",
    "email_verified": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "verificationToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Remove in production
}
```

### 2. User Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (Success - 200)**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "1",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "volunteer",
    "language_preference": "en",
    "email_verified": true,
    "profile_image_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  },
  "sessionId": "sess_abc123def456"
}
```

### 3. Token Refresh
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200)**
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

### 4. User Logout
```http
POST /api/auth/logout
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (Success - 200)**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### 5. Get Current User
```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (Success - 200)**
```json
{
  "success": true,
  "user": {
    "id": "1",
    "full_name": "John Doe",
    "email": "john@example.com",
    "role": "volunteer",
    "language_preference": "en",
    "email_verified": true,
    "profile_image_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### 6. Change Password
```http
POST /api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

### 7. Request Password Reset
```http
POST /api/auth/request-password-reset
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### 8. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePass456!"
}
```

### 9. Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 10. Resend Verification Email
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}
```

### 11. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "full_name": "John Smith",
  "phone": "+251912345679",
  "language_preference": "am"
}
```

### 12. Delete Account
```http
DELETE /api/auth/account
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "password": "SecurePass123!"
}
```

## Token Management

### Token Types
1. **Access Token**: Short-lived (15 minutes) for API access
2. **Refresh Token**: Long-lived (7 days) for token renewal
3. **Reset Token**: Short-lived (10 minutes) for password reset
4. **Verification Token**: Long-lived (24 hours) for email verification

### Token Structure
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "1",
    "email": "john@example.com",
    "role": "volunteer",
    "iat": 1642234567,
    "exp": 1642235467,
    "iss": "giv-society",
    "aud": "giv-society-users"
  }
}
```

### Token Storage
- **Frontend**: Store in memory or secure storage (not localStorage)
- **Backend**: Refresh tokens stored in database with hashing
- **Cookies**: HttpOnly, Secure, SameSite=Strict

### Token Refresh Flow
1. Access token expires
2. Frontend sends refresh token
3. Backend validates refresh token
4. New token pair generated
5. Old refresh token revoked
6. New tokens returned

## User Roles & Permissions

### Available Roles
1. **admin**: Full system access
2. **volunteer**: Volunteer-specific features
3. **donor**: Donor-specific features
4. **editor**: Content management

### Role Permissions
```javascript
const rolePermissions = {
  admin: [
    'user:read', 'user:write', 'user:delete',
    'campaign:read', 'campaign:write', 'campaign:delete',
    'event:read', 'event:write', 'event:delete',
    'donation:read', 'donation:write',
    'analytics:read', 'settings:write'
  ],
  volunteer: [
    'profile:read', 'profile:write',
    'event:read', 'event:register',
    'volunteer:read', 'volunteer:write'
  ],
  donor: [
    'profile:read', 'profile:write',
    'campaign:read', 'donation:write',
    'donor:read', 'donor:write'
  ],
  editor: [
    'content:read', 'content:write',
    'post:read', 'post:write',
    'media:read', 'media:write'
  ]
};
```

### Middleware Usage
```javascript
// Require authentication
app.get('/protected', authenticateToken, (req, res) => {
  // Route handler
});

// Require specific role
app.get('/admin', authenticateToken, requireRole('admin'), (req, res) => {
  // Admin only route
});

// Require multiple roles
app.get('/content', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  // Admin or editor route
});
```

## Frontend Integration

### React Example
```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios
axios.defaults.baseURL = 'https://api.givsociety.org/api';
axios.defaults.withCredentials = true;

// Add request interceptor
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('/auth/refresh', { refreshToken });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.tokens;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    try {
      const response = await axios.post('/auth/login', credentials);
      const { user, tokens } = response.data;
      
      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.errors?.[0] || 'Login failed' 
      };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await axios.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      const { user, tokens } = response.data;
      
      if (tokens) {
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        setUser(user);
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.errors?.[0] || 'Registration failed' 
      };
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Vue.js Example
```javascript
// store/auth.js
import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null
  }),

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await axios.post('/auth/login', credentials);
        const { user, tokens } = response.data;
        
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        this.user = user;
        
        return { success: true };
      } catch (error) {
        this.error = error.response?.data?.errors?.[0] || 'Login failed';
        return { success: false, error: this.error };
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        await axios.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.user = null;
      }
    },

    async checkAuth() {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await axios.get('/auth/me');
          this.user = response.data.user;
        }
      } catch (error) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.user = null;
      }
    }
  }
});
```

## Error Handling

### Error Response Format
```json
{
  "success": false,
  "errors": ["Error message"],
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Input validation failed
- `USER_EXISTS`: User already exists
- `INVALID_CREDENTIALS`: Invalid email or password
- `ACCOUNT_LOCKED`: Account temporarily locked
- `TOKEN_EXPIRED`: JWT token has expired
- `INVALID_TOKEN`: Invalid JWT token
- `MISSING_TOKEN`: No token provided
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `EMAIL_NOT_VERIFIED`: Email verification required
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Security Best Practices

### Frontend Security
1. **Token Storage**: Use secure storage, avoid localStorage for sensitive data
2. **HTTPS Only**: Always use HTTPS in production
3. **Token Rotation**: Implement automatic token refresh
4. **Logout**: Clear all tokens on logout
5. **Input Validation**: Validate inputs before sending to API
6. **Error Handling**: Don't expose sensitive information in errors

### Backend Security
1. **Environment Variables**: Store secrets in environment variables
2. **Input Sanitization**: Sanitize all inputs
3. **Rate Limiting**: Implement rate limiting on all endpoints
4. **CORS**: Configure CORS properly
5. **Helmet**: Use security headers
6. **Logging**: Log security events
7. **Monitoring**: Monitor for suspicious activity

### Token Security
1. **Short Expiration**: Keep access tokens short-lived
2. **Secure Storage**: Store refresh tokens securely
3. **Token Rotation**: Rotate refresh tokens
4. **Revocation**: Implement token revocation
5. **Audience**: Use proper audience claims

## Testing

### API Testing with Postman
1. **Collection Setup**: Create a Postman collection
2. **Environment Variables**: Set up environment variables
3. **Pre-request Scripts**: Handle token management
4. **Tests**: Write automated tests

### Example Postman Test
```javascript
// Pre-request Script
if (pm.environment.get("accessToken")) {
    pm.request.headers.add({
        key: "Authorization",
        value: "Bearer " + pm.environment.get("accessToken")
    });
}

// Test Script
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success property", function () {
    const response = pm.response.json();
    pm.expect(response).to.have.property('success');
});

if (pm.response.json().tokens) {
    pm.environment.set("accessToken", pm.response.json().tokens.accessToken);
    pm.environment.set("refreshToken", pm.response.json().tokens.refreshToken);
}
```

### Unit Testing
```javascript
// auth.test.js
const request = require('supertest');
const app = require('../src/server');

describe('Authentication Endpoints', () => {
  test('POST /api/auth/register - should register new user', async () => {
    const userData = {
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'TestPass123!',
      role: 'volunteer'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(userData.email);
  });

  test('POST /api/auth/login - should login user', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'TestPass123!'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.tokens).toBeDefined();
  });
});
```

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/giv_society"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_ACCESS_EXPIRATION=900
JWT_REFRESH_EXPIRATION=604800

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Security
REQUIRE_EMAIL_VERIFICATION=false
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
RATE_LIMIT_WINDOW=900000

# Server
NODE_ENV="development"
PORT=3000
CORS_ORIGIN="http://localhost:3000"
```

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Configure HTTPS
- [ ] Set up proper CORS
- [ ] Configure rate limiting
- [ ] Set up monitoring
- [ ] Configure logging
- [ ] Set up backup strategy
- [ ] Configure email service
- [ ] Set up SSL certificates

## Support

For technical support or questions about the authentication system:

1. **Documentation**: Check this documentation first
2. **Issues**: Create an issue in the project repository
3. **Security**: Report security issues privately
4. **Email**: Contact the development team

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: GIV Society Development Team 