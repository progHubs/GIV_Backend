# Authentication Quick Reference Guide

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Required environment variables
DATABASE_URL="mysql://user:password@localhost:3306/giv_society"
JWT_SECRET="your-super-secret-jwt-key-here"
NODE_ENV="development"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Start Server
```bash
npm start
```

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | User logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |
| POST | `/api/auth/request-password-reset` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password | No |
| POST | `/api/auth/verify-email` | Verify email | No |
| POST | `/api/auth/resend-verification` | Resend verification email | No |
| PUT | `/api/auth/profile` | Update profile | Yes |
| DELETE | `/api/auth/account` | Delete account | Yes |

## 🔐 Authentication Flow

### Registration
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    role: 'volunteer'
  })
});

const { tokens, user } = await response.json();
// Store tokens securely
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);
```

### Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const { tokens, user } = await response.json();
// Store tokens securely
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);
```

### Making Authenticated Requests
```javascript
const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Refresh
```javascript
const refreshToken = localStorage.getItem('refreshToken');
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});

const { tokens } = await response.json();
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);
```

## 👥 User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `admin` | System administrator | Full access to all features |
| `volunteer` | Volunteer user | Volunteer-specific features |
| `donor` | Donor user | Donor-specific features |
| `editor` | Content editor | Content management features |

## 🔒 Security Features

### Password Requirements
- Minimum 8 characters, maximum 128
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- No common passwords
- No repeated characters

### Rate Limiting
- Registration: 2 attempts per hour per IP
- Login: 5 attempts per 15 minutes per IP
- Password Reset: 3 attempts per hour per IP
- General Auth: 5 attempts per 15 minutes per IP

### Token Expiration
- Access Token: 15 minutes
- Refresh Token: 7 days
- Reset Token: 10 minutes
- Verification Token: 24 hours

## 🛠️ Middleware Usage

### Require Authentication
```javascript
const { authenticateToken } = require('../middlewares/auth.middleware');

app.get('/protected', authenticateToken, (req, res) => {
  // req.user contains authenticated user data
  res.json({ user: req.user });
});
```

### Require Specific Role
```javascript
const { requireRole } = require('../middlewares/auth.middleware');

app.get('/admin', authenticateToken, requireRole('admin'), (req, res) => {
  // Only admin users can access
  res.json({ message: 'Admin only' });
});
```

### Require Multiple Roles
```javascript
app.get('/content', authenticateToken, requireRole('admin', 'editor'), (req, res) => {
  // Admin or editor users can access
  res.json({ message: 'Admin or editor only' });
});
```

## 📝 Error Handling

### Common Error Responses
```json
{
  "success": false,
  "errors": ["Error message"],
  "code": "ERROR_CODE"
}
```

### Error Codes
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

## 🔧 Configuration

### Environment Variables
```bash
# Required
DATABASE_URL="mysql://user:password@localhost:3306/giv_society"
JWT_SECRET="your-super-secret-jwt-key-here"

# Optional
REQUIRE_EMAIL_VERIFICATION=false
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION=900
NODE_ENV="development"
PORT=3000
```

### JWT Configuration
```javascript
const TOKEN_EXPIRATION = {
  ACCESS: 15 * 60,        // 15 minutes
  REFRESH: 7 * 24 * 60 * 60, // 7 days
  RESET: 10 * 60,         // 10 minutes
  VERIFY: 24 * 60 * 60    // 24 hours
};
```

## 🧪 Testing

### Test User Credentials
```javascript
const testUser = {
  full_name: 'Test User',
  email: 'test@example.com',
  password: 'TestPass123!',
  role: 'volunteer'
};
```

### API Testing with curl
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","email":"test@example.com","password":"TestPass123!","role":"volunteer"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'

# Get current user
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📱 Frontend Integration Examples

### React Hook
```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (credentials) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return { user, login, logout, loading };
};
```

### Axios Interceptor
```javascript
import axios from 'axios';

// Request interceptor
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

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      try {
        const response = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken } = response.data.tokens;
        localStorage.setItem('accessToken', accessToken);
        
        // Retry original request
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return axios(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## 🚨 Security Checklist

### Frontend
- [ ] Store tokens securely (not localStorage in production)
- [ ] Implement automatic token refresh
- [ ] Clear tokens on logout
- [ ] Use HTTPS in production
- [ ] Validate inputs before sending to API

### Backend
- [ ] Use strong JWT secret
- [ ] Set proper token expiration times
- [ ] Implement rate limiting
- [ ] Use environment variables for secrets
- [ ] Sanitize all inputs
- [ ] Log security events

## 📞 Support

- **Documentation**: See `AUTHENTICATION_AUTHORIZATION.md` for detailed documentation
- **Issues**: Create an issue in the project repository
- **Security**: Report security issues privately

---

**Quick Reference Version**: 1.0.0  
**Last Updated**: January 2024 