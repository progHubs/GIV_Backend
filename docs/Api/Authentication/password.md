# 🔑 **Password Management**

## 📋 **Overview**

This document covers password-related operations including password changes, password reset requests, and password security features.

---

## 🔄 **Change Password**

### **PUT** `/auth/change-password`

Change password for authenticated user.

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
  "current_password": "CurrentPassword123!",
  "new_password": "NewSecurePassword456!",
  "confirm_password": "NewSecurePassword456!"
}
```

#### **Validation Rules**
- **current_password**: Must match user's current password
- **new_password**: Must meet password strength requirements
- **confirm_password**: Must match new_password
- **new_password**: Cannot be the same as current password
- **new_password**: Cannot be any of the last 5 passwords used

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully",
  "password_strength": {
    "score": 85,
    "level": "Strong"
  },
  "security_actions": {
    "sessions_terminated": 2,
    "tokens_revoked": true,
    "notification_sent": true
  }
}
```

#### **Error Responses**
```json
// Current Password Incorrect (400)
{
  "success": false,
  "errors": ["Current password is incorrect"],
  "code": "INVALID_CURRENT_PASSWORD"
}

// Weak Password (400)
{
  "success": false,
  "errors": [
    "Password must be at least 8 characters long",
    "Password must contain at least one uppercase letter"
  ],
  "code": "WEAK_PASSWORD",
  "password_strength": {
    "score": 35,
    "level": "Weak",
    "suggestions": [
      "Add uppercase letters",
      "Add special characters",
      "Increase length"
    ]
  }
}

// Password Recently Used (400)
{
  "success": false,
  "errors": ["Cannot reuse any of your last 5 passwords"],
  "code": "PASSWORD_RECENTLY_USED"
}
```

---

## 📧 **Request Password Reset**

### **POST** `/auth/request-password-reset`

Request password reset email for user account.

#### **Rate Limit**: 3 requests per hour per IP

#### **Request Body**
```json
{
  "email": "user@example.com"
}
```

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "message": "If an account with this email exists, a password reset link has been sent.",
  "email_sent": true,
  "expires_in": 600
}
```

#### **Security Notes**
- Always returns success to prevent email enumeration
- Reset tokens expire in 10 minutes
- Only one active reset token per user
- Previous reset tokens are invalidated

#### **Error Responses**
```json
// Rate Limit (429)
{
  "success": false,
  "errors": ["Too many password reset requests from this IP, please try again later."],
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600
}

// Invalid Email Format (400)
{
  "success": false,
  "errors": ["Please provide a valid email address"],
  "code": "VALIDATION_ERROR"
}
```

---

## 🔓 **Reset Password**

### **POST** `/auth/reset-password`

Reset password using reset token from email.

#### **Rate Limit**: General API limit

#### **Request Body**
```json
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePassword456!",
  "confirm_password": "NewSecurePassword456!"
}
```

#### **Validation Rules**
- **token**: Valid, non-expired reset token
- **new_password**: Must meet password strength requirements
- **confirm_password**: Must match new_password

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "message": "Password reset successfully",
  "password_strength": {
    "score": 90,
    "level": "Very Strong"
  },
  "security_actions": {
    "all_sessions_terminated": true,
    "all_tokens_revoked": true,
    "notification_sent": true,
    "security_log_created": true
  }
}
```

#### **Error Responses**
```json
// Invalid Token (400)
{
  "success": false,
  "errors": ["Invalid or expired reset token"],
  "code": "INVALID_RESET_TOKEN"
}

// Token Expired (400)
{
  "success": false,
  "errors": ["Reset token has expired. Please request a new one."],
  "code": "TOKEN_EXPIRED"
}

// Weak Password (400)
{
  "success": false,
  "errors": [
    "Password must contain at least one special character"
  ],
  "code": "WEAK_PASSWORD",
  "password_strength": {
    "score": 45,
    "level": "Weak"
  }
}
```

---

## 🔍 **Password Strength Check**

### **POST** `/auth/check-password-strength`

Check password strength without saving (utility endpoint).

#### **Rate Limit**: General API limit

#### **Request Body**
```json
{
  "password": "TestPassword123!"
}
```

#### **Success Response** (200 OK)
```json
{
  "success": true,
  "strength": {
    "score": 85,
    "level": "Strong",
    "is_valid": true,
    "requirements_met": {
      "min_length": true,
      "has_uppercase": true,
      "has_lowercase": true,
      "has_number": true,
      "has_special": true,
      "not_common": true,
      "no_sequences": true
    },
    "suggestions": [],
    "estimated_crack_time": "3 years"
  }
}
```

