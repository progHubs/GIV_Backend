# 🛠️ Skills Management System Documentation

## 📋 Overview

The Skills Management System is a comprehensive solution for managing volunteer skills in the GIV Society backend. It provides functionality for creating, managing, and tracking skills, as well as assigning skills to volunteers with proficiency levels and verification status.

## 🏗️ System Architecture

### Database Schema

The system uses three main tables:

1. **`skills`** - Core skills table
2. **`volunteer_skills`** - Many-to-many relationship between volunteers and skills
3. **`volunteer_profiles`** - Volunteer profile information

### Key Features

- ✅ **Skill CRUD Operations** - Create, read, update, delete skills
- ✅ **Volunteer Skill Assignment** - Assign skills to volunteers with proficiency levels
- ✅ **Skill Verification** - Verify volunteer skills by administrators
- ✅ **Search & Filtering** - Search skills by name, description, or category
- ✅ **Statistics & Analytics** - Get skills statistics and insights
- ✅ **Role-Based Access Control** - Different permissions for different user roles
- ✅ **Validation** - Comprehensive input validation and error handling

## 🔐 Authentication & Authorization

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all skills management features |
| **Volunteer Manager** | Can manage volunteer skills and verify skills |
| **Volunteer** | Can view skills and their own skill assignments |
| **Public** | Can view skills and search functionality |

### Protected Endpoints

- **Admin Only**: Create, update, delete skills, view statistics
- **Admin/Volunteer Manager**: Assign, update, verify volunteer skills
- **Public**: View skills, search skills, get categories

## 📡 API Endpoints

### Base URL
```
http://localhost:3000/api/v1/skills
```

### 1. Skills Management

#### Get All Skills
```http
GET /api/v1/skills
```

**Query Parameters:**
- `category` (optional) - Filter by skill category
- `search` (optional) - Search in skill name and description

**Response:**
```json
{
  "success": true,
  "message": "Skills retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Medical Translation",
      "category": "Healthcare",
      "description": "Ability to translate medical documents",
      "created_at": "2024-01-15T10:30:00.000Z",
      "volunteer_skills": []
    }
  ],
  "count": 1
}
```

#### Get Skill by ID
```http
GET /api/v1/skills/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Skill retrieved successfully",
  "data": {
    "id": 1,
    "name": "Medical Translation",
    "category": "Healthcare",
    "description": "Ability to translate medical documents",
    "created_at": "2024-01-15T10:30:00.000Z",
    "volunteer_skills": [
      {
        "volunteer_id": 1,
        "skill_id": 1,
        "proficiency_level": "intermediate",
        "is_verified": true,
        "created_at": "2024-01-15T11:00:00.000Z",
        "volunteer_profiles": {
          "users": {
            "id": 1,
            "full_name": "John Doe",
            "email": "john@example.com"
          }
        }
      }
    ]
  }
}
```

