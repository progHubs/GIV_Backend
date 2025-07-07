# 🔗 **Session Management**

## 📋 **Overview**

This document covers session management in the GIV Society API, including session creation, tracking, termination, and security features.

---

## 🎯 **Session Lifecycle**

### **Session Creation**
Sessions are automatically created during:
- User registration
- User login
- Token refresh (extends existing session)

### **Session Data Structure**
```json
{
  "session_id": "sess_1234567890abcdef",
  "user_id": "123",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "location": {
    "country": "United States",
    "region": "New York",
    "city": "New York",
    "timezone": "America/New_York"
  },
  "device_info": {
    "browser": "Chrome",
    "version": "91.0.4472.124",
    "os": "Windows",
    "device_type": "desktop"
  },
  "created_at": "2024-07-07T10:00:00.000Z",
  "last_activity": "2024-07-07T12:30:00.000Z",
  "expires_at": "2024-07-14T10:00:00.000Z",
  "is_active": true,
  "security_flags": {
    "is_suspicious": false,
    "risk_level": "LOW",
    "login_method": "password"
  }
}
```

---

## 🔍 **Session Tracking**

### **Tracked Information**
- **IP Address**: Client IP with proxy header support
- **User Agent**: Browser and device information
- **Geographic Location**: Country, region, city (IP-based)
- **Device Fingerprint**: Browser, OS, screen resolution
- **Activity Timestamps**: Creation, last activity, expiration
- **Security Metadata**: Risk assessment, login method

### **Activity Updates**
Sessions are updated on:
- API requests (last_activity timestamp)
- Token refresh operations
- Security-sensitive actions
- Location changes

---

## 📊 **Session Endpoints**

### **GET** `/auth/sessions`
Get all active sessions for the authenticated user.

#### **Authentication**: Required

#### **Response**
```json
{
  "success": true,
  "sessions": [
    {
      "session_id": "sess_1234567890abcdef",
      "ip_address": "192.168.1.1",
      "location": "New York, US",
      "device": "Chrome on Windows",
      "created_at": "2024-07-07T10:00:00.000Z",
      "last_activity": "2024-07-07T12:30:00.000Z",
      "is_current": true,
      "risk_level": "LOW"
    },
    {
      "session_id": "sess_0987654321fedcba",
      "ip_address": "10.0.0.1",
      "location": "San Francisco, US",
      "device": "Safari on iPhone",
      "created_at": "2024-07-06T14:20:00.000Z",
      "last_activity": "2024-07-06T18:45:00.000Z",
      "is_current": false,
      "risk_level": "LOW"
    }
  ],
  "total": 2,
  "current_session": "sess_1234567890abcdef"
}
```

### **DELETE** `/auth/sessions/:sessionId`
Terminate a specific session.

#### **Authentication**: Required

#### **Response**
```json
{
  "success": true,
  "message": "Session terminated successfully",
  "terminated_session": "sess_0987654321fedcba"
}
```

### **DELETE** `/auth/sessions/all`
Terminate all sessions except the current one.

#### **Authentication**: Required

#### **Request Body** (Optional)
```json
{
  "exclude_current": true,
  "reason": "Security precaution"
}
```

#### **Response**
```json
{
  "success": true,
  "message": "All sessions terminated successfully",
  "terminated_count": 3,
  "remaining_sessions": 1
}
```

### **GET** `/auth/sessions/:sessionId`
Get detailed information about a specific session.

#### **Authentication**: Required (Admin or session owner)

#### **Response**
```json
{
  "success": true,
  "session": {
    "session_id": "sess_1234567890abcdef",
    "user_id": "123",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "location": {
      "country": "United States",
      "region": "New York",
      "city": "New York",
      "coordinates": [40.7128, -74.0060]
    },
    "device_info": {
      "browser": "Chrome",
      "version": "91.0.4472.124",
      "os": "Windows 10",
      "device_type": "desktop"
    },
    "created_at": "2024-07-07T10:00:00.000Z",
    "last_activity": "2024-07-07T12:30:00.000Z",
    "expires_at": "2024-07-14T10:00:00.000Z",
    "activity_log": [
      {
        "action": "LOGIN",
        "timestamp": "2024-07-07T10:00:00.000Z",
        "ip": "192.168.1.1"
      },
      {
        "action": "API_REQUEST",
        "endpoint": "/auth/me",
        "timestamp": "2024-07-07T10:05:00.000Z"
      }
    ],
    "security_flags": {
      "is_suspicious": false,
      "risk_level": "LOW",
      "login_method": "password",
      "mfa_used": false
    }
  }
}
```

