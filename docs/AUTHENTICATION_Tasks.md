# Authentication Functionality: Finished Tasks

## 1. `src/api/controllers/auth.controller.js`
- Implements the authentication controller for all HTTP requests related to authentication.
- Handles user registration, login, logout, token refresh, profile retrieval, password change, password reset (request and execution), email verification, resending verification, profile update, account deletion, and health check.
- Sets secure cookies for access and refresh tokens, and session ID.
- Handles error responses and status codes for all authentication flows.
- Integrates with the authentication service for business logic.

## 2. `src/services/auth.service.js`
- Implements the core authentication business logic.
- Handles user registration: validates input, checks for existing users, hashes passwords, creates users, sends verification or welcome emails, and returns tokens.
- Handles user login: validates input, checks for account lockout, verifies credentials, checks email verification, resets failed attempts, generates tokens, creates sessions, and stores refresh tokens.
- Handles password change, password reset (request and execution), email verification, resending verification, profile update, logout, and account deletion.
- Integrates with security, token, and email services for full authentication lifecycle.

## 3. `src/middlewares/auth.middleware.js`
- Provides middleware for authentication and authorization.
- `authenticateToken`: Verifies JWT access tokens, checks for revocation, attaches user to request, checks email verification if required.
- `optionalAuth`: Optionally attaches user if token is present and valid.
- `requireRole`, `requireAdmin`, `requireUser`: Role-based access control middleware.
- `requireDonorFlag`, `requireVolunteerFlag`: Ensures user has donor/volunteer profile.
- `authRateLimit`: In-memory rate limiting for authentication endpoints.
- `requireEmailVerification`: Ensures user has verified email.
- `requireActiveUser`, `logAuthAttempt`: Additional security and logging middleware.

## 4. `src/api/routes/auth.routes.js`
- Defines all authentication-related API routes.
- Includes routes for registration, login, logout, token refresh, profile retrieval, password change, password reset (request and execution), email verification, resending verification, profile update, account deletion, and health check.
- Applies appropriate rate limiters, input validators, and authentication middleware to each route.

## 5. `src/api/validators/auth.validator.js`
- Implements input validation for all authentication endpoints using express-validator.
- Validates registration, login, password change, password reset, email verification, resending verification, profile update, and refresh token requests.
- Enforces password strength, email format, name, phone, and language preference requirements.
- Handles validation errors and returns standardized error responses.

## 6. `src/services/token.service.js`
- Manages refresh token storage, validation, revocation, and session tracking.
- Stores hashed refresh tokens and session data in the database.
- Validates and revokes refresh tokens, creates and invalidates sessions, and cleans up expired tokens.
- Provides functions for blacklisting and checking access tokens.
- Generates unique session IDs for user sessions.

## 7. `src/utils/jwt.util.js`
- Provides utility functions for JWT token management.
- Generates access, refresh, password reset, and email verification tokens with appropriate expiration and claims.
- Verifies and decodes JWT tokens, extracts tokens from headers, checks expiration, and gets expiration times.
- Generates random tokens for password reset.
- Exports token expiration constants for use throughout the codebase.

## 8. `src/utils/password.util.js`
- Provides password security utilities.
- Hashes and compares passwords using bcrypt.
- Validates password strength (length, character variety, common/weak passwords, sequences).
- Calculates password strength score and level.
- Generates secure random passwords.
- Provides helpers for rehashing and updating password hashes if needed.

## 9. `src/services/security.service.js`
- Handles account lockouts, failed login attempt tracking, and security event logging.
- Tracks failed login attempts per user and IP, locks accounts after too many failures, and logs security events to the database.
- Checks and resets account lockout status, logs successful logins, and provides security statistics.
- Supports admin functions for clearing failed attempts and retrieving security stats.

## 10. `src/services/email.service.js`
- Manages all authentication-related email communications.
- Sends verification, password reset, welcome, and account locked emails using the Resend API.
- Loads and renders email templates, logs email events, and handles errors in email delivery.
- Supports additional notification emails (donation receipt, event registration, reminders, feedback requests).

---

**All major authentication flows (registration, login, logout, password reset, email verification, session/token management, account lockout, and security) are fully implemented with robust validation, security, and user feedback.**
