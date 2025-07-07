# 🛡️ **Role-Based Access Control (RBAC)**

## 📋 **Overview**

This document covers the role-based access control system, user roles, permissions, and authorization middleware used throughout the GIV Society API.

---

## 👥 **User Roles & Profile System**

### **Base User Roles**

The GIV Society API uses a **simplified two-tier role system** with **profile flags**:

| Role    | Description          | Access Level                                        |
| ------- | -------------------- | --------------------------------------------------- |
| `admin` | System Administrator | Full access to all resources and admin functions    |
| `user`  | Regular User         | Standard user access with profile-based permissions |

### **Profile Flags System**

Users have **boolean flags** that determine additional capabilities:

| Flag             | Description                     | Purpose                                            |
| ---------------- | ------------------------------- | -------------------------------------------------- |
| `is_donor`       | User has donor capabilities     | Access to donation features and donor profile      |
| `is_volunteer`   | User has volunteer capabilities | Access to volunteer features and volunteer profile |
| `email_verified` | Email address verified          | Required for most platform features                |

### **Role & Profile Combinations**

#### **🔴 Admin (`admin`)**

- **Full system access** to all resources and operations
- **User management** - create, update, delete users
- **Content management** - manage all campaigns, events
- **System configuration** - manage settings, view analytics
- **Security management** - view logs, manage permissions
- **Can have donor/volunteer flags** for testing purposes

#### **🟢 Regular User (`user`)**

- **Profile management** - manage own profile
- **Public content access** - view campaigns, events (no authentication required)
- **Event registration** - register for any event (automatically sets `is_volunteer` flag)
- **Donation creation** - make donations (automatically sets `is_donor` flag)
- **Anonymous donations** - can donate without authentication

### **🎯 Automatic Flag Assignment**

The system **automatically assigns profile flags** when users perform certain actions:

#### **Donor Flag (`is_donor: true`)**

- **Automatically set** when user makes their first donation
- **Triggers creation** of `donor_profiles` record
- **Enables access** to donation history and tax receipts
- **No special middleware required** - any authenticated user can donate

#### **Volunteer Flag (`is_volunteer: true`)**

- **Automatically set** when user registers for their first event
- **Triggers creation** of `volunteer_profiles` record
- **Enables access** to volunteer-specific features
- **No special middleware required** - any authenticated user can register for events

#### **Combined Flags (Both `is_donor` and `is_volunteer`)**

- **Users can have both flags** by donating AND registering for events
- **Full platform participation** capabilities
- **No conflicts** between donor and volunteer activities

---

## 🔐 **Authorization Middleware**

### **Available Middleware Functions**

Based on the actual implementation in `src/middlewares/auth.middleware.js`:

#### **1. authenticateToken**

```javascript
// Middleware: authenticateToken
// Usage: Requires valid JWT token and attaches user to req.user
router.get("/protected", authenticateToken, controller.method);
```

#### **2. optionalAuth**

```javascript
// Middleware: optionalAuth
// Usage: Adds user to req.user if token provided, but doesn't fail if missing
router.get("/public-with-optional-auth", optionalAuth, controller.method);
```

#### **3. requireRole**

```javascript
// Middleware: requireRole
// Usage: Requires specific role(s) - currently supports 'admin' and 'user'
router.get(
    "/admin-only",
    authenticateToken,
    requireRole("admin"),
    controller.method
);
```

#### **4. requireAdmin**

```javascript
// Middleware: requireAdmin (shorthand for requireRole('admin'))
// Usage: Requires admin role
router.delete(
    "/users/:id",
    authenticateToken,
    requireAdmin,
    controller.deleteUser
);
router.get(
    "/admin/dashboard",
    authenticateToken,
    requireAdmin,
    controller.adminDashboard
);
```

#### **5. requireUser**

```javascript
// Middleware: requireUser (shorthand for requireRole('user'))
// Usage: Requires user role (any authenticated user)
router.get(
    "/user-profile",
    authenticateToken,
    requireUser,
    controller.getUserProfile
);
```

#### **6. requireDonorFlag**

```javascript
// Middleware: requireDonorFlag
// Usage: Requires user to have is_donor flag set to true
router.get(
    "/donations",
    authenticateToken,
    requireDonorFlag,
    controller.getDonations
);
router.post(
    "/donations",
    authenticateToken,
    requireDonorFlag,
    controller.createDonation
);
```

#### **7. requireVolunteerFlag**

