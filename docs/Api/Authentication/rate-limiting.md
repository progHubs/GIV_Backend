# ⚡ **Rate Limiting**

## 📋 **Overview**

This document covers the API rate limiting system, including limits for different endpoint types, rate limit headers, and handling rate limit errors.

---

## 🚦 **Rate Limit Types**

### **General API Limiter**
- **Limit**: 100 requests per 15 minutes per IP
- **Applies to**: Most public endpoints
- **Purpose**: Prevent API abuse and ensure fair usage

### **Authentication Limiter**
- **Limit**: 5 requests per 15 minutes per IP
- **Applies to**: Token refresh, sensitive auth operations
- **Purpose**: Prevent token abuse and brute force attacks
- **Skip successful requests**: Yes

### **Login Limiter**
- **Limit**: 3 attempts per 15 minutes per IP
- **Applies to**: `/auth/login` endpoint
- **Purpose**: Prevent brute force login attacks
- **Skip successful requests**: Yes

### **Registration Limiter**
- **Limit**: 2 registrations per hour per IP
- **Applies to**: `/auth/register` endpoint
- **Purpose**: Prevent spam registrations

### **Password Reset Limiter**
- **Limit**: 3 requests per hour per IP
- **Applies to**: `/auth/request-password-reset` endpoint
- **Purpose**: Prevent password reset spam

### **Email Verification Limiter**
- **Limit**: 5 attempts per hour per IP
- **Applies to**: Email verification endpoints
- **Purpose**: Prevent verification spam

### **Upload Limiter**
- **Limit**: 10 uploads per hour per IP
- **Applies to**: File upload endpoints
- **Purpose**: Prevent storage abuse

---

## 📊 **Rate Limit Headers**

All API responses include rate limiting headers:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1625097600
X-RateLimit-Window: 900
```

### **Header Descriptions**
- `X-RateLimit-Limit`: Maximum requests allowed in the time window
- `X-RateLimit-Remaining`: Number of requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the rate limit resets
- `X-RateLimit-Window`: Time window duration in seconds

---

## 🚨 **Rate Limit Exceeded Response**

### **HTTP Status**: 429 Too Many Requests

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

### **Response Headers**
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1625097600
X-RateLimit-Window: 900
Retry-After: 900
Content-Type: application/json
```

---

## 🔧 **Endpoint-Specific Limits**

### **Authentication Endpoints**

| Endpoint | Limit | Window | Skip Success |
|----------|-------|--------|--------------|
| `POST /auth/login` | 3 | 15 min | ✅ |
| `POST /auth/register` | 2 | 1 hour | ✅ |
| `POST /auth/refresh` | 5 | 15 min | ❌ |
| `POST /auth/request-password-reset` | 3 | 1 hour | ❌ |
| `GET /auth/verify-email/:token` | 5 | 1 hour | ❌ |
| `POST /auth/resend-verification` | 5 | 1 hour | ❌ |

### **Content Management Endpoints**

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `POST /campaigns` | 10 | 1 hour | Admin/Editor only |
| `POST /events` | 10 | 1 hour | Admin/Editor only |
| `POST /posts` | 20 | 1 hour | Admin/Editor only |
| `POST /uploads` | 10 | 1 hour | File uploads |

### **Search Endpoints**

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `GET /users/search` | 100 | 15 min | Admin only |
| `GET /campaigns/search` | 100 | 15 min | Public |
| `GET /events/search` | 100 | 15 min | Public |
| `GET /donations/search` | 100 | 15 min | Authenticated |

---

## 🛡️ **Rate Limiting Strategies**

### **IP-Based Limiting**
- Default strategy for most endpoints
- Uses client IP address as identifier
- Handles proxy headers (X-Forwarded-For)
- Supports IPv4 and IPv6

### **User-Based Limiting** (Future Enhancement)
```javascript
// Custom key generator for authenticated users
const userBasedLimiter = createRateLimiter({
  keyGenerator: (req) => {
    return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
  },
  max: 1000, // Higher limit for authenticated users
  windowMs: 15 * 60 * 1000
});
```

### **Endpoint-Specific Limiting**
```javascript
// Custom limiter for specific endpoints
const customLimiter = (max, windowMs = 15 * 60 * 1000, message) => {
  return createRateLimiter({
    windowMs,
    max,
    message,
    skipSuccessfulRequests: true
  });
};

// Usage
router.post('/sensitive-operation', 
  customLimiter(1, 60 * 1000, 'Only 1 request per minute allowed'),
  controller.sensitiveOperation
);
```

---

## 📱 **Frontend Handling**

