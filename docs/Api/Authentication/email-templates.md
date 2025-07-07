# 📧 **Email Templates**

## 📋 **Overview**

This document covers all email templates used in the GIV Society API, including authentication emails, notifications, and system communications.

---

## 🎨 **Template Structure**

### **Base Template**
All emails use a consistent base template with:
- **Header**: Logo and branding
- **Content**: Dynamic content area
- **Footer**: Unsubscribe links and legal information
- **Responsive Design**: Mobile-friendly layout

### **Template Variables**
```javascript
const templateVariables = {
  // User information
  user_name: 'John Doe',
  user_email: 'user@example.com',
  user_id: '123',
  
  // URLs
  frontend_url: 'https://givsociety.org',
  verification_url: 'https://givsociety.org/verify-email/token',
  reset_url: 'https://givsociety.org/reset-password/token',
  unsubscribe_url: 'https://givsociety.org/unsubscribe/token',
  
  // Branding
  logo_url: 'https://givsociety.org/logo.png',
  company_name: 'GIV Society',
  support_email: 'support@givsociety.org',
  
  // Dynamic content
  verification_token: 'abc123...',
  reset_token: 'def456...',
  expires_at: '2024-07-07T10:00:00.000Z'
};
```

---

## 🔐 **Authentication Templates**

### **1. Welcome & Email Verification**
```html
Subject: Welcome to GIV Society - Verify Your Email

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to GIV Society</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #007bff, #0056b3); padding: 30px 20px; text-align: center; }
        .logo { height: 50px; }
        .content { padding: 40px 30px; }
        .button { background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{logo_url}}" alt="GIV Society" class="logo">
            <h1 style="color: white; margin: 20px 0 0 0;">Welcome to GIV Society!</h1>
        </div>
        
        <div class="content">
            <h2 style="color: #333; margin-bottom: 20px;">Hi {{user_name}},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Thank you for joining GIV Society! We're excited to have you as part of our community 
                dedicated to making a positive impact in the world.
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
                To get started and access all features, please verify your email address by clicking 
                the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{verification_url}}" class="button">
                    Verify Email Address
                </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
                <br>
                <a href="{{verification_url}}">{{verification_url}}</a>
            </p>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1976d2; margin-top: 0;">What's Next?</h3>
                <ul style="color: #666; margin: 0;">
                    <li>Complete your profile</li>
                    <li>Explore active campaigns</li>
                    <li>Join volunteer opportunities</li>
                    <li>Connect with the community</li>
                </ul>
            </div>
            
            <p style="color: #999; font-size: 12px;">
                This verification link expires in 24 hours. If you didn't create this account, 
                please ignore this email.
            </p>
        </div>
        
        <div class="footer">
            <p>© 2024 {{company_name}}. All rights reserved.</p>
            <p>
                <a href="{{frontend_url}}/privacy">Privacy Policy</a> | 
                <a href="{{frontend_url}}/terms">Terms of Service</a> | 
                <a href="{{unsubscribe_url}}">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
```

### **2. Password Reset**
```html
Subject: Reset Your GIV Society Password

<div class="container">
    <div class="header">
        <img src="{{logo_url}}" alt="GIV Society" class="logo">
        <h1 style="color: white; margin: 20px 0 0 0;">Password Reset Request</h1>
    </div>
    
    <div class="content">
        <h2 style="color: #333;">Hi {{user_name}},</h2>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your GIV Society account.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{reset_url}}" class="button">
                Reset Password
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link:
            <br>
            <a href="{{reset_url}}">{{reset_url}}</a>
        </p>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
                <strong>Security Notice:</strong> This link expires in 10 minutes for your security.
                If you didn't request this reset, please ignore this email and consider changing 
                your password if you suspect unauthorized access.
            </p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            For security reasons, we recommend:
        </p>
        <ul style="color: #666; font-size: 14px;">
            <li>Using a strong, unique password</li>
            <li>Not sharing your password with anyone</li>
            <li>Logging out from shared devices</li>
        </ul>
    </div>
</div>
```