#### Create Skill (Admin Only)
```http
POST /api/v1/skills
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Medical Translation",
  "category": "Healthcare",
  "description": "Ability to translate medical documents between English and Amharic"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill created successfully",
  "data": {
    "id": 1,
    "name": "Medical Translation",
    "category": "Healthcare",
    "description": "Ability to translate medical documents between English and Amharic",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Update Skill (Admin Only)
```http
PUT /api/v1/skills/:id
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "name": "Medical Translation Updated",
  "description": "Updated description for medical translation skills"
}
```

#### Delete Skill (Admin Only)
```http
DELETE /api/v1/skills/:id
Authorization: Bearer <admin_token>
```

**Note:** Skills cannot be deleted if they are assigned to any volunteers.

### 2. Skill Search & Discovery

#### Search Skills
```http
GET /api/v1/skills/search?q=medical&category=Healthcare
```

**Query Parameters:**
- `q` (required) - Search term
- `category` (optional) - Filter by category

**Response:**
```json
{
  "success": true,
  "message": "Skills search completed",
  "data": [
    {
      "id": 1,
      "name": "Medical Translation",
      "category": "Healthcare",
      "description": "Ability to translate medical documents",
      "_count": {
        "volunteer_skills": 5
      }
    }
  ],
  "count": 1,
  "searchTerm": "medical"
}
```

#### Get Skill Categories
```http
GET /api/v1/skills/categories
```

**Response:**
```json
{
  "success": true,
  "message": "Skill categories retrieved successfully",
  "data": ["Healthcare", "Education", "Technology", "Administration"]
}
```

#### Get Skills Statistics (Admin Only)
```http
GET /api/v1/skills/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Skills statistics retrieved successfully",
  "data": {
    "totalSkills": 25,
    "totalAssignments": 150,
    "verifiedAssignments": 120,
    "verificationRate": "80.00",
    "skillsByCategory": [
      {
        "category": "Healthcare",
        "_count": { "id": 8 }
      }
    ],
    "proficiencyDistribution": [
      {
        "proficiency_level": "beginner",
        "_count": { "volunteer_id": 45 }
      }
    ]
  }
}
```

### 3. Volunteer Skills Management

#### Get Volunteer Skills
```http
GET /api/v1/skills/volunteers/:volunteerId
```

**Response:**
```json
{
  "success": true,
  "message": "Volunteer skills retrieved successfully",
  "data": [
    {
      "volunteer_id": 1,
      "skill_id": 1,
      "proficiency_level": "intermediate",
      "is_verified": true,
      "created_at": "2024-01-15T11:00:00.000Z",
      "skills": {
        "id": 1,
        "name": "Medical Translation",
        "category": "Healthcare"
      }
    }
  ],
  "count": 1
}
```

#### Add Skill to Volunteer (Admin/Volunteer Manager)
```http
POST /api/v1/skills/volunteers/:volunteerId
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "skillId": 1,
  "proficiencyLevel": "intermediate"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Skill added to volunteer successfully",
  "data": {
    "volunteer_id": 1,
    "skill_id": 1,
    "proficiency_level": "intermediate",
    "is_verified": false,
    "created_at": "2024-01-15T11:00:00.000Z",
    "skills": {
      "id": 1,
      "name": "Medical Translation",
      "category": "Healthcare"
    }
  }
}
```

#### Update Volunteer Skill (Admin/Volunteer Manager)
```http
PUT /api/v1/skills/volunteers/:volunteerId/:skillId
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "proficiencyLevel": "expert"
}
```

#### Verify Volunteer Skill (Admin/Volunteer Manager)
```http
PUT /api/v1/skills/volunteers/:volunteerId/:skillId/verify
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Volunteer skill verified successfully",
  "data": {
    "volunteer_id": 1,
    "skill_id": 1,
    "proficiency_level": "intermediate",
    "is_verified": true,
    "skills": {
      "id": 1,
      "name": "Medical Translation",
      "category": "Healthcare"
    }
  }
}
```

#### Remove Skill from Volunteer (Admin/Volunteer Manager)
```http
DELETE /api/v1/skills/volunteers/:volunteerId/:skillId
Authorization: Bearer <admin_token>
```

## 🔧 Implementation Details

### Service Layer (`src/services/skill.service.js`)

The service layer handles all business logic:

```javascript
class SkillService {
  // Core CRUD operations
  async getAllSkills(filters = {})
  async getSkillById(skillId)
  async createSkill(skillData)
  async updateSkill(skillId, updateData)
  async deleteSkill(skillId)
  
  // Search and discovery
  async searchSkills(searchTerm, filters = {})
  async getSkillCategories()
  async getSkillsStats()
  
  // Volunteer skills management
  async getVolunteerSkills(volunteerId)
  async addSkillToVolunteer(volunteerId, skillId, proficiencyLevel)
  async updateVolunteerSkill(volunteerId, skillId, updateData)
  async removeSkillFromVolunteer(volunteerId, skillId)
  async verifyVolunteerSkill(volunteerId, skillId)
}
```

### Controller Layer (`src/api/controllers/skill.controller.js`)

The controller layer handles HTTP requests and responses:

```javascript
class SkillController {
  // Skills management
  async getSkills(req, res)
  async getSkillById(req, res)
  async createSkill(req, res)
  async updateSkill(req, res)
  async deleteSkill(req, res)
  
  // Search and discovery
  async searchSkills(req, res)
  async getSkillCategories(req, res)
  async getSkillsStats(req, res)
  
  // Volunteer skills management
  async getVolunteerSkills(req, res)
  async addSkillToVolunteer(req, res)
  async updateVolunteerSkill(req, res)
  async removeSkillFromVolunteer(req, res)
  async verifyVolunteerSkill(req, res)
}
```

### Validation (`src/api/validators/skill.validator.js`)

Comprehensive validation schemas:

```javascript
// Skill validation
const skillCreateSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  category: Joi.string().max(50).optional(),
  description: Joi.string().max(500).optional()
});

// Volunteer skill validation
const volunteerSkillSchema = Joi.object({
  skillId: Joi.number().integer().positive().required(),
  proficiencyLevel: Joi.string().valid('beginner', 'intermediate', 'expert').default('beginner')
});
```

### Routes (`src/api/routes/skill.routes.js`)

Route definitions with middleware:

```javascript
// Public routes
router.get('/', skillController.getSkills);
router.get('/search', skillController.searchSkills);
router.get('/categories', skillController.getSkillCategories);
router.get('/:id', skillController.getSkillById);

