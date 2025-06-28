# 🏥 GIV Society Ethiopia Backend

A comprehensive Node.js backend system for GIV Society Ethiopia, providing volunteer and donor management with multilingual support (English/Amharic).

## 🚀 Features

- **User Management**: Complete user registration, authentication, and profile management
- **Volunteer System**: Volunteer profiles, skills management, and event participation
- **Donor Management**: Donor profiles, donation tracking, and payment processing
- **Event Management**: Event creation, registration, and participant management
- **Campaign Management**: Fundraising campaigns with progress tracking
- **Content Management**: Blog posts, news, and multilingual content
- **Multilingual Support**: Full English and Amharic language support
- **File Management**: Media and document upload/management
- **Analytics**: Site interaction tracking and reporting
- **Email System**: Automated email notifications and newsletters

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Email**: Nodemailer
- **Logging**: Winston
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- MySQL 8.0 or higher
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd giv-society-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
DATABASE_URL="mysql://root:password@localhost:3306/giv_db"
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=giv_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@givsociety.org

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Multilingual Configuration
DEFAULT_LANGUAGE=en
SUPPORTED_LANGUAGES=en,am
```

### 4. Database Setup

1. Create a MySQL database named `giv_db`
2. Import the schema from `Schema/giv.sql`
3. Generate Prisma client:

```bash
npm run db:generate
```

### 5. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Health Check
```
GET /health
```

### Authentication Endpoints
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user
- `PATCH /auth/change-password` - Change password
- `POST /auth/request-reset` - Request password reset
- `POST /auth/reset-password` - Reset password

### User Management
- `GET /users` - Get all users (admin)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Volunteer Management
- `GET /volunteers` - List volunteers
- `GET /volunteers/:id` - Get volunteer profile
- `POST /volunteers` - Create volunteer profile
- `PATCH /volunteers/:id` - Update volunteer profile

### Campaign Management
- `GET /campaigns` - List campaigns
- `GET /campaigns/:id` - Get campaign details
- `POST /campaigns` - Create campaign
- `PATCH /campaigns/:id` - Update campaign

### Event Management
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `POST /events` - Create event
- `PATCH /events/:id` - Update event

## 🗂️ Project Structure

```
giv-society-backend/
├── src/
│   ├── api/
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── validators/      # Request validation
│   │   └── middlewares/     # Custom middleware
│   ├── config/              # Configuration files
│   ├── models/              # Database models
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── prisma/              # Prisma schema and migrations
│   └── server.js            # Main server file
├── uploads/                 # File uploads
├── public/                  # Static files
├── tests/                   # Test files
├── Schema/                  # Database schema
└── logs/                    # Application logs
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.test.js
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## 🔧 Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- Follow Express.js best practices

### Database
- Use Prisma migrations for schema changes
- Follow naming conventions for tables and columns
- Implement proper indexing for performance

### Security
- Input validation on all endpoints
- Rate limiting to prevent abuse
- CORS configuration
- Helmet for security headers
- JWT token validation

## 🌐 Multilingual Support

The system supports both English and Amharic languages:

- Content can be created in multiple languages
- Translation groups link related content
- Language preference stored per user
- API responses can be localized

## 📊 Monitoring

- Winston logging for application logs
- Error tracking and monitoring
- Performance monitoring
- Database query logging (development)

## 🚀 Deployment

### Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set secure JWT secret
- [ ] Configure email settings
- [ ] Set up SSL/TLS certificates
- [ ] Configure reverse proxy (nginx)
- [ ] Set up monitoring and logging
- [ ] Configure backup procedures

### Docker Deployment
```bash
# Build Docker image
docker build -t giv-society-backend .

# Run container
docker run -p 3000:3000 giv-society-backend
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🗺️ Roadmap

- [ ] Payment gateway integration (Telebirr, PayPal)
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app API endpoints
- [ ] Third-party integrations
- [ ] Advanced reporting features

---

**Built with ❤️ for GIV Society Ethiopia** 