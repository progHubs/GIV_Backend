const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session
 * @param {Object} sessionParams - Parameters for session creation
 * @returns {Promise<Object>} - Stripe session object
 */
async function createCheckoutSession(sessionParams) {
  return await stripe.checkout.sessions.create(sessionParams);
}

/**
 * Retrieve a Stripe Checkout Session by ID
 * @param {string} sessionId - The session ID
 * @returns {Promise<Object>} - Stripe session object
 */
async function retrieveSession(sessionId) {
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * List Stripe Checkout Sessions by subscription ID
 * @param {string} subscriptionId - The subscription ID
 * @returns {Promise<Array>} - Array of session objects
 */
async function listSessionsBySubscription(subscriptionId) {
  const sessions = await stripe.checkout.sessions.list({
    subscription: subscriptionId,
    limit: 1
  });
  return sessions.data;
}

/**
 * Verify and construct a Stripe webhook event
 * @param {Buffer} rawBody - The raw request body
 * @param {string} signature - The Stripe-Signature header
 * @returns {Object} - The Stripe event object
 */
function constructWebhookEvent(rawBody, signature) {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
}

module.exports = {
  createCheckoutSession,
  retrieveSession,
  listSessionsBySubscription,
  constructWebhookEvent,
}; 