```javascript
// Middleware: requireVolunteerFlag
// Usage: Requires user to have is_volunteer flag set to true
router.get(
    "/volunteer-hours",
    authenticateToken,
    requireVolunteerFlag,
    controller.getHours
);
router.post(
    "/events/:id/register",
    authenticateToken,
    requireVolunteerFlag,
    controller.registerForEvent
);
```

#### **8. requireEmailVerification**

```javascript
// Middleware: requireEmailVerification
// Usage: Requires user to have verified email
router.get(
    "/verified-only",
    authenticateToken,
    requireEmailVerification,
    controller.method
);
```

#### **9. requireActiveUser**

```javascript
// Middleware: requireActiveUser
// Usage: Requires user account to be active (not deleted)
router.get(
    "/active-only",
    authenticateToken,
    requireActiveUser,
    controller.method
);
```

---

## 🔒 **Permission Matrix**

### **User Management**

| Operation          | Admin | User | Notes                               |
| ------------------ | ----- | ---- | ----------------------------------- |
| View all users     | ✅    | ❌   | Admin only                          |
| View own profile   | ✅    | ✅   | Users can view their own profile    |
| Update own profile | ✅    | ✅   | Users can update their own profile  |
| Update any user    | ✅    | ❌   | Admin only                          |
| Delete any user    | ✅    | ❌   | Admin only                          |
| Create user        | ✅    | ❌   | Admin only (or public registration) |

### **Campaign Management**

| Operation          | Admin | User | User + Donor | User + Volunteer |
| ------------------ | ----- | ---- | ------------ | ---------------- |
| View campaigns     | ✅    | ✅   | ✅           | ✅               |
| Create campaign    | ✅    | ❌   | ❌           | ❌               |
| Update campaign    | ✅    | ❌   | ❌           | ❌               |
| Delete campaign    | ✅    | ❌   | ❌           | ❌               |
| Donate to campaign | ✅    | ✅   | ✅           | ✅               |

### **Event Management**

| Operation          | Admin | User | Anonymous | Notes                                             |
| ------------------ | ----- | ---- | --------- | ------------------------------------------------- |
| View events        | ✅    | ✅   | ✅        | Public access                                     |
| Create event       | ✅    | ❌   | ❌        | Admin only                                        |
| Update event       | ✅    | ❌   | ❌        | Admin only                                        |
| Delete event       | ✅    | ❌   | ❌        | Admin only                                        |
| Register for event | ✅    | ✅   | ❌        | Any authenticated user (sets `is_volunteer` flag) |

### **Donation Management**

| Operation              | Admin | User | Anonymous | Notes                                                            |
| ---------------------- | ----- | ---- | --------- | ---------------------------------------------------------------- |
| View all donations     | ✅    | ❌   | ❌        | Admin only                                                       |
| View own donations     | ✅    | ✅   | ❌        | Authenticated users with donations                               |
| Make donation          | ✅    | ✅   | ✅        | Anyone can donate (sets `is_donor` flag for authenticated users) |
| Update donation status | ✅    | ❌   | ❌        | Admin only                                                       |
| Delete donation        | ✅    | ❌   | ❌        | Admin only                                                       |
| Search donations       | ✅    | ✅   | ❌        | Admin sees all, users see own                                    |

### **Volunteer Management**

| Operation                  | Admin | User | User + Donor | User + Volunteer |
| -------------------------- | ----- | ---- | ------------ | ---------------- |
| View all volunteers        | ✅    | ❌   | ❌           | ❌               |
| View own volunteer profile | ✅    | ❌   | ❌           | ✅               |
| Update volunteer profile   | ✅    | ❌   | ❌           | ✅ (own only)    |
| Track volunteer hours      | ✅    | ❌   | ❌           | ✅ (own only)    |
| Manage volunteer skills    | ✅    | ❌   | ❌           | ✅ (own only)    |

---

## 🔧 **Implementation Examples**

### **Route Protection Examples**

#### **Admin-Only Routes**

```javascript
// Admin dashboard - requires admin role
router.get(
    "/admin/dashboard",
    authenticateToken,
    requireAdmin,
    adminController.getDashboard
);

// User management - admin only
router.get(
    "/admin/users",
    authenticateToken,
    requireAdmin,
    userController.getAllUsers
);

router.delete(
    "/admin/users/:id",
    authenticateToken,
    requireAdmin,
    userController.deleteUser
);
```

#### **Donation Routes (No Special Middleware Required)**

```javascript
// Donation creation - anyone can donate (anonymous or authenticated)
router.post(
    "/donations",
    optionalAuthenticateToken, // Optional authentication
    donationController.createDonation
);

// View donations - authenticated users only
router.get(
    "/donations",
    authenticateToken,
    donationController.getDonations // Service layer handles access control
);

// Search donations - authenticated users only
router.get(
    "/donations/search",
    authenticateToken,
    donationController.searchDonations // Service layer handles access control
);

// Admin-only donation routes
router.get(
    "/donations/stats",
    authenticateToken,
    requireAdmin,
    donationController.getDonationStats
);
```

