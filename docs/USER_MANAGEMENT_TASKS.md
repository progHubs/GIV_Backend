# User, Donor, Volunteer, and Skill Management: Finished Tasks

## 1. `src/api/controllers/user.controller.js`
- Implements the user controller for all user-related HTTP requests.
- Handles getting all users (with filters and pagination), getting a user by ID (with optional profile inclusion), updating user profiles (admin or self), deleting users (admin only), searching users, getting user statistics, and managing the current user's profile.
- Integrates with the user service for business logic and enforces permissions for sensitive actions.

## 2. `src/api/controllers/donor.controller.js`
- Implements the donor controller for all donor-related HTTP requests.
- Handles getting all donors (with filters and pagination), creating donor profiles, getting donor by ID, updating donor profiles (admin or self), searching donors, getting donor statistics, updating donation tier, generating tax receipts, retrieving donation history, and deleting donor profiles (admin or self).
- Integrates with the donor service for business logic and enforces permissions for sensitive actions.

## 3. `src/api/controllers/volunteer.controller.js`
- Implements the volunteer controller for all volunteer-related HTTP requests.
- Handles getting all volunteers (with filters and pagination), creating volunteer profiles, getting volunteer by ID, updating volunteer profiles (admin or self), searching volunteers, getting volunteer statistics, updating background check status, adding volunteer hours, and deleting volunteer profiles (admin or self).
- Integrates with the volunteer service for business logic and enforces permissions for sensitive actions.

## 4. `src/api/controllers/skill.controller.js`
- Implements the skill controller for all skill-related HTTP requests.
- Handles getting all skills (with filters), getting skill by ID, creating, updating, and deleting skills, searching skills, getting skill categories and statistics.
- Manages volunteer-skill relationships: getting a volunteer's skills, adding, updating, removing, and verifying skills for volunteers.
- Integrates with the skill service for business logic and uses validators for input validation.

## 5. `src/services/user.service.js`
- Implements the user service for all user-related business logic.
- Handles retrieving all users (with filters and pagination), getting user by ID (with optional profile inclusion), updating user profiles (with validation and duplicate checks), deleting users (admin only, prevents self-deletion), searching users, and getting user statistics.
- Integrates with Prisma ORM for database operations and provides detailed error handling and logging.

## 6. `src/services/donor.service.js`
- Implements the donor service for all donor-related business logic.
- Handles retrieving all donors (with filters and pagination), creating donor profiles (with validation and duplicate checks), getting donor by ID, updating donor profiles, searching donors, getting donor statistics, updating donation tier, generating tax receipts, retrieving donation history, and deleting donor profiles.
- Converts BigInt values to strings for JSON serialization and integrates with Prisma ORM for database operations.

## 7. `src/services/volunteer.service.js`
- Implements the volunteer service for all volunteer-related business logic.
- Handles retrieving all volunteers (with filters and pagination), creating volunteer profiles (with validation and duplicate checks), getting volunteer by ID, updating volunteer profiles, searching volunteers, getting volunteer statistics, updating background check status, adding volunteer hours, and deleting volunteer profiles.
- Converts BigInt values to strings for JSON serialization and integrates with Prisma ORM for database operations.

## 8. `src/services/skill.service.js`
- Implements the skill service for all skill-related business logic.
- Handles retrieving all skills (with filters), getting skill by ID, creating, updating, and deleting skills (with duplicate and dependency checks), searching skills, getting skill categories and statistics.
- Manages volunteer-skill relationships: getting a volunteer's skills, adding, updating, removing, and verifying skills for volunteers.
- Converts BigInt values to strings for JSON serialization and integrates with Prisma ORM for database operations.

## 9. `src/api/routes/user.routes.js`
- Defines all user-related API routes.
- Includes routes for getting all users, getting user by ID, updating and deleting users (admin or self), searching users, getting user statistics, and managing the current user's profile.
- Applies authentication, admin checks, input validation, and rate limiting as appropriate.

## 10. `src/api/routes/donor.routes.js`
- Defines all donor-related API routes.
- Includes routes for getting all donors, creating donor profiles, getting donor by ID, updating and deleting donor profiles (admin or self), searching donors, getting donor statistics, updating donation tier, generating tax receipts, and retrieving donation history.
- Applies authentication, admin checks, input validation, and rate limiting as appropriate.

## 11. `src/api/routes/volunteer.routes.js`
- Defines all volunteer-related API routes.
- Includes routes for getting all volunteers, creating volunteer profiles, getting volunteer by ID, updating and deleting volunteer profiles (admin or self), searching volunteers, getting volunteer statistics, updating background check status, and adding volunteer hours.
- Applies authentication, admin checks, input validation, and rate limiting as appropriate.

## 12. `src/api/routes/skill.routes.js`
- Defines all skill-related API routes.
- Includes routes for getting all skills, searching skills, getting skill categories and statistics, managing volunteer-skill relationships (get, add, update, remove, verify), and CRUD operations for skills.
- Applies authentication, admin checks, input validation, and rate limiting as appropriate.

## 13. `src/api/validators/user.validator.js`
- Implements input validation for all user-related endpoints using express-validator.
- Validates user updates, user ID parameters, user search and list queries, and query parameters for profile inclusion.
- Enforces constraints on names, phone numbers, language preference, profile image URLs, and other user fields.

## 14. `src/api/validators/donor.validator.js`
- Implements input validation for all donor-related endpoints using express-validator.
- Validates donor profile creation and updates, donor ID parameters, donor search and list queries, donation tier updates, year parameters, and donation history pagination.
- Enforces constraints on recurring donor status, payment method, donation frequency, tax receipt email, anonymity, and donation tier.

## 15. `src/api/validators/volunteer.validator.js`
- Implements input validation for all volunteer-related endpoints using express-validator.
- Validates volunteer profile creation and updates, volunteer ID parameters, volunteer search and list queries, and volunteer list filters.
- Enforces constraints on area of expertise, location, availability, motivation, emergency contacts, certificate URLs, and other volunteer fields.

## 16. `src/api/validators/skill.validator.js`
- Implements input validation for all skill-related endpoints using Joi.
- Validates skill creation and updates, volunteer skill assignments and updates, skill search and filter queries, and skill/volunteer ID parameters.
- Enforces constraints on skill names, categories, descriptions, proficiency levels, and verification status.

---

**All major user, donor, volunteer, and skill management flows (CRUD, search, statistics, profile management, validation, and relationships) are fully implemented with robust validation, security, and user feedback.**