### **3. Password Changed Confirmation**
```html
Subject: Your GIV Society Password Was Changed

<div class="content">
    <h2 style="color: #333;">Hi {{user_name}},</h2>
    
    <p style="color: #666; font-size: 16px;">
        Your password was successfully changed on {{change_date}} at {{change_time}}.
    </p>
    
    <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #155724; margin-top: 0;">Change Details:</h3>
        <ul style="color: #155724; margin: 0;">
            <li><strong>Date:</strong> {{change_date}}</li>
            <li><strong>Time:</strong> {{change_time}}</li>
            <li><strong>Location:</strong> {{location}}</li>
            <li><strong>Device:</strong> {{device_info}}</li>
        </ul>
    </div>
    
    <p style="color: #666; font-size: 16px;">
        If you made this change, no further action is required.
    </p>
    
    <div style="background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #721c24; margin: 0; font-size: 14px;">
            <strong>Didn't change your password?</strong> If you didn't make this change, 
            your account may be compromised. Please contact our support team immediately 
            at {{support_email}}.
        </p>
    </div>
</div>
```

---

## 🔔 **Security Notification Templates**

### **4. New Login Alert**
```html
Subject: New Login to Your GIV Society Account

<div class="content">
    <h2 style="color: #333;">Hi {{user_name}},</h2>
    
    <p style="color: #666; font-size: 16px;">
        We detected a new login to your GIV Society account:
    </p>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1976d2; margin-top: 0;">Login Details:</h3>
        <table style="width: 100%; color: #666;">
            <tr><td><strong>Date & Time:</strong></td><td>{{login_date}} at {{login_time}}</td></tr>
            <tr><td><strong>Location:</strong></td><td>{{location}}</td></tr>
            <tr><td><strong>Device:</strong></td><td>{{device_info}}</td></tr>
            <tr><td><strong>IP Address:</strong></td><td>{{ip_address}}</td></tr>
        </table>
    </div>
    
    <p style="color: #666; font-size: 16px;">
        If this was you, no action is needed.
    </p>
    
    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #856404; margin: 0;">
            <strong>Wasn't you?</strong> If you don't recognize this login, please secure 
            your account immediately by changing your password and reviewing your active sessions.
        </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
        <a href="{{frontend_url}}/security" class="button">
            Review Security Settings
        </a>
    </div>
</div>
```

### **5. Account Locked**
```html
Subject: Your GIV Society Account Has Been Temporarily Locked

<div class="content">
    <h2 style="color: #333;">Hi {{user_name}},</h2>
    
    <p style="color: #666; font-size: 16px;">
        Your account has been temporarily locked due to multiple failed login attempts.
    </p>
    
    <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #721c24; margin-top: 0;">Lockout Details:</h3>
        <ul style="color: #721c24; margin: 0;">
            <li><strong>Locked at:</strong> {{lockout_time}}</li>
            <li><strong>Unlock time:</strong> {{unlock_time}}</li>
            <li><strong>Failed attempts:</strong> {{failed_attempts}}</li>
            <li><strong>IP Address:</strong> {{ip_address}}</li>
        </ul>
    </div>
    
    <p style="color: #666; font-size: 16px;">
        Your account will be automatically unlocked in {{lockout_duration}} minutes.
    </p>
    
    <div style="background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="color: #0c5460; margin: 0;">
            <strong>Security Tip:</strong> If you're having trouble remembering your password, 
            you can reset it once your account is unlocked.
        </p>
    </div>
</div>
```

---

## 📢 **System Notification Templates**

### **6. Welcome Email (Post-Verification)**
```html
Subject: Welcome to GIV Society - Let's Make a Difference Together!

<div class="content">
    <h2 style="color: #333;">Welcome aboard, {{user_name}}! 🎉</h2>
    
    <p style="color: #666; font-size: 16px;">
        Your email has been verified and your account is now fully activated! 
        We're thrilled to have you join our community of changemakers.
    </p>
    
    <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2e7d32; margin-top: 0;">Get Started:</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
            <a href="{{frontend_url}}/profile/complete" style="background: #4caf50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Complete Profile
            </a>
            <a href="{{frontend_url}}/campaigns" style="background: #2196f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Explore Campaigns
            </a>
            <a href="{{frontend_url}}/events" style="background: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Find Events
            </a>
        </div>
    </div>
    
    <h3 style="color: #333;">What You Can Do:</h3>
    <ul style="color: #666; font-size: 16px; line-height: 1.6;">
        <li><strong>Support Causes:</strong> Donate to campaigns that matter to you</li>
        <li><strong>Volunteer:</strong> Join events and contribute your time and skills</li>
        <li><strong>Create Impact:</strong> Start your own campaigns and initiatives</li>
        <li><strong>Connect:</strong> Network with like-minded individuals</li>
    </ul>
</div>
```

