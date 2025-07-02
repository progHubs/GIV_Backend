const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import middleware
const errorMiddleware = require('./api/middlewares/error.middleware');
const { generalLimiter } = require('./middlewares/rate-limit.middleware');

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
const stripeRoutes = require('./api/routes/stripe.routes');

// Import cleanup function
const cleanupRevokedTokens = require('./jobs/cleanupRevokedTokens');

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Global rate limiting for all API routes
app.use('/api', generalLimiter);

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Register ONLY the webhook route with express.raw BEFORE express.json
app.post(
  '/api/v1/payments/stripe/webhook',
  express.raw({ type: 'application/json' }),
  require('./api/controllers/stripe.controller').stripeWebhook
);

// --- Core Middleware ---
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ 
        success: false, 
        errors: ['Invalid JSON payload'],
        code: 'INVALID_JSON'
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100
}));
app.use(cookieParser(process.env.COOKIE_SECRET || 'giv-society-secret'));

// --- Static Files ---
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
  }
}));
app.use('/public', express.static('public', {
  setHeaders: (res, path) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
  }
}));

// --- View Engine ---
app.set('views', path.join(__dirname));
app.set('view engine', 'ejs');

// --- Health Check ---
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'GIV Society Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- API Routes ---
const apiVersion = process.env.API_VERSION || 'v1';
const apiPrefix = `/api/${apiVersion}`;
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
app.use(`${apiPrefix}/payments/stripe`, stripeRoutes);

// --- Stripe Success/Cancel Pages ---
app.get('/donation-success', (req, res) => {
  res.send('<h1>Thank you for your donation!</h1><p>Your payment was successful. You may close this window.</p>');
});
app.get('/donation-cancelled', (req, res) => {
  res.send('<h1>Donation Cancelled</h1><p>Your payment was not completed. You may try again.</p>');
});

// --- 404 Handler ---
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// --- Error Handling Middleware ---
app.use(errorMiddleware);

// --- Server Startup ---
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 GIV Society Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}${apiPrefix}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  });
}

// --- Graceful Shutdown ---
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// --- Scheduled Cleanup Job ---
if (process.env.RUN_CLEANUP_JOBS === 'true') {
  cron.schedule('0 * * * *', async () => {
    try {
      await cleanupRevokedTokens();
    } catch (err) {
      console.error('[Cleanup] Error cleaning up revoked tokens:', err);
    }
  });
  console.log('[Cleanup] Scheduled revoked tokens cleanup job (every hour)');
}

module.exports = app; 