#### **Event Routes (No Special Middleware Required)**

```javascript
// Event registration - any authenticated user can register
router.post(
    "/events/:id/register",
    authenticateToken, // Only requires authentication
    eventController.registerForEvent // Service automatically sets is_volunteer flag
);

// View participants - authenticated users (access control in service)
router.get(
    "/events/:id/participants",
    authenticateToken,
    eventController.listParticipants // Service handles access control
);

// Admin-only event routes
router.post(
    "/events",
    authenticateToken,
    requireAdmin,
    eventController.createEvent
);

router.patch(
    "/events/:id",
    authenticateToken,
    requireAdmin,
    eventController.updateEvent
);
```

#### **Mixed Access Routes**

```javascript
// Public content with optional authentication
router.get(
    "/campaigns",
    optionalAuth, // User info added if token provided
    campaignController.getCampaigns
);

// Email verification required
router.get(
    "/verified-content",
    authenticateToken,
    requireEmailVerification,
    contentController.getVerifiedContent
);
```

### **Controller-Level Authorization**

```javascript
// Example controller with role checking
const getUserProfile = async (req, res) => {
    try {
        // User is already attached by authenticateToken middleware
        const userId = req.user.id;

        // Users can only access their own profile unless admin
        if (req.user.role !== "admin" && userId !== req.params.id) {
            return res.status(403).json({
                success: false,
                errors: ["Access denied"],
                code: "INSUFFICIENT_PERMISSIONS",
            });
        }

        const user = await userService.getUserById(userId);
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, errors: [error.message] });
    }
};

// Example donation controller with donor flag check
const createDonation = async (req, res) => {
    try {
        // requireDonorFlag middleware already checked is_donor flag
        const donation = await donationService.createDonation({
            ...req.body,
            donor_id: req.user.id,
        });

        res.status(201).json({ success: true, data: donation });
    } catch (error) {
        res.status(500).json({ success: false, errors: [error.message] });
    }
};
```

---

## 🚨 **Authorization Errors**

### **Common Error Responses**

#### **Missing Authentication (401)**

```json
{
    "success": false,
    "errors": ["Access token is required"],
    "code": "MISSING_TOKEN"
}
```

#### **Invalid Token (401)**

```json
{
    "success": false,
    "errors": ["Invalid or expired token"],
    "code": "INVALID_TOKEN"
}
```

#### **Insufficient Permissions (403)**

```json
{
    "success": false,
    "errors": ["Insufficient permissions"],
    "code": "INSUFFICIENT_PERMISSIONS",
    "requiredRoles": ["admin"],
    "userRole": "user"
}
```

#### **Email Not Verified (403)**

```json
{
    "success": false,
    "errors": ["Email verification required"],
    "code": "EMAIL_NOT_VERIFIED"
}
```

#### **Missing Profile Flag (403)**

```json
{
    "success": false,
    "errors": ["Donor profile required"],
    "code": "DONOR_PROFILE_REQUIRED"
}
```

```json
{
    "success": false,
    "errors": ["Volunteer profile required"],
    "code": "VOLUNTEER_PROFILE_REQUIRED"
}
```

---

## 📱 **Frontend Integration**

### **Role-Based UI Rendering**

```javascript
// React component example
const Navigation = ({ user }) => {
    const isAdmin = user?.role === "admin";
    const isDonor = user?.is_donor === true;
    const isVolunteer = user?.is_volunteer === true;

    return (
        <nav>
            {/* Public links */}
            <Link to="/campaigns">Campaigns</Link>
            <Link to="/events">Events</Link>

            {/* Admin-only links */}
            {isAdmin && (
                <>
                    <Link to="/admin/users">Manage Users</Link>
                    <Link to="/admin/dashboard">Admin Dashboard</Link>
                </>
            )}

            {/* Donor-specific links */}
            {isDonor && (
                <>
                    <Link to="/donations/my-donations">My Donations</Link>
                    <Link to="/donations/receipts">Tax Receipts</Link>
                </>
            )}

            {/* Volunteer-specific links */}
            {isVolunteer && (
                <>
                    <Link to="/volunteer/profile">Volunteer Profile</Link>
                    <Link to="/volunteer/hours">My Hours</Link>
                </>
            )}
        </nav>
    );
};
```

### **Permission Checking Utility**

