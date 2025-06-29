# Authentication & Authorization Module File Structure

This module implements JWT-based authentication, bcrypt password hashing, and role-based access control for a scalable Node.js backend compatible with MySQL schema.

---

## 📁 Required Files

### 📁 `src/api/controllers/`
- **`auth.controller.js`**  
  Handles login, registration, logout, password reset, token refresh, and profile retrieval.

### 📁 `src/api/routes/`
- **`auth.routes.js`**  
  Defines auth-related routes like `/register`, `/login`, `/refresh`, etc.

### 📁 `src/api/validators/`
- **`auth.validator.js`**  
  Validation logic for user input (e.g., email, password) using Joi or express-validator.

### 📁 `src/api/middlewares/`
- **`auth.middleware.js`**  
  Middleware to verify JWT access tokens.

- **`role.middleware.js`**  
  Middleware to restrict access based on roles (`admin`, `volunteer`, `donor`, `editor`).

### 📁 `src/models/`
- **`user.model.js`**  
  `users` table/model schema (for Sequelize or Prisma).

- **`rolePermission.model.js`**  
  `role_permissions` table defines role-permission structure.

### 📁 `src/services/`
- **`auth.service.js`**  
  Core auth logic: password hashing, registration, login, token management.

- **`token.service.js`**  
  Handles JWT/refresh token generation, validation, expiry.

- **`email.service.js`**  
  Sends transactional emails like reset password or welcome messages.

- **`user.service.js`**  
  Manages user CRUD operations.

### 📁 `src/utils/`
- **`jwt.util.js`**  
  Helpers for signing and verifying JWT tokens.

- **`hash.util.js`**  
  Helpers for hashing and comparing passwords with bcrypt.

---

## 📄 Environment Variables (`.env`)
```env
JWT_SECRET=supersecurekey
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=refreshsupersecure
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
```

---

## 🧪 Optional: Test Files (`/tests/`)
- `auth.controller.test.js`
- `auth.service.test.js`
- `auth.routes.test.js`

---

## 📁 File Structure Overview

```
src/
├── api/
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── validators/
│   │   └── auth.validator.js
├── models/
│   ├── user.model.js
│   └── rolePermission.model.js
├── services/
│   ├── auth.service.js
│   ├── token.service.js
│   ├── email.service.js
│   └── user.service.js
├── utils/
│   ├── jwt.util.js
│   └── hash.util.js
```

---

## 🔐 Database Schema Compatibility

### **Users Table (`users`):**
- `id` - BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY
- `full_name` - VARCHAR(100) NOT NULL
- `email` - VARCHAR(255) NOT NULL UNIQUE
- `phone` - VARCHAR(20)
- `password_hash` - VARCHAR(255) NOT NULL
- `role` - ENUM('admin', 'volunteer', 'donor', 'editor') NOT NULL
- `profile_image_url` - VARCHAR(512)
- `language_preference` - ENUM('en', 'am') DEFAULT 'en'
- `email_verified` - BOOLEAN DEFAULT FALSE
- `created_at` - TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- `updated_at` - TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- `deleted_at` - TIMESTAMP NULL

### **Role Permissions Table (`role_permissions`):**
- `role` - ENUM('admin', 'editor', 'volunteer_manager') NOT NULL
- `permission` - VARCHAR(100) NOT NULL
- `created_at` - TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- PRIMARY KEY (role, permission)

---

## 🔑 Key Authentication Features

### **User Registration:**
- Email validation and uniqueness check
- Password hashing with bcrypt
- Role assignment (volunteer/donor by default)
- Email verification setup
- Language preference setting

### **User Login:**
- Email/password authentication
- JWT token generation
- Refresh token handling
- Role-based access control
- Language preference retrieval

### **Password Management:**
- Secure password reset via email
- Password change functionality
- Password strength validation
- Account lockout protection

### **Role-Based Access:**
- Admin: Full system access
- Editor: Content management
- Volunteer: Event participation, profile management
- Donor: Donation management, profile access

---

> This structure promotes separation of concerns, security, and scalability for the authentication system compatible with MySQL schema.