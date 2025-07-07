# 🛡️ **Security Features**

## 📋 **Overview**

This document covers the comprehensive security features implemented in the GIV Society API, including account protection, security monitoring, and threat prevention.

---

## 🔒 **Account Security**

### **Account Lockout Protection**
- **Failed Attempts Threshold**: 5 consecutive failed login attempts
- **Lockout Duration**: 15 minutes
- **Scope**: Per email + IP address combination
- **Reset Condition**: Successful login or timeout expiration

#### **Lockout Response**
```json
{
  "success": false,
  "errors": ["Account temporarily locked due to multiple failed attempts"],
  "code": "ACCOUNT_LOCKED",
  "lockoutUntil": "2024-07-07T10:15:00.000Z",
  "attemptsRemaining": 0,
  "lockoutDuration": 900
}
```

### **Password Security**
- **Hashing Algorithm**: bcrypt with 12 salt rounds
- **Password History**: Last 5 passwords stored (hashed)
- **Strength Validation**: Comprehensive password requirements
- **Automatic Rehashing**: Upgrades weak hashes automatically

### **Session Management**
- **Session Tracking**: All user sessions tracked with metadata
- **Session Termination**: Automatic termination on security events
- **Concurrent Sessions**: Multiple sessions allowed with monitoring
- **Session Timeout**: Configurable idle timeout

---

## 🔍 **Security Monitoring**

### **Security Event Logging**
All security-related events are logged with detailed metadata:

#### **Logged Events**
- Failed login attempts
- Successful logins
- Password changes
- Account lockouts
- Token generation/revocation
- Suspicious activity
- Permission violations
- Rate limit violations

#### **Log Entry Structure**
```json
{
  "id": "log_1234567890",
  "type": "FAILED_LOGIN",
  "severity": "WARNING",
  "user_id": "123",
  "email": "user@example.com",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "attempt_number": 3,
    "reason": "invalid_password",
    "location": "New York, US"
  },
  "timestamp": "2024-07-07T10:00:00.000Z"
}
```

### **Suspicious Activity Detection**
- **Multiple Failed Logins**: From same IP or user
- **Unusual Login Patterns**: New devices, locations, times
- **Token Abuse**: Excessive token refresh attempts
- **Permission Escalation**: Attempts to access unauthorized resources
- **Rapid Account Creation**: Multiple registrations from same IP

---

## 🚨 **Threat Prevention**

### **Brute Force Protection**
```javascript
// Account lockout after failed attempts
const trackFailedAttempt = async (email, ipAddress) => {
  const key = `${email}:${ipAddress}`;
  const attempts = await getFailedAttempts(key);
  
  if (attempts >= 5) {
    await lockAccount(key, 15 * 60 * 1000); // 15 minutes
    await logSecurityEvent('ACCOUNT_LOCKOUT', { email, ipAddress });
  }
};
```

### **Token Security**
- **Short-lived Access Tokens**: 15-minute expiration
- **Secure Refresh Tokens**: 7-day expiration with rotation
- **Token Blacklisting**: Revoked tokens stored in blacklist
- **Cryptographic Security**: Strong random token generation

### **Input Validation & Sanitization**
- **SQL Injection Prevention**: Parameterized queries with Prisma
- **XSS Prevention**: Input sanitization and output encoding
- **CSRF Protection**: SameSite cookies and token validation
- **File Upload Security**: Type validation and virus scanning

---

## 📧 **Security Notifications**

### **Email Alerts**
Users receive email notifications for security events:

#### **Password Changed**
```html
Subject: Your GIV Society Password Was Changed

Hello [Name],

Your password was successfully changed on [Date] at [Time] from IP [IP].

If you made this change, no action is needed.
If you didn't change your password, please contact us immediately.

Location: [City, Country]
Device: [Browser/Device Info]
```

#### **New Login Detected**
```html
Subject: New Login to Your GIV Society Account

Hello [Name],

A new login was detected on your account:

Date: [Date and Time]
Location: [City, Country]
Device: [Browser/Device Info]
IP Address: [IP]

If this was you, no action is needed.
If this wasn't you, please secure your account immediately.
```

#### **Account Locked**
```html
Subject: Your GIV Society Account Has Been Locked

Hello [Name],

Your account has been temporarily locked due to multiple failed login attempts.

The lock will be automatically removed in 15 minutes.
If you believe this is an error, please contact support.

Time of Lock: [Date and Time]
IP Address: [IP]
```

---

## 🔐 **API Security Headers**

### **Security Headers Set**
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

