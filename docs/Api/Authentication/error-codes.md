# ⚠️ **Error Codes**

## 📋 **Overview**

This document provides a comprehensive list of error codes used throughout the GIV Society API, their meanings, and recommended handling strategies.

---

## 🔐 **Authentication Errors**

### **AUTH_001 - MISSING_TOKEN**
- **HTTP Status**: 401 Unauthorized
- **Description**: Access token is required but not provided
- **Action**: Provide valid Bearer token in Authorization header

```json
{
  "success": false,
  "errors": ["Access token is required"],
  "code": "MISSING_TOKEN"
}
```

### **AUTH_002 - INVALID_TOKEN**
- **HTTP Status**: 401 Unauthorized
- **Description**: Provided token is invalid or malformed
- **Action**: Obtain new token through login or refresh

```json
{
  "success": false,
  "errors": ["Invalid or malformed token"],
  "code": "INVALID_TOKEN"
}
```

### **AUTH_003 - TOKEN_EXPIRED**
- **HTTP Status**: 401 Unauthorized
- **Description**: Access token has expired
- **Action**: Refresh token or re-authenticate

```json
{
  "success": false,
  "errors": ["Token has expired"],
  "code": "TOKEN_EXPIRED",
  "action": "refresh_token"
}
```

### **AUTH_004 - TOKEN_REVOKED**
- **HTTP Status**: 401 Unauthorized
- **Description**: Token has been revoked or blacklisted
- **Action**: Re-authenticate to obtain new token

```json
{
  "success": false,
  "errors": ["Token has been revoked"],
  "code": "TOKEN_REVOKED",
  "action": "login_required"
}
```

### **AUTH_005 - INVALID_REFRESH_TOKEN**
- **HTTP Status**: 401 Unauthorized
- **Description**: Refresh token is invalid or expired
- **Action**: User must log in again

```json
{
  "success": false,
  "errors": ["Invalid or expired refresh token"],
  "code": "INVALID_REFRESH_TOKEN"
}
```

### **AUTH_006 - INVALID_CREDENTIALS**
- **HTTP Status**: 401 Unauthorized
- **Description**: Email or password is incorrect
- **Action**: Check credentials and try again

```json
{
  "success": false,
  "errors": ["Invalid email or password"],
  "code": "INVALID_CREDENTIALS"
}
```

---

## 🚫 **Authorization Errors**

### **AUTHZ_001 - INSUFFICIENT_PERMISSIONS**
- **HTTP Status**: 403 Forbidden
- **Description**: User lacks required permissions for this action
- **Action**: Contact admin for permission upgrade

```json
{
  "success": false,
  "errors": ["Insufficient permissions"],
  "code": "INSUFFICIENT_PERMISSIONS",
  "requiredRoles": ["admin"],
  "userRole": "volunteer"
}
```

### **AUTHZ_002 - EMAIL_NOT_VERIFIED**
- **HTTP Status**: 403 Forbidden
- **Description**: Email verification required for this action
- **Action**: Verify email address

```json
{
  "success": false,
  "errors": ["Email verification required"],
  "code": "EMAIL_NOT_VERIFIED",
  "action": "verify_email"
}
```

### **AUTHZ_003 - ACCOUNT_INACTIVE**
- **HTTP Status**: 403 Forbidden
- **Description**: User account is inactive or suspended
- **Action**: Contact support for account reactivation

```json
{
  "success": false,
  "errors": ["Account is inactive"],
  "code": "ACCOUNT_INACTIVE"
}
```

### **AUTHZ_004 - DONOR_PROFILE_REQUIRED**
- **HTTP Status**: 403 Forbidden
- **Description**: Donor profile required for this action
- **Action**: Complete donor profile setup

```json
{
  "success": false,
  "errors": ["Donor profile required"],
  "code": "DONOR_PROFILE_REQUIRED"
}
```

### **AUTHZ_005 - VOLUNTEER_PROFILE_REQUIRED**
- **HTTP Status**: 403 Forbidden
- **Description**: Volunteer profile required for this action
- **Action**: Complete volunteer profile setup

```json
{
  "success": false,
  "errors": ["Volunteer profile required"],
  "code": "VOLUNTEER_PROFILE_REQUIRED"
}
```

---

## ✅ **Validation Errors**

### **VAL_001 - VALIDATION_ERROR**
- **HTTP Status**: 400 Bad Request
- **Description**: Input validation failed
- **Action**: Fix validation errors and resubmit

