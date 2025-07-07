# 🔐 **GIV Society Backend API Documentation**

## 📋 **Overview**

This comprehensive API documentation covers all authentication and authorization endpoints for the GIV Society Backend system. The API implements JWT-based authentication, role-based access control, and comprehensive security features.

## 🌐 **Base Information**

- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`
- **API Version**: v1

## 📚 **Documentation Structure**

### **Core Authentication**
- [Authentication Endpoints](./authentication.md) - Login, registration, logout, token management
- [User Profile Management](./profile.md) - Profile operations and account management
- [Password Management](./password.md) - Password change, reset, and security

### **Authorization & Security**
- [Role-Based Access Control](./rbac.md) - Roles, permissions, and access levels
- [Rate Limiting](./rate-limiting.md) - API rate limits and throttling
- [Security Features](./security.md) - Account lockouts, security logging, and protection

### **Token Management**
- [JWT Tokens](./jwt-tokens.md) - Token structure, expiration, and refresh
- [Session Management](./sessions.md) - Session tracking and management

### **Email & Verification**
- [Email Verification](./email-verification.md) - Email verification process
- [Email Templates](./email-templates.md) - Available email templates and customization

### **Error Handling**
- [Error Codes](./error-codes.md) - Complete list of error codes and responses
- [Status Codes](./status-codes.md) - HTTP status codes and their meanings

## 🔑 **Quick Start**

### **1. User Registration**
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "role": "volunteer"
  }'
```

### **2. User Login**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

### **3. Access Protected Endpoint**
```bash
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🛡️ **Security Features**

### **Authentication Security**
- ✅ JWT-based authentication with short-lived access tokens (15 minutes)
- ✅ Refresh tokens with 7-day expiration
- ✅ Token blacklisting and revocation
- ✅ Secure password hashing with bcrypt (12 rounds)
- ✅ Password strength validation
- ✅ Account lockout after failed attempts

### **Rate Limiting**
- ✅ General API: 100 requests per 15 minutes
- ✅ Authentication: 5 requests per 15 minutes
- ✅ Login: 3 attempts per 15 minutes
- ✅ Registration: 2 attempts per hour
- ✅ Password reset: 3 attempts per hour

### **Data Protection**
- ✅ Input validation and sanitization
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Secure cookie settings

## 🎯 **User Roles**

| Role | Description | Access Level |
|------|-------------|--------------|
| `admin` | System administrator | Full access to all resources |
| `volunteer` | Volunteer user | Access to volunteer-specific features |
| `donor` | Donor user | Access to donation and campaign features |
| `editor` | Content editor | Access to content management features |

## 📊 **Response Format**

All API responses follow a consistent format:

### **Success Response**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { /* Response data */ },
  "pagination": { /* Pagination info if applicable */ }
}
```

### **Error Response**
```json
{
  "success": false,
  "errors": ["Error message 1", "Error message 2"],
  "code": "ERROR_CODE",
  "details": { /* Additional error details */ }
}
```

## 🔧 **Environment Variables**

Required environment variables for authentication:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret

# Database
DATABASE_URL=mysql://user:password@localhost:3306/giv_society

# Email Service (Resend)
RESEND_API_KEY=your-resend-api-key
RESEND_SENDER=GIV Society <noreply@givsociety.org>

# Security
REQUIRE_EMAIL_VERIFICATION=true
BCRYPT_ROUNDS=12

# Frontend URLs
FRONTEND_URL=http://localhost:3000
RESET_PASSWORD_URL=http://localhost:3000/reset-password
VERIFY_EMAIL_URL=http://localhost:3000/verify-email
```

## 📱 **Frontend Integration**

### **Token Storage**
- Store access token in memory or secure storage
- Store refresh token in httpOnly cookies (recommended)
- Implement automatic token refresh logic

### **Error Handling**
- Handle 401 (Unauthorized) for token expiration
- Handle 403 (Forbidden) for insufficient permissions
- Handle 429 (Too Many Requests) for rate limiting

### **Security Best Practices**
- Never store tokens in localStorage for production
- Implement proper logout functionality
- Use HTTPS in production
- Validate user permissions on frontend

## 🚀 **Getting Started**

1. **Review Authentication Flow**: Start with [Authentication Endpoints](./authentication.md)
2. **Understand Roles**: Read [Role-Based Access Control](./rbac.md)
3. **Implement Security**: Check [Security Features](./security.md)
4. **Handle Errors**: Review [Error Codes](./error-codes.md)
5. **Test Integration**: Use the provided examples

## 📞 **Support**

For questions or issues with the API:
- Check the specific endpoint documentation
- Review error codes and troubleshooting guides
- Ensure proper authentication headers
- Verify rate limiting compliance

---

**Last Updated**: July 2024  
**API Version**: v1.0.0  
**Documentation Version**: 1.0.0
