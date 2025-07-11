const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');
const { optionalAuth } = require('../../middlewares/auth.middleware');

// Webhook route: must use express.raw, not express.json!
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.stripeWebhook
);

// Other Stripe routes (use express.json by default)
router.post('/session', optionalAuth, stripeController.createStripeSession);
router.get('/session/:sessionId', stripeController.getStripeSession);

module.exports = router;