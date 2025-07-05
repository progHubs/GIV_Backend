const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripe.controller');

// Webhook route: must use express.raw, not express.json!
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeController.stripeWebhook
);

// Other Stripe routes (use express.json by default)
router.post('/session', stripeController.createStripeSession);

module.exports = router; 