### **7. Account Deletion Confirmation**
```html
Subject: Your GIV Society Account Has Been Deleted

<div class="content">
    <h2 style="color: #333;">Account Deletion Confirmed</h2>
    
    <p style="color: #666; font-size: 16px;">
        Your GIV Society account has been successfully deleted as requested on {{deletion_date}}.
    </p>
    
    <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">What Happens Next:</h3>
        <ul style="color: #856404; margin: 0;">
            <li>Your personal data has been permanently removed</li>
            <li>Your contributions and donations remain anonymized</li>
            <li>You'll stop receiving emails from us</li>
            <li>Your account cannot be recovered</li>
        </ul>
    </div>
    
    <p style="color: #666; font-size: 16px;">
        Thank you for being part of the GIV Society community. We hope you'll consider 
        rejoining us in the future to continue making a positive impact.
    </p>
    
    <p style="color: #666; font-size: 14px;">
        If you deleted your account by mistake, you can create a new account at any time 
        by visiting {{frontend_url}}.
    </p>
</div>
```

---

## 🎨 **Template Customization**

### **Template Engine**
```javascript
const renderTemplate = (templateName, variables) => {
  const template = getTemplate(templateName);
  
  // Replace variables in template
  let rendered = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value);
  }
  
  return rendered;
};
```

### **Localization Support**
```javascript
const getLocalizedTemplate = (templateName, language = 'en') => {
  const templates = {
    en: require('./templates/en'),
    am: require('./templates/am')
  };
  
  return templates[language]?.[templateName] || templates.en[templateName];
};
```

### **Dynamic Content**
```javascript
const generateEmailContent = (type, user, data = {}) => {
  const baseVariables = {
    user_name: user.full_name,
    user_email: user.email,
    user_id: user.id.toString(),
    frontend_url: process.env.FRONTEND_URL,
    logo_url: `${process.env.FRONTEND_URL}/logo.png`,
    company_name: 'GIV Society',
    support_email: 'support@givsociety.org',
    unsubscribe_url: `${process.env.FRONTEND_URL}/unsubscribe/${user.id}`
  };
  
  const variables = { ...baseVariables, ...data };
  
  return renderTemplate(type, variables);
};
```

---

## 📊 **Email Analytics**

### **Template Performance**
```json
{
  "email_analytics": {
    "templates": {
      "welcome_verification": {
        "sent": 1247,
        "delivered": 1198,
        "opened": 892,
        "clicked": 567,
        "open_rate": 74.5,
        "click_rate": 47.3
      },
      "password_reset": {
        "sent": 234,
        "delivered": 228,
        "opened": 201,
        "clicked": 189,
        "open_rate": 88.2,
        "click_rate": 94.0
      }
    }
  }
}
```

### **A/B Testing**
```javascript
const getTemplateVariant = (templateName, userId) => {
  // Simple A/B testing based on user ID
  const variant = userId % 2 === 0 ? 'A' : 'B';
  return `${templateName}_${variant}`;
};
```

---

## 🔧 **Configuration**

### **Email Service Setup**
```env
# Email service configuration
EMAIL_SERVICE=resend
RESEND_API_KEY=your-resend-api-key
RESEND_SENDER=GIV Society <noreply@givsociety.org>

# Template settings
EMAIL_TEMPLATE_PATH=./templates
DEFAULT_LANGUAGE=en
ENABLE_EMAIL_TRACKING=true

# URLs
FRONTEND_URL=https://givsociety.org
LOGO_URL=https://givsociety.org/logo.png
```

### **Template Management**
```javascript
const emailTemplates = {
  WELCOME_VERIFICATION: 'welcome_verification',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGED: 'password_changed',
  NEW_LOGIN: 'new_login',
  ACCOUNT_LOCKED: 'account_locked',
  WELCOME_POST_VERIFICATION: 'welcome_post_verification',
  ACCOUNT_DELETED: 'account_deleted'
};
```

---

**Previous**: [Email Verification](./email-verification.md)  
**Next**: [Error Codes](./error-codes.md)