#### **Weak Password Response** (200 OK)
```json
{
  "success": true,
  "strength": {
    "score": 25,
    "level": "Very Weak",
    "is_valid": false,
    "requirements_met": {
      "min_length": false,
      "has_uppercase": false,
      "has_lowercase": true,
      "has_number": true,
      "has_special": false,
      "not_common": false,
      "no_sequences": true
    },
    "suggestions": [
      "Increase password length to at least 8 characters",
      "Add uppercase letters",
      "Add special characters",
      "Avoid common passwords"
    ],
    "estimated_crack_time": "instantly"
  }
}
```

---

## 📊 **Password Requirements**

### **Minimum Requirements**
- **Length**: At least 8 characters
- **Uppercase**: At least 1 uppercase letter (A-Z)
- **Lowercase**: At least 1 lowercase letter (a-z)
- **Numbers**: At least 1 digit (0-9)
- **Special Characters**: At least 1 special character (!@#$%^&*()_+-=[]{}|;:,.<>?)

### **Security Restrictions**
- Cannot be common passwords (password, 123456, etc.)
- Cannot contain repeated characters (aaa, 111)
- Cannot contain keyboard sequences (qwerty, 123456)
- Cannot be the same as current password
- Cannot be any of the last 5 passwords used
- Cannot contain user's email or name

### **Password Strength Levels**
| Score | Level | Description |
|-------|-------|-------------|
| 0-20 | Very Weak | Easily cracked, fails basic requirements |
| 21-40 | Weak | Meets some requirements but vulnerable |
| 41-60 | Fair | Meets basic requirements, moderate security |
| 61-80 | Strong | Good security, meets all requirements |
| 81-100 | Very Strong | Excellent security, exceeds requirements |

---

## 🔐 **Security Features**

### **Password Change Security**
- Current password verification required
- All sessions terminated after password change
- All tokens revoked and blacklisted
- Security notification email sent
- Password change logged for audit

### **Password Reset Security**
- Reset tokens expire in 10 minutes
- One-time use tokens
- Secure token generation (cryptographically random)
- All sessions terminated after reset
- IP address and user agent logged
- Security notification email sent

### **Password Storage**
- Passwords hashed with bcrypt (12 rounds)
- Salt automatically generated per password
- Password history stored (hashed) for reuse prevention
- Automatic hash upgrade when needed

---

## 📧 **Email Templates**

### **Password Reset Email**
```html
Subject: Reset Your GIV Society Password

Hello [Name],

You requested a password reset for your GIV Society account.

Click the link below to reset your password:
[Reset Password Button]

This link expires in 10 minutes for security.

If you didn't request this, please ignore this email.

Best regards,
GIV Society Team
```

### **Password Changed Email**
```html
Subject: Your GIV Society Password Was Changed

Hello [Name],

Your password was successfully changed on [Date] at [Time].

If you made this change, no action is needed.

If you didn't change your password, please contact us immediately.

Best regards,
GIV Society Team
```

---

## 📱 **Frontend Integration Examples**

### **Change Password**
```javascript
const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  try {
    const response = await fetch('/api/v1/auth/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Password changed successfully');
      // Force re-login due to token revocation
      logout();
    } else {
      showError(data.errors[0]);
    }
  } catch (error) {
    showError('Failed to change password');
  }
};
```

### **Password Strength Checker**
```javascript
const checkPasswordStrength = async (password) => {
  try {
    const response = await fetch('/api/v1/auth/check-password-strength', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      updatePasswordStrengthUI(data.strength);
    }
  } catch (error) {
    console.error('Failed to check password strength:', error);
  }
};

const updatePasswordStrengthUI = (strength) => {
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  
  strengthBar.style.width = `${strength.score}%`;
  strengthBar.className = `strength-bar ${strength.level.toLowerCase().replace(' ', '-')}`;
  strengthText.textContent = strength.level;
  
  // Show suggestions
  const suggestionsList = document.getElementById('suggestions');
  suggestionsList.innerHTML = strength.suggestions
    .map(suggestion => `<li>${suggestion}</li>`)
    .join('');
};
```

### **Request Password Reset**
```javascript
const requestPasswordReset = async (email) => {
  try {
    const response = await fetch('/api/v1/auth/request-password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Password reset instructions sent to your email');
    } else {
      showError(data.errors[0]);
    }
  } catch (error) {
    showError('Failed to request password reset');
  }
};
```

---

**Previous**: [User Profile Management](./profile.md)  
**Next**: [Role-Based Access Control](./rbac.md)