---

## 🔒 **Session Security**

### **Security Features**
- **IP Validation**: Track and validate IP changes
- **Device Fingerprinting**: Detect device changes
- **Geographic Monitoring**: Alert on location changes
- **Concurrent Session Limits**: Configurable maximum sessions
- **Automatic Termination**: Expire inactive sessions

### **Suspicious Activity Detection**
```javascript
const detectSuspiciousActivity = (session, newRequest) => {
  const flags = [];
  
  // IP address change
  if (session.ip_address !== newRequest.ip) {
    flags.push('IP_CHANGE');
  }
  
  // Geographic location change (significant distance)
  const distance = calculateDistance(session.location, newRequest.location);
  if (distance > 1000) { // 1000km threshold
    flags.push('LOCATION_CHANGE');
  }
  
  // Device fingerprint change
  if (session.device_fingerprint !== newRequest.device_fingerprint) {
    flags.push('DEVICE_CHANGE');
  }
  
  // Unusual time patterns
  if (isUnusualTime(newRequest.timestamp, session.user_timezone)) {
    flags.push('UNUSUAL_TIME');
  }
  
  return flags;
};
```

### **Risk Assessment**
```javascript
const calculateRiskLevel = (session, suspiciousFlags) => {
  let riskScore = 0;
  
  // Base risk factors
  if (suspiciousFlags.includes('IP_CHANGE')) riskScore += 30;
  if (suspiciousFlags.includes('LOCATION_CHANGE')) riskScore += 50;
  if (suspiciousFlags.includes('DEVICE_CHANGE')) riskScore += 40;
  if (suspiciousFlags.includes('UNUSUAL_TIME')) riskScore += 20;
  
  // Additional factors
  if (session.login_method === 'password_only') riskScore += 10;
  if (session.age_hours > 168) riskScore += 15; // Week-old session
  
  // Determine risk level
  if (riskScore >= 70) return 'HIGH';
  if (riskScore >= 40) return 'MEDIUM';
  return 'LOW';
};
```

---

## 🚨 **Session Alerts**

### **Security Notifications**
Users receive notifications for:
- New session creation from unknown device/location
- Session termination due to security concerns
- Multiple concurrent sessions detected
- Suspicious activity patterns

### **Email Templates**

#### **New Session Alert**
```html
Subject: New Login to Your GIV Society Account

Hello [Name],

A new session was created for your account:

📅 Date: [Date and Time]
📍 Location: [City, Country]
💻 Device: [Browser on OS]
🌐 IP Address: [IP Address]

If this was you, no action is needed.
If this wasn't you, please secure your account immediately.

[View All Sessions] [Secure My Account]
```

#### **Suspicious Activity Alert**
```html
Subject: Suspicious Activity Detected on Your Account

Hello [Name],

We detected unusual activity on your account:

⚠️ Activity: [Description]
📅 Time: [Date and Time]
📍 Location: [City, Country]
💻 Device: [Browser on OS]

We've temporarily flagged this session for review.

[Review Activity] [Secure My Account]
```

---

## 🔧 **Session Configuration**

### **Environment Variables**
```env
# Session settings
SESSION_DURATION=604800
MAX_CONCURRENT_SESSIONS=5
SESSION_CLEANUP_INTERVAL=3600

# Security settings
DETECT_SUSPICIOUS_ACTIVITY=true
LOCATION_CHANGE_THRESHOLD=1000
IP_CHANGE_ALERTS=true
DEVICE_CHANGE_ALERTS=true

# Notification settings
SEND_SESSION_ALERTS=true
SEND_SECURITY_NOTIFICATIONS=true
```

