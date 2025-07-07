# 📊 **HTTP Status Codes**

## 📋 **Overview**

This document provides a comprehensive guide to HTTP status codes used in the GIV Society API, their meanings, and when they are returned.

---

## ✅ **2xx Success Codes**

### **200 OK**
- **Usage**: Successful GET, PUT, PATCH requests
- **Description**: Request succeeded and response contains data
- **Examples**:
  - Get user profile
  - Update profile information
  - Search results
  - Login success

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": { /* response data */ }
}
```

### **201 Created**
- **Usage**: Successful POST requests that create resources
- **Description**: Resource successfully created
- **Examples**:
  - User registration
  - Create campaign
  - Create event
  - Make donation

```json
{
  "success": true,
  "message": "Resource created successfully",
  "data": { /* created resource */ },
  "id": "123"
}
```

### **202 Accepted**
- **Usage**: Asynchronous operations
- **Description**: Request accepted for processing but not completed
- **Examples**:
  - Email sending
  - File processing
  - Background tasks

```json
{
  "success": true,
  "message": "Request accepted for processing",
  "taskId": "task_1234567890",
  "estimatedCompletion": "2024-07-07T10:05:00.000Z"
}
```

### **204 No Content**
- **Usage**: Successful DELETE requests
- **Description**: Request succeeded but no content to return
- **Examples**:
  - Delete user account
  - Remove resource
  - Logout

```
HTTP/1.1 204 No Content
```

---

## ❌ **4xx Client Error Codes**

### **400 Bad Request**
- **Usage**: Invalid request data or parameters
- **Description**: Client sent malformed or invalid request
- **Examples**:
  - Validation errors
  - Invalid JSON
  - Missing required fields
  - Weak password

```json
{
  "success": false,
  "errors": ["Invalid request data"],
  "code": "VALIDATION_ERROR",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### **401 Unauthorized**
- **Usage**: Authentication required or failed
- **Description**: Request lacks valid authentication credentials
- **Examples**:
  - Missing access token
  - Invalid token
  - Expired token
  - Invalid login credentials

```json
{
  "success": false,
  "errors": ["Access token is required"],
  "code": "MISSING_TOKEN",
  "action": "provide_token"
}
```

### **403 Forbidden**
- **Usage**: Authorization failed
- **Description**: Client lacks permission for requested resource
- **Examples**:
  - Insufficient role permissions
  - Email not verified
  - Account inactive
  - Resource access denied

```json
{
  "success": false,
  "errors": ["Insufficient permissions"],
  "code": "INSUFFICIENT_PERMISSIONS",
  "requiredRoles": ["admin"],
  "userRole": "volunteer"
}
```

### **404 Not Found**
- **Usage**: Resource not found
- **Description**: Requested resource does not exist
- **Examples**:
  - User not found
  - Campaign not found
  - Invalid endpoint
  - Deleted resource

```json
{
  "success": false,
  "errors": ["Resource not found"],
  "code": "RESOURCE_NOT_FOUND",
  "resource": "user",
  "id": "123"
}
```

### **405 Method Not Allowed**
- **Usage**: HTTP method not supported
- **Description**: Request method not allowed for this endpoint
- **Examples**:
  - POST to GET-only endpoint
  - DELETE on read-only resource

```json
{
  "success": false,
  "errors": ["Method not allowed"],
  "code": "METHOD_NOT_ALLOWED",
  "allowedMethods": ["GET", "POST"]
}
```

### **409 Conflict**
- **Usage**: Resource conflict
- **Description**: Request conflicts with current resource state
- **Examples**:
  - Duplicate email registration
  - Conflicting updates
  - Resource already exists

```json
{
  "success": false,
  "errors": ["Email is already registered"],
  "code": "DUPLICATE_EMAIL",
  "conflictingField": "email"
}
```

### **422 Unprocessable Entity**
- **Usage**: Semantic validation errors
- **Description**: Request is well-formed but semantically incorrect
- **Examples**:
  - Business rule violations
  - Invalid state transitions
  - Logical inconsistencies

```json
{
  "success": false,
  "errors": ["Cannot delete campaign with active donations"],
  "code": "BUSINESS_RULE_VIOLATION",
  "rule": "active_donations_prevent_deletion"
}
```

### **423 Locked**
- **Usage**: Resource is locked
- **Description**: Resource is temporarily locked
- **Examples**:
  - Account lockout
  - Resource being processed
  - Maintenance mode

```json
{
  "success": false,
  "errors": ["Account temporarily locked due to multiple failed attempts"],
  "code": "ACCOUNT_LOCKED",
  "lockoutUntil": "2024-07-07T10:15:00.000Z",
  "lockoutDuration": 900
}
```

### **429 Too Many Requests**
- **Usage**: Rate limiting
- **Description**: Client has sent too many requests
- **Examples**:
  - API rate limit exceeded
  - Login attempt limit
  - Email sending limit

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

---

## 🔥 **5xx Server Error Codes**

### **500 Internal Server Error**
- **Usage**: Unexpected server errors
- **Description**: Server encountered an unexpected condition
- **Examples**:
  - Unhandled exceptions
  - Database errors
  - Service failures

```json
{
  "success": false,
  "errors": ["Internal server error"],
  "code": "INTERNAL_SERVER_ERROR",
  "requestId": "req_1234567890",
  "timestamp": "2024-07-07T10:00:00.000Z"
}
```

### **502 Bad Gateway**
- **Usage**: Upstream service errors
- **Description**: Server received invalid response from upstream
- **Examples**:
  - Database connection failed
  - External API errors
  - Service dependency failures

```json
{
  "success": false,
  "errors": ["Bad gateway - upstream service error"],
  "code": "BAD_GATEWAY",
  "service": "database"
}
```

### **503 Service Unavailable**
- **Usage**: Service temporarily unavailable
- **Description**: Server temporarily unable to handle request
- **Examples**:
  - Maintenance mode
  - Overloaded server
  - Service restart

```json
{
  "success": false,
  "errors": ["Service temporarily unavailable"],
  "code": "SERVICE_UNAVAILABLE",
  "retryAfter": 300,
  "maintenanceWindow": "2024-07-07T10:00:00.000Z"
}
```

### **504 Gateway Timeout**
- **Usage**: Upstream timeout
- **Description**: Server timeout waiting for upstream response
- **Examples**:
  - Database query timeout
  - External API timeout
  - Long-running operations

```json
{
  "success": false,
  "errors": ["Gateway timeout"],
  "code": "GATEWAY_TIMEOUT",
  "timeout": 30000
}
```

---

## 📊 **Status Code Usage by Endpoint**

### **Authentication Endpoints**

| Endpoint | Success | Client Error | Server Error |
|----------|---------|--------------|--------------|
| `POST /auth/register` | 201 Created | 400 (validation), 409 (duplicate) | 500, 503 |
| `POST /auth/login` | 200 OK | 401 (invalid), 423 (locked) | 500, 503 |
| `POST /auth/logout` | 204 No Content | 401 (unauthorized) | 500 |
| `POST /auth/refresh` | 200 OK | 401 (invalid token) | 500 |
| `GET /auth/me` | 200 OK | 401 (unauthorized) | 500 |

### **User Management Endpoints**

| Endpoint | Success | Client Error | Server Error |
|----------|---------|--------------|--------------|
| `GET /users` | 200 OK | 401, 403 (admin only) | 500 |
| `GET /users/:id` | 200 OK | 401, 403, 404 | 500 |
| `PUT /users/:id` | 200 OK | 400, 401, 403, 404 | 500 |
| `DELETE /users/:id` | 204 No Content | 401, 403, 404 | 500 |
| `GET /users/search` | 200 OK | 401, 403 | 500 |

### **Campaign Endpoints**

| Endpoint | Success | Client Error | Server Error |
|----------|---------|--------------|--------------|
| `GET /campaigns` | 200 OK | 400 (invalid params) | 500 |
| `POST /campaigns` | 201 Created | 400, 401, 403, 409 | 500 |
| `PUT /campaigns/:id` | 200 OK | 400, 401, 403, 404 | 500 |
| `DELETE /campaigns/:id` | 204 No Content | 401, 403, 404, 422 | 500 |

### **Donation Endpoints**

| Endpoint | Success | Client Error | Server Error |
|----------|---------|--------------|--------------|
| `POST /donations` | 201 Created | 400, 401, 422 | 500, 502 (payment) |
| `GET /donations` | 200 OK | 401, 403 | 500 |
| `GET /donations/:id` | 200 OK | 401, 403, 404 | 500 |

---

## 🔧 **Status Code Headers**

### **Success Response Headers**
```http
HTTP/1.1 200 OK
Content-Type: application/json
X-Request-ID: req_1234567890
X-Response-Time: 150ms
Cache-Control: no-cache
```

### **Error Response Headers**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json
X-Request-ID: req_1234567890
X-Error-Code: VALIDATION_ERROR
```

### **Rate Limited Response Headers**
```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1625097600
Retry-After: 900
```

---

## 📱 **Frontend Status Code Handling**

### **Status Code Handler**
```javascript
const handleResponse = async (response) => {
  const data = await response.json();
  
  switch (response.status) {
    case 200:
    case 201:
      return { success: true, data };
      
    case 204:
      return { success: true };
      
    case 400:
      throw new ValidationError(data.errors, data.details);
      
    case 401:
      if (data.code === 'TOKEN_EXPIRED') {
        await refreshToken();
        throw new TokenExpiredError();
      }
      throw new AuthenticationError(data.errors[0]);
      
    case 403:
      throw new AuthorizationError(data.errors[0], data.code);
      
    case 404:
      throw new NotFoundError(data.errors[0]);
      
    case 409:
      throw new ConflictError(data.errors[0], data.conflictingField);
      
    case 422:
      throw new BusinessRuleError(data.errors[0], data.rule);
      
    case 423:
      throw new AccountLockedError(data.lockoutUntil);
      
    case 429:
      throw new RateLimitError(data.retryAfter);
      
    case 500:
    case 502:
    case 503:
    case 504:
      throw new ServerError(data.errors[0], response.status);
      
    default:
      throw new UnknownError(`Unexpected status: ${response.status}`);
  }
};
```

### **Custom Error Classes**
```javascript
class ApiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
    this.name = this.constructor.name;
  }
}

class ValidationError extends ApiError {
  constructor(errors, details) {
    super(errors[0], 400, 'VALIDATION_ERROR');
    this.errors = errors;
    this.details = details;
  }
}

class AuthenticationError extends ApiError {
  constructor(message) {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends ApiError {
  constructor(message, code) {
    super(message, 403, code);
  }
}

class RateLimitError extends ApiError {
  constructor(retryAfter) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfter;
  }
}
```

---

## 📊 **Status Code Analytics**

### **Response Status Distribution**
```json
{
  "status_analytics": {
    "2xx": { "count": 45678, "percentage": 89.2 },
    "4xx": { "count": 4567, "percentage": 8.9 },
    "5xx": { "count": 967, "percentage": 1.9 },
    "most_common": [
      { "status": 200, "count": 42345, "percentage": 82.7 },
      { "status": 401, "count": 2134, "percentage": 4.2 },
      { "status": 400, "count": 1567, "percentage": 3.1 },
      { "status": 404, "count": 567, "percentage": 1.1 },
      { "status": 500, "count": 234, "percentage": 0.5 }
    ]
  }
}
```

### **Error Rate Monitoring**
```javascript
const monitorErrorRates = () => {
  const errorRate4xx = (count4xx / totalRequests) * 100;
  const errorRate5xx = (count5xx / totalRequests) * 100;
  
  if (errorRate4xx > 10) {
    alert('High 4xx error rate detected');
  }
  
  if (errorRate5xx > 2) {
    alert('High 5xx error rate detected');
  }
};
```

---

## 🔍 **Troubleshooting Guide**

### **Common Status Code Issues**

#### **401 Unauthorized**
- Check if Authorization header is present
- Verify token format (Bearer token)
- Ensure token hasn't expired
- Confirm user has valid session

#### **403 Forbidden**
- Verify user has required role/permissions
- Check if email is verified (if required)
- Ensure account is active
- Confirm resource ownership

#### **429 Too Many Requests**
- Implement exponential backoff
- Check rate limit headers
- Consider request batching
- Review API usage patterns

#### **500 Internal Server Error**
- Check server logs for details
- Verify database connectivity
- Review recent deployments
- Monitor system resources

---

## 🚀 **Best Practices**

### **For API Consumers**
1. **Handle all status codes** appropriately
2. **Implement retry logic** for 5xx errors
3. **Respect rate limits** (429 responses)
4. **Cache responses** when appropriate (200 with cache headers)
5. **Log errors** for debugging

### **For API Developers**
1. **Use appropriate status codes** for each scenario
2. **Provide meaningful error messages**
3. **Include relevant headers** (rate limit, cache control)
4. **Log all errors** for monitoring
5. **Monitor status code distribution**

---

**Previous**: [Error Codes](./error-codes.md)  
**Back to**: [API Documentation Home](./README.md)