```javascript
// Permission utility functions
const hasRole = (user, role) => {
    return user && user.role === role;
};

const isAdmin = (user) => hasRole(user, "admin");
const isUser = (user) => hasRole(user, "user");

const hasDonorFlag = (user) => user && user.is_donor === true;
const hasVolunteerFlag = (user) => user && user.is_volunteer === true;

const canManageUsers = (user) => isAdmin(user);
const canDonate = (user) => hasDonorFlag(user);
const canVolunteer = (user) => hasVolunteerFlag(user);

// Usage in components
const DonationButton = ({ campaign, user }) => {
    if (!canDonate(user)) {
        return (
            <div className="donation-disabled">
                <p>Become a donor to support this campaign</p>
                <Link to="/profile/donor-setup">Setup Donor Profile</Link>
            </div>
        );
    }

    return (
        <button onClick={() => donateToCampaign(campaign.id)}>
            Donate Now
        </button>
    );
};
```

---

## 🔄 **Automatic Profile Flag Management**

### **Automatic Flag Assignment**

Profile flags are **automatically set** when users perform specific actions:

#### **Donor Flag Auto-Assignment**

```javascript
// From donation.service.js - createDonation method
const createDonation = async (donationData) => {
    // Create the donation
    const donation = await prisma.donations.create({
        data: donationData,
    });

    // If user is authenticated, automatically set is_donor flag
    if (donationData.user_id) {
        const user = await prisma.users.findUnique({
            where: { id: BigInt(donationData.user_id) },
        });

        // Set is_donor flag to true if not already set
        if (!user.is_donor) {
            await prisma.users.update({
                where: { id: BigInt(donationData.user_id) },
                data: { is_donor: true },
            });
        }
    }

    return donation;
};
```

#### **Volunteer Flag Auto-Assignment**

```javascript
// From event.service.js - registerForEvent method
const registerForEvent = async (eventId, userId) => {
    // Register user for event
    const registration = await prisma.event_participants.create({
        data: {
            event_id: BigInt(eventId),
            user_id: BigInt(userId),
            status: "registered",
        },
    });

    // Get user info
    const user = await prisma.users.findUnique({
        where: { id: BigInt(userId) },
    });

    // Set is_volunteer flag to true if not already set
    if (!user.is_volunteer) {
        await prisma.users.update({
            where: { id: BigInt(user.id) },
            data: { is_volunteer: true },
        });
    }

    return registration;
};
```

### **Key Points**

1. **No Manual Setup Required**: Users don't need to "become" donors or volunteers
2. **Action-Based Assignment**: Flags are set when users actually perform the actions
3. **Automatic Profile Creation**: Related profile records are created as needed
4. **Idempotent Operations**: Flags are only set if not already true
5. **Authenticated Users Only**: Anonymous donations don't set flags

````

---

## 🔧 **Database Schema Reference**

### **Users Table Structure**

```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    is_donor BOOLEAN NOT NULL DEFAULT FALSE,
    is_volunteer BOOLEAN NOT NULL DEFAULT FALSE,
    profile_image_url VARCHAR(512),
    language_preference ENUM('en', 'am') DEFAULT 'en',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);
````

### **Profile Tables**

- **donor_profiles**: Extended donor information and preferences
- **volunteer_profiles**: Volunteer skills, availability, and tracking

---

## 🚀 **Best Practices**

### **For API Developers**

1. **Always use middleware** for authorization checks
2. **Check flags at the route level** rather than in controllers when possible
3. **Provide clear error messages** for permission denials
4. **Log authorization failures** for security monitoring
5. **Use consistent error codes** across the application

### **For Frontend Developers**

1. **Check permissions before rendering** UI elements
2. **Handle authorization errors gracefully**
3. **Provide clear feedback** when users lack permissions
4. **Guide users to obtain required permissions** (e.g., setup donor profile)
5. **Cache user permissions** to avoid repeated checks

---

## 🔍 **Troubleshooting**

### **Common Issues**

#### **User has role but can't access feature**

- Check if email verification is required
- Verify account is not deleted (`deleted_at` is null)
- Ensure proper middleware order in routes

#### **Profile flags not working**

- Verify flags are set to `true` (not just truthy values)
- Check database schema matches expected boolean type
- Ensure profile records exist in related tables

#### **Admin can't access admin features**

- Verify role is exactly `'admin'` (case-sensitive)
- Check if `requireAdmin` middleware is properly applied
- Ensure user object is correctly attached by `authenticateToken`

---

**Previous**: [Password Management](./password.md)
**Next**: [Rate Limiting](./rate-limiting.md)