### **Session Cleanup**
```javascript
// Automatic cleanup of expired sessions
const cleanupExpiredSessions = async () => {
  const expiredSessions = await prisma.user_sessions.findMany({
    where: {
      expires_at: {
        lt: new Date()
      }
    }
  });
  
  for (const session of expiredSessions) {
    await terminateSession(session.session_id, 'EXPIRED');
  }
  
  logger.info(`Cleaned up ${expiredSessions.length} expired sessions`);
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
```

---

## 📱 **Frontend Integration**

### **Session Management Component**
```javascript
const SessionManager = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchSessions();
  }, []);
  
  const fetchSessions = async () => {
    try {
      const response = await apiRequest('/auth/sessions');
      setSessions(response.sessions);
    } catch (error) {
      showError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };
  
  const terminateSession = async (sessionId) => {
    try {
      await apiRequest(`/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      setSessions(sessions.filter(s => s.session_id !== sessionId));
      showSuccess('Session terminated successfully');
    } catch (error) {
      showError('Failed to terminate session');
    }
  };
  
  const terminateAllSessions = async () => {
    try {
      await apiRequest('/auth/sessions/all', {
        method: 'DELETE'
      });
      
      // Keep only current session
      setSessions(sessions.filter(s => s.is_current));
      showSuccess('All other sessions terminated');
    } catch (error) {
      showError('Failed to terminate sessions');
    }
  };
  
  if (loading) return <LoadingSpinner />;
  
  return (
    <div className="session-manager">
      <div className="session-header">
        <h3>Active Sessions</h3>
        <button onClick={terminateAllSessions} className="btn-danger">
          Terminate All Other Sessions
        </button>
      </div>
      
      <div className="session-list">
        {sessions.map(session => (
          <SessionCard
            key={session.session_id}
            session={session}
            onTerminate={terminateSession}
          />
        ))}
      </div>
    </div>
  );
};

const SessionCard = ({ session, onTerminate }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'HIGH': return 'red';
      case 'MEDIUM': return 'orange';
      case 'LOW': return 'green';
      default: return 'gray';
    }
  };
  
  return (
    <div className={`session-card ${session.is_current ? 'current' : ''}`}>
      <div className="session-info">
        <div className="device-info">
          <strong>{session.device}</strong>
          {session.is_current && <span className="current-badge">Current</span>}
        </div>
        <div className="location-info">
          📍 {session.location}
        </div>
        <div className="time-info">
          Last active: {formatRelativeTime(session.last_activity)}
        </div>
        <div className="risk-info">
          <span 
            className="risk-badge" 
            style={{ color: getRiskColor(session.risk_level) }}
          >
            {session.risk_level} Risk
          </span>
        </div>
      </div>
      
      {!session.is_current && (
        <button 
          onClick={() => onTerminate(session.session_id)}
          className="btn-outline-danger"
        >
          Terminate
        </button>
      )}
    </div>
  );
};
```

---

## 📊 **Session Analytics**

### **Session Metrics**
```json
{
  "session_analytics": {
    "total_active_sessions": 1247,
    "average_session_duration": 3600,
    "sessions_created_24h": 234,
    "sessions_terminated_24h": 189,
    "concurrent_sessions_avg": 1.8,
    "geographic_distribution": {
      "United States": 45.2,
      "Canada": 12.8,
      "United Kingdom": 8.9,
      "Germany": 6.1,
      "Other": 27.0
    },
    "device_distribution": {
      "Desktop": 62.3,
      "Mobile": 31.7,
      "Tablet": 6.0
    },
    "browser_distribution": {
      "Chrome": 58.2,
      "Safari": 23.1,
      "Firefox": 12.4,
      "Edge": 4.8,
      "Other": 1.5
    }
  }
}
```

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **Session Not Found**
- Session may have expired
- Session may have been terminated
- Invalid session ID provided

#### **Too Many Sessions**
- User has reached concurrent session limit
- Terminate old sessions to create new ones
- Consider increasing session limit for power users

#### **Suspicious Activity Alerts**
- Review session details for legitimacy
- Check for VPN or proxy usage
- Verify user's travel patterns

---

**Previous**: [JWT Tokens](./jwt-tokens.md)  
**Next**: [Email Verification](./email-verification.md)