```json
{
  "success": false,
  "errors": [
    "Email is required",
    "Password must be at least 8 characters"
  ],
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### **VAL_002 - INVALID_EMAIL_FORMAT**
- **HTTP Status**: 400 Bad Request
- **Description**: Email format is invalid
- **Action**: Provide valid email address

```json
{
  "success": false,
  "errors": ["Invalid email format"],
  "code": "INVALID_EMAIL_FORMAT"
}
```

### **VAL_003 - WEAK_PASSWORD**
- **HTTP Status**: 400 Bad Request
- **Description**: Password doesn't meet security requirements
- **Action**: Use stronger password

```json
{
  "success": false,
  "errors": [
    "Password must contain at least one uppercase letter",
    "Password must contain at least one special character"
  ],
  "code": "WEAK_PASSWORD",
  "password_strength": {
    "score": 35,
    "level": "Weak",
    "suggestions": [
      "Add uppercase letters",
      "Add special characters"
    ]
  }
}
```

### **VAL_004 - INVALID_PHONE_FORMAT**
- **HTTP Status**: 400 Bad Request
- **Description**: Phone number format is invalid
- **Action**: Provide valid international phone number

```json
{
  "success": false,
  "errors": ["Invalid phone number format"],
  "code": "INVALID_PHONE_FORMAT"
}
```

---

## 🔒 **Security Errors**

### **SEC_001 - ACCOUNT_LOCKED**
- **HTTP Status**: 423 Locked
- **Description**: Account temporarily locked due to failed attempts
- **Action**: Wait for lockout period to expire

```json
{
  "success": false,
  "errors": ["Account temporarily locked due to multiple failed attempts"],
  "code": "ACCOUNT_LOCKED",
  "lockoutUntil": "2024-07-07T10:15:00.000Z",
  "lockoutDuration": 900
}
```

### **SEC_002 - RATE_LIMIT_EXCEEDED**
- **HTTP Status**: 429 Too Many Requests
- **Description**: Rate limit exceeded for this endpoint
- **Action**: Wait before making more requests

```json
{
  "success": false,
  "errors": ["Too many requests from this IP, please try again later."],
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 900,
  "details": {
    "limit": 100,
    "window": 900,
    "resetTime": "2024-07-07T10:15:00.000Z"
  }
}
```

### **SEC_003 - SUSPICIOUS_ACTIVITY**
- **HTTP Status**: 403 Forbidden
- **Description**: Suspicious activity detected
- **Action**: Complete additional verification

```json
{
  "success": false,
  "errors": ["Suspicious activity detected"],
  "code": "SUSPICIOUS_ACTIVITY",
  "action": "additional_verification_required"
}
```

### **SEC_004 - PASSWORD_RECENTLY_USED**
- **HTTP Status**: 400 Bad Request
- **Description**: Password was recently used
- **Action**: Choose a different password

```json
{
  "success": false,
  "errors": ["Cannot reuse any of your last 5 passwords"],
  "code": "PASSWORD_RECENTLY_USED"
}
```

### **SEC_005 - INVALID_CURRENT_PASSWORD**
- **HTTP Status**: 400 Bad Request
- **Description**: Current password is incorrect
- **Action**: Provide correct current password

```json
{
  "success": false,
  "errors": ["Current password is incorrect"],
  "code": "INVALID_CURRENT_PASSWORD"
}
```

---

## 🔄 **Token & Session Errors**

### **TOK_001 - INVALID_VERIFICATION_TOKEN**
- **HTTP Status**: 400 Bad Request
- **Description**: Email verification token is invalid
- **Action**: Request new verification email

```json
{
  "success": false,
  "errors": ["Invalid verification token"],
  "code": "INVALID_VERIFICATION_TOKEN"
}
```

### **TOK_002 - INVALID_RESET_TOKEN**
- **HTTP Status**: 400 Bad Request
- **Description**: Password reset token is invalid or expired
- **Action**: Request new password reset

```json
{
  "success": false,
  "errors": ["Invalid or expired reset token"],
  "code": "INVALID_RESET_TOKEN"
}
```

### **TOK_003 - EMAIL_ALREADY_VERIFIED**
- **HTTP Status**: 400 Bad Request
- **Description**: Email address is already verified
- **Action**: No action needed

```json
{
  "success": false,
  "errors": ["Email is already verified"],
  "code": "EMAIL_ALREADY_VERIFIED"
}
```

### **SES_001 - SESSION_NOT_FOUND**
- **HTTP Status**: 404 Not Found
- **Description**: Session not found or expired
- **Action**: Create new session by logging in

```json
{
  "success": false,
  "errors": ["Session not found"],
  "code": "SESSION_NOT_FOUND"
}
```

### **SES_002 - SESSION_EXPIRED**
- **HTTP Status**: 401 Unauthorized
- **Description**: Session has expired
- **Action**: Re-authenticate

```json
{
  "success": false,
  "errors": ["Session has expired"],
  "code": "SESSION_EXPIRED"
}
```

---

## 📊 **Resource Errors**

### **RES_001 - USER_NOT_FOUND**
- **HTTP Status**: 404 Not Found
- **Description**: User account not found
- **Action**: Check user ID or email

```json
{
  "success": false,
  "errors": ["User not found"],
  "code": "USER_NOT_FOUND"
}
```

### **RES_002 - RESOURCE_NOT_FOUND**
- **HTTP Status**: 404 Not Found
- **Description**: Requested resource not found
- **Action**: Check resource ID

```json
{
  "success": false,
  "errors": ["Resource not found"],
  "code": "RESOURCE_NOT_FOUND",
  "resource": "campaign",
  "id": "123"
}
```

### **RES_003 - DUPLICATE_EMAIL**
- **HTTP Status**: 409 Conflict
- **Description**: Email address already registered
- **Action**: Use different email or login

```json
{
  "success": false,
  "errors": ["Email is already registered"],
  "code": "DUPLICATE_EMAIL"
}
```

### **RES_004 - RESOURCE_CONFLICT**
- **HTTP Status**: 409 Conflict
- **Description**: Resource conflict detected
- **Action**: Resolve conflict and retry

```json
{
  "success": false,
  "errors": ["Resource conflict detected"],
  "code": "RESOURCE_CONFLICT",
  "details": {
    "field": "slug",
    "value": "existing-campaign",
    "conflict": "Campaign with this slug already exists"
  }
}
```

---

## 🔧 **System Errors**

### **SYS_001 - INTERNAL_SERVER_ERROR**
- **HTTP Status**: 500 Internal Server Error
- **Description**: Unexpected server error
- **Action**: Try again later or contact support

```json
{
  "success": false,
  "errors": ["Internal server error"],
  "code": "INTERNAL_SERVER_ERROR",
  "requestId": "req_1234567890"
}
```

### **SYS_002 - DATABASE_ERROR**
- **HTTP Status**: 500 Internal Server Error
- **Description**: Database operation failed
- **Action**: Try again later

```json
{
  "success": false,
  "errors": ["Database operation failed"],
  "code": "DATABASE_ERROR"
}
```

### **SYS_003 - EMAIL_SERVICE_ERROR**
- **HTTP Status**: 500 Internal Server Error
- **Description**: Email service unavailable
- **Action**: Try again later

```json
{
  "success": false,
  "errors": ["Email service temporarily unavailable"],
  "code": "EMAIL_SERVICE_ERROR"
}
```

### **SYS_004 - SERVICE_UNAVAILABLE**
- **HTTP Status**: 503 Service Unavailable
- **Description**: Service temporarily unavailable
- **Action**: Try again later

```json
{
  "success": false,
  "errors": ["Service temporarily unavailable"],
  "code": "SERVICE_UNAVAILABLE",
  "retryAfter": 300
}
```

---

## 📱 **Frontend Error Handling**

### **Error Handler Utility**
```javascript
const handleApiError = (error, showNotification = true) => {
  const { code, errors, details } = error;
  
  switch (code) {
    case 'TOKEN_EXPIRED':
      // Attempt token refresh
      return refreshToken();
      
    case 'MISSING_TOKEN':
    case 'INVALID_TOKEN':
    case 'TOKEN_REVOKED':
      // Redirect to login
      redirectToLogin();
      break;
      
    case 'INSUFFICIENT_PERMISSIONS':
      showError('You don\'t have permission to perform this action');
      break;
      
    case 'EMAIL_NOT_VERIFIED':
      showEmailVerificationPrompt();
      break;
      
    case 'RATE_LIMIT_EXCEEDED':
      const retryAfter = details?.retryAfter || 60;
      showError(`Too many requests. Please wait ${retryAfter} seconds.`);
      break;
      
    case 'VALIDATION_ERROR':
      showValidationErrors(details);
      break;
      
    case 'ACCOUNT_LOCKED':
      const unlockTime = new Date(details?.lockoutUntil);
      showError(`Account locked until ${unlockTime.toLocaleTimeString()}`);
      break;
      
    default:
      if (showNotification) {
        showError(errors?.[0] || 'An unexpected error occurred');
      }
  }
};
```

### **Error Boundary Component**
```javascript
class ApiErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## 📊 **Error Monitoring**

### **Error Tracking**
```javascript
const logError = (error, context = {}) => {
  const errorLog = {
    code: error.code,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userId: getCurrentUser()?.id,
    url: window.location.href,
    userAgent: navigator.userAgent,
    context
  };
  
  // Send to monitoring service
  sendToMonitoring(errorLog);
};
```

### **Error Analytics**
```json
{
  "error_analytics": {
    "most_common_errors": [
      { "code": "TOKEN_EXPIRED", "count": 1247, "percentage": 23.4 },
      { "code": "VALIDATION_ERROR", "count": 892, "percentage": 16.8 },
      { "code": "RATE_LIMIT_EXCEEDED", "count": 567, "percentage": 10.7 }
    ],
    "error_trends": {
      "24h": { "total": 5321, "increase": 12.3 },
      "7d": { "total": 34567, "decrease": 5.2 }
    }
  }
}
```

---

**Previous**: [Email Templates](./email-templates.md)  
**Next**: [Status Codes](./status-codes.md)
