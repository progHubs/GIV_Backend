const stripeService = require('../../services/stripe.service');
const donationService = require('../../services/donation.service');
const userService = require('../../services/user.service');
const campaignService = require('../../services/campaign.service');
const { getTierAmount, getTierPriceId } = require('../utils/stripeTiers');
const { ANONYMOUS_DONOR_ID } = require('../../config/constants');

// POST /api/v1/payments/stripe/session
exports.createStripeSession = async (req, res) => {
  try {
    const { amount, tier, recurring, campaign_id } = req.body;
    const user = req.user || null;
    // Validate input
    if ((!amount && !tier) || (amount && tier)) {
      return res.status(400).json({ error: 'Provide either amount or tier, not both.' });
    }
    if (!campaign_id) {
      return res.status(400).json({ error: 'campaign_id is required.' });
    }
    // Validate campaign exists
    const campaignData = await campaignService.getCampaignById(campaign_id);
    const campaign = campaignData && campaignData.campaign ? campaignData.campaign : null;
    console.log('campaign', campaign);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found.' });
    }
    let donationAmount = amount;
    let priceId = null;
    if (tier) {
      donationAmount = getTierAmount(tier);
      priceId = getTierPriceId(tier, recurring);
      if (!donationAmount || !priceId) {
        return res.status(400).json({ error: 'Invalid tier.' });
      }
    }
    if (!donationAmount || donationAmount < 1) {
      return res.status(400).json({ error: 'Minimum donation is $1.' });
    }
    // Determine anonymity based on authentication
    const is_anonymous = !user;
    // Prepare metadata
    const metadata = {
      campaign_id: String(campaign_id),
      is_anonymous: String(is_anonymous),
      donation_type: recurring ? 'recurring' : 'one_time',
      donor_id: user ? String(user.id) : String(ANONYMOUS_DONOR_ID),
    };
    // Prepare session params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    let sessionParams = {
      payment_method_types: ['card'],
      mode: recurring ? 'subscription' : 'payment',
      success_url: frontendUrl + '/donation-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: frontendUrl + '/donation-cancelled',
      metadata,
    };
    if (recurring && priceId) {
      sessionParams.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else {
      sessionParams.line_items = [
        {
          price_data: {
            currency: 'USD',
            product_data: {
              name: `Donation to ${campaign.title || 'Campaign'}`,
            },
            unit_amount: Math.round(Number(donationAmount) * 100),
          },
          quantity: 1,
        },
      ];
    }
    console.log('Product name', sessionParams.line_items[0].price_data.product_data.name);
    // Pass email if available and not anonymous
    if (user) {
      sessionParams.customer_email = user.email;
    }
    // Create session using stripeService
    const session = await stripeService.createCheckoutSession(sessionParams);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: error.message });
  }
};

// POST /api/v1/payments/stripe/webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripeService.constructWebhookEvent(req.body, sig);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  try {
    // Handle events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // Extract metadata
      const { campaign_id, donor_id, is_anonymous, donation_type } = session.metadata || {};
      await donationService.handleStripeDonationSuccess({
        session,
        campaign_id,
        donor_id,
        is_anonymous: is_anonymous === 'true',
        donation_type,
      });
    } else if (event.type === 'invoice.paid') {
      // Explicit handling for recurring donations (subscription payments)
      const invoice = event.data.object;
      if (invoice.subscription) {
        // Use stripeService to get session
        const sessions = await stripeService.listSessionsBySubscription(invoice.subscription);
        const session = sessions[0];
        if (session && session.metadata) {
          const { campaign_id, donor_id, is_anonymous, donation_type } = session.metadata;
          await donationService.handleStripeDonationSuccess({
            session: {
              ...session,
              amount_total: invoice.amount_paid,
              currency: invoice.currency,
              payment_intent: invoice.payment_intent,
              receipt_url: invoice.hosted_invoice_url,
              created: invoice.created,
              customer_email: invoice.customer_email || session.customer_email,
            },
            campaign_id,
            donor_id,
            is_anonymous: is_anonymous === 'true',
            donation_type: donation_type || 'recurring',
          });
        } else {
          console.warn('No session metadata found for recurring invoice.paid event.');
        }
      } else {
        console.warn('No subscription found for invoice.paid event.');
      }
    } else if (event.type === 'checkout.session.async_payment_succeeded') {
      // Handle delayed payment success
      const session = event.data.object;
      const { campaign_id, donor_id, is_anonymous, donation_type } = session.metadata || {};
      await donationService.handleStripeDonationSuccess({
        session,
        campaign_id,
        donor_id,
        is_anonymous: is_anonymous === 'true',
        donation_type,
      });
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Error handling Stripe webhook:', err);
    res.status(500).send('Webhook handler error');
  }
}; 