const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import middleware
const errorMiddleware = require('./api/middlewares/error.middleware');

// Import routes
const authRoutes = require('./api/routes/auth.routes');
const userRoutes = require('./api/routes/user.routes');
const volunteerRoutes = require('./api/routes/volunteer.routes');
const donorRoutes = require('./api/routes/donor.routes');
const campaignRoutes = require('./api/routes/campaign.routes');
const eventRoutes = require('./api/routes/event.routes');
const donationRoutes = require('./api/routes/donation.routes');
const programRoutes = require('./api/routes/program.routes');
const postRoutes = require('./api/routes/post.routes');
const mediaRoutes = require('./api/routes/media.routes');
const documentRoutes = require('./api/routes/document.routes');
const testimonialRoutes = require('./api/routes/testimonial.routes');
const partnerRoutes = require('./api/routes/partner.routes');
const faqRoutes = require('./api/routes/faq.routes');
const contactRoutes = require('./api/routes/contact.routes');
const newsletterRoutes = require('./api/routes/newsletter.routes');
const skillRoutes = require('./api/routes/skill.routes');
const analyticsRoutes = require('./api/routes/analytics.routes');
const emailRoutes = require('./api/routes/email.routes');

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));
app.use('/public', express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'GIV Society Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
const apiVersion = process.env.API_VERSION || 'v1';
const apiPrefix = `/api/${apiVersion}`;


// Test route first
app.get('/api/v1/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is working!'
  });
});

// Mount routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, userRoutes);
app.use(`${apiPrefix}/volunteers`, volunteerRoutes);
app.use(`${apiPrefix}/donors`, donorRoutes);
app.use(`${apiPrefix}/campaigns`, campaignRoutes);
app.use(`${apiPrefix}/events`, eventRoutes);
app.use(`${apiPrefix}/donations`, donationRoutes);
app.use(`${apiPrefix}/programs`, programRoutes);
app.use(`${apiPrefix}/posts`, postRoutes);
app.use(`${apiPrefix}/media`, mediaRoutes);
app.use(`${apiPrefix}/documents`, documentRoutes);
app.use(`${apiPrefix}/testimonials`, testimonialRoutes);
app.use(`${apiPrefix}/partners`, partnerRoutes);
app.use(`${apiPrefix}/faqs`, faqRoutes);
app.use(`${apiPrefix}/contact`, contactRoutes);
app.use(`${apiPrefix}/newsletter`, newsletterRoutes);
app.use(`${apiPrefix}/skills`, skillRoutes);
app.use(`${apiPrefix}/analytics`, analyticsRoutes);
app.use(`${apiPrefix}/emails`, emailRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GIV Society Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}${apiPrefix}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app; 