### **CORS Configuration**
```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 🔍 **Security Endpoints**

### **GET** `/auth/security/events`
Get user's security event history.

#### **Authentication**: Required

```json
{
  "success": true,
  "events": [
    {
      "id": "1",
      "type": "LOGIN",
      "description": "Successful login",
      "ip_address": "192.168.1.1",
      "location": "New York, US",
      "device": "Chrome on Windows",
      "timestamp": "2024-07-07T10:00:00.000Z",
      "risk_level": "LOW"
    },
    {
      "id": "2",
      "type": "PASSWORD_CHANGE",
      "description": "Password changed",
      "ip_address": "192.168.1.1",
      "timestamp": "2024-07-06T15:30:00.000Z",
      "risk_level": "MEDIUM"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

### **POST** `/auth/security/report-suspicious`
Report suspicious activity.

#### **Authentication**: Required

```json
{
  "type": "UNAUTHORIZED_ACCESS",
  "description": "Someone tried to access my account",
  "additional_info": "Received email about login from unknown location"
}
```

### **GET** `/auth/security/active-sessions`
Get all active user sessions.

#### **Authentication**: Required

```json
{
  "success": true,
  "sessions": [
    {
      "session_id": "sess_1234567890",
      "ip_address": "192.168.1.1",
      "location": "New York, US",
      "device": "Chrome on Windows",
      "created_at": "2024-07-07T10:00:00.000Z",
      "last_activity": "2024-07-07T12:00:00.000Z",
      "is_current": true
    }
  ]
}
```

### **DELETE** `/auth/security/sessions/:sessionId`
Terminate specific session.

#### **Authentication**: Required

```json
{
  "success": true,
  "message": "Session terminated successfully"
}
```

---

## 🔧 **Security Configuration**

### **Environment Variables**
```env
# Security settings
REQUIRE_EMAIL_VERIFICATION=true
ACCOUNT_LOCKOUT_ENABLED=true
ACCOUNT_LOCKOUT_ATTEMPTS=5
ACCOUNT_LOCKOUT_DURATION=900

# Password security
BCRYPT_ROUNDS=12
PASSWORD_HISTORY_COUNT=5
PASSWORD_MIN_LENGTH=8

# Session security
SESSION_TIMEOUT=3600
MAX_CONCURRENT_SESSIONS=5

# Security monitoring
SECURITY_LOGGING_ENABLED=true
SUSPICIOUS_ACTIVITY_DETECTION=true
```

### **Security Middleware Stack**
```javascript
// Security middleware order
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS
app.use(rateLimiter); // Rate limiting
app.use(authMiddleware); // Authentication
app.use(securityLogger); // Security logging
```

---

## 📊 **Security Metrics**

### **Monitored Metrics**
- Failed login attempts per hour/day
- Account lockouts per day
- Suspicious activity reports
- Token refresh frequency
- Session duration statistics
- Geographic login distribution

### **Security Dashboard Data**
```json
{
  "security_overview": {
    "failed_logins_24h": 45,
    "account_lockouts_24h": 3,
    "suspicious_activities_24h": 2,
    "active_sessions": 1247,
    "token_refreshes_24h": 8934
  },
  "threat_indicators": [
    {
      "type": "BRUTE_FORCE",
      "severity": "MEDIUM",
      "count": 12,
      "source_ips": ["192.168.1.100", "10.0.0.50"]
    }
  ]
}
```

---

## 🚀 **Security Best Practices**

### **For Users**
1. **Use strong, unique passwords**
2. **Enable email notifications**
3. **Regularly review active sessions**
4. **Report suspicious activity**
5. **Keep contact information updated**

### **For Developers**
1. **Always validate input**
2. **Use parameterized queries**
3. **Implement proper error handling**
4. **Log security events**
5. **Regular security audits**

### **For System Administrators**
1. **Monitor security logs**
2. **Review failed login patterns**
3. **Update security configurations**
4. **Respond to security alerts**
5. **Conduct regular security assessments**

---

## 🔍 **Incident Response**

### **Security Incident Types**
- **Data Breach**: Unauthorized access to user data
- **Account Compromise**: User account taken over
- **System Intrusion**: Unauthorized system access
- **DDoS Attack**: Service disruption attempts
- **Malware Detection**: Malicious code found

### **Response Procedures**
1. **Immediate Assessment**: Evaluate threat severity
2. **Containment**: Isolate affected systems
3. **Investigation**: Analyze attack vectors
4. **Notification**: Alert affected users
5. **Recovery**: Restore normal operations
6. **Post-Incident Review**: Improve security measures

---

## 📱 **Frontend Security Integration**

### **Security Event Monitoring**
```javascript
const SecurityDashboard = () => {
  const [securityEvents, setSecurityEvents] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  
  useEffect(() => {
    fetchSecurityEvents();
    fetchActiveSessions();
  }, []);
  
  const terminateSession = async (sessionId) => {
    try {
      await fetch(`/api/v1/auth/security/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // Refresh sessions list
      fetchActiveSessions();
      showSuccess('Session terminated successfully');
    } catch (error) {
      showError('Failed to terminate session');
    }
  };
  
  return (
    <div className="security-dashboard">
      <SecurityEvents events={securityEvents} />
      <ActiveSessions 
        sessions={activeSessions} 
        onTerminate={terminateSession} 
      />
    </div>
  );
};
```

---

**Previous**: [Rate Limiting](./rate-limiting.md)  
**Next**: [JWT Tokens](./jwt-tokens.md)