// Admin only routes
router.post('/', authMiddleware.requireAuth, authMiddleware.requireRole('admin'), skillController.createSkill);
router.put('/:id', authMiddleware.requireAuth, authMiddleware.requireRole('admin'), skillController.updateSkill);
router.delete('/:id', authMiddleware.requireAuth, authMiddleware.requireRole('admin'), skillController.deleteSkill);
router.get('/stats', authMiddleware.requireAuth, authMiddleware.requireRole('admin'), skillController.getSkillsStats);

// Volunteer skills management
router.get('/volunteers/:volunteerId', skillController.getVolunteerSkills);
router.post('/volunteers/:volunteerId', authMiddleware.requireAuth, authMiddleware.requireRole('admin', 'volunteer_manager'), skillController.addSkillToVolunteer);
router.put('/volunteers/:volunteerId/:skillId', authMiddleware.requireAuth, authMiddleware.requireRole('admin', 'volunteer_manager'), skillController.updateVolunteerSkill);
router.delete('/volunteers/:volunteerId/:skillId', authMiddleware.requireAuth, authMiddleware.requireRole('admin', 'volunteer_manager'), skillController.removeSkillFromVolunteer);
router.put('/volunteers/:volunteerId/:skillId/verify', authMiddleware.requireAuth, authMiddleware.requireRole('admin', 'volunteer_manager'), skillController.verifyVolunteerSkill);
```

## 🧪 Testing

### Running Tests

```bash
# Run the skills management test suite
node test-skills-management.js
```

### Test Coverage

The test suite covers:

1. **Authentication Tests**
   - Admin login
   - Volunteer login

2. **Skills CRUD Tests**
   - Create skill (admin only)
   - Get all skills (public)
   - Get skill by ID
   - Update skill (admin only)
   - Delete skill (admin only)

3. **Search & Discovery Tests**
   - Search skills
   - Get skill categories
   - Get skills statistics (admin only)

4. **Volunteer Skills Tests**
   - Add skill to volunteer
   - Get volunteer skills
   - Update volunteer skill
   - Verify volunteer skill
   - Remove skill from volunteer

5. **Authorization Tests**
   - Unauthorized access attempts
   - Role-based access control

## 📊 Database Schema

### Skills Table
```sql
CREATE TABLE skills (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category)
);
```

### Volunteer Skills Table
```sql
CREATE TABLE volunteer_skills (
    volunteer_id BIGINT UNSIGNED,
    skill_id BIGINT UNSIGNED,
    proficiency_level ENUM('beginner', 'intermediate', 'expert') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (volunteer_id, skill_id),
    FOREIGN KEY (volunteer_id) REFERENCES volunteer_profiles(user_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    INDEX idx_proficiency (proficiency_level)
);
```

## 🚀 Usage Examples

### Frontend Integration

```javascript
// Get all skills
const response = await fetch('/api/v1/skills');
const skills = await response.json();

// Search skills
const searchResponse = await fetch('/api/v1/skills/search?q=medical');
const searchResults = await searchResponse.json();

// Add skill to volunteer (with authentication)
const addSkillResponse = await fetch('/api/v1/skills/volunteers/1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    skillId: 1,
    proficiencyLevel: 'intermediate'
  })
});
```

### Error Handling

```javascript
try {
  const response = await fetch('/api/v1/skills/999');
  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.message);
    console.error('Code:', error.code);
  }
} catch (error) {
  console.error('Network error:', error.message);
}
```

## 🔒 Security Considerations

1. **Input Validation**: All inputs are validated using Joi schemas
2. **SQL Injection Prevention**: Using Prisma ORM with parameterized queries
3. **Authentication**: JWT-based authentication for protected endpoints
4. **Authorization**: Role-based access control for different operations
5. **Rate Limiting**: Global rate limiting applied to all API routes
6. **Error Handling**: Comprehensive error handling without exposing sensitive information

## 📈 Performance Optimizations

1. **Database Indexing**: Proper indexes on frequently queried fields
2. **Query Optimization**: Efficient Prisma queries with proper includes
3. **Caching**: Consider implementing Redis caching for frequently accessed data
4. **Pagination**: Support for pagination in list endpoints (future enhancement)

## 🔮 Future Enhancements

1. **Skill Categories Management**: CRUD operations for skill categories
2. **Skill Recommendations**: AI-powered skill recommendations for volunteers
3. **Skill Certification**: Digital certificates for verified skills
4. **Skill Analytics**: Advanced analytics and reporting
5. **Bulk Operations**: Bulk import/export of skills and assignments
6. **Skill Templates**: Predefined skill templates for common roles

---

## 📞 Support

For questions or issues with the Skills Management System, please refer to:

- **API Documentation**: This document
- **Test Suite**: `test-skills-management.js`
- **Source Code**: `src/services/skill.service.js`, `src/api/controllers/skill.controller.js`
- **Database Schema**: `prisma/schema.sql`

The Skills Management System is designed to be scalable, secure, and user-friendly, providing comprehensive functionality for managing volunteer skills in the GIV Society platform. 