### **Rate Limit Detection**
```javascript
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    
    // Check rate limit headers
    const remaining = parseInt(response.headers.get('X-RateLimit-Remaining'));
    const limit = parseInt(response.headers.get('X-RateLimit-Limit'));
    const resetTime = parseInt(response.headers.get('X-RateLimit-Reset'));
    
    // Warn when approaching limit
    if (remaining < limit * 0.1) {
      console.warn(`Rate limit warning: ${remaining}/${limit} requests remaining`);
      showRateLimitWarning(remaining, new Date(resetTime * 1000));
    }
    
    // Handle rate limit exceeded
    if (response.status === 429) {
      const data = await response.json();
      const retryAfter = parseInt(response.headers.get('Retry-After'));
      
      handleRateLimitExceeded(retryAfter, data);
      throw new Error('Rate limit exceeded');
    }
    
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};
```

### **Retry Logic with Exponential Backoff**
```javascript
const apiRequestWithRetry = async (url, options = {}, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await apiRequest(url, options);
      return response;
    } catch (error) {
      if (error.message === 'Rate limit exceeded' && attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, attempt - 1) * 1000;
        console.log(`Rate limited, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
};
```

### **Rate Limit UI Components**
```javascript
// React component for rate limit warning
const RateLimitWarning = ({ remaining, resetTime }) => {
  const [timeUntilReset, setTimeUntilReset] = useState('');
  
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = resetTime - now;
      
      if (diff > 0) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeUntilReset(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeUntilReset('');
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [resetTime]);
  
  if (remaining > 10) return null;
  
  return (
    <div className="rate-limit-warning">
      <Icon name="warning" />
      <span>
        {remaining} API requests remaining. 
        Resets in {timeUntilReset}
      </span>
    </div>
  );
};

// Rate limit exceeded modal
const RateLimitModal = ({ isOpen, retryAfter, onClose }) => {
  const [countdown, setCountdown] = useState(retryAfter);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, onClose]);
  
  if (!isOpen) return null;
  
  return (
    <Modal>
      <div className="rate-limit-modal">
        <h3>Rate Limit Exceeded</h3>
        <p>
          You've made too many requests. Please wait {countdown} seconds 
          before trying again.
        </p>
        <div className="countdown">{countdown}s</div>
      </div>
    </Modal>
  );
};
```

---

## 🔧 **Configuration**

### **Environment Variables**
```env
# Rate limiting configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STORE=memory
RATE_LIMIT_SKIP_SUCCESSFUL=true

# Redis configuration (for distributed rate limiting)
REDIS_URL=redis://localhost:6379
REDIS_KEY_PREFIX=rl:

# Custom limits
AUTH_RATE_LIMIT=5
LOGIN_RATE_LIMIT=3
REGISTRATION_RATE_LIMIT=2
```

### **Custom Rate Limiter Configuration**
```javascript
// Advanced rate limiter with Redis store
const redisStore = require('rate-limit-redis');
const redis = require('redis');

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

const distributedLimiter = createRateLimiter({
  store: new redisStore({
    client: redisClient,
    prefix: 'rl:',
  }),
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use user ID for authenticated requests, IP for anonymous
    return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
  }
});
```

---

## 📊 **Monitoring and Analytics**

### **Rate Limit Metrics**
- Total requests per endpoint
- Rate limit violations per IP/user
- Peak usage times
- Most rate-limited endpoints

### **Logging Rate Limit Events**
```javascript
const logRateLimit = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (res.statusCode === 429) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        endpoint: req.path,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
        timestamp: new Date()
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};
```

---

## 🚀 **Best Practices**

### **For API Consumers**
1. **Monitor rate limit headers** in responses
2. **Implement exponential backoff** for retries
3. **Cache responses** when possible to reduce requests
4. **Batch operations** to minimize API calls
5. **Use webhooks** instead of polling when available

### **For API Developers**
1. **Set appropriate limits** based on endpoint sensitivity
2. **Use different limits** for authenticated vs anonymous users
3. **Skip successful requests** for security-sensitive endpoints
4. **Provide clear error messages** with retry information
5. **Monitor and adjust limits** based on usage patterns

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Rate Limit Too Restrictive**
- Review usage patterns and adjust limits
- Consider different limits for different user types
- Implement user-based limiting for authenticated users

#### **Rate Limit Bypassed**
- Check for proxy headers and IP spoofing
- Implement additional security measures
- Consider using distributed rate limiting with Redis

#### **False Positives**
- Review shared IP scenarios (corporate networks)
- Implement user-based limiting
- Add whitelist for trusted IPs

---

**Previous**: [Role-Based Access Control](./rbac.md)  
**Next**: [Security Features](./security.md)
