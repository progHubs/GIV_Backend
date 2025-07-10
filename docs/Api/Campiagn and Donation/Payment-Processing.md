# Payment Processing Documentation

## Overview

The GIV Society backend integrates with Stripe for secure payment processing, supporting both one-time and recurring donations. The system handles payment sessions, webhook events, and automatic donation processing.

## Stripe Integration Architecture

### Components

1. **Stripe Controller** (`src/api/controllers/stripe.controller.js`)
2. **Stripe Service** (`src/services/stripe.service.js`)
3. **Donation Service Integration** (`src/services/donation.service.js`)
4. **Webhook Handler** (Stripe webhook endpoint)

## Payment Flow

### 1. Payment Session Creation

#### Endpoint: POST /api/v1/payments/stripe/session

**Authentication:** Optional (supports both anonymous and authenticated users)

**Request Body:**

```json
{
    "amount": 100.0,
    "campaign_id": 1,
    "recurring": false
}
```

**Alternative with Tier:**

```json
{
    "tier": "silver",
    "campaign_id": 1,
    "recurring": true
}
```

**Field Descriptions:**

- `amount` (decimal): Donation amount (mutually exclusive with tier)
- `tier` (string): Predefined donation tier (mutually exclusive with amount)
- `campaign_id` (integer, required): Target campaign ID
- `recurring` (boolean, optional): Whether this is a recurring donation

**Tier System:**

- **Bronze**: $25 (one-time) / $10 (monthly)
- **Silver**: $100 (one-time) / $25 (monthly)
- **Gold**: $500 (one-time) / $100 (monthly)
- **Platinum**: $1000 (one-time) / $250 (monthly)

**Response:**

```json
{
    "url": "https://checkout.stripe.com/pay/cs_test_..."
}
```

**Process Flow:**

1. Validate input parameters (amount/tier and campaign_id)
2. Verify campaign exists and is active
3. Determine donation amount (from amount or tier)
4. Set anonymity based on authentication status
5. Prepare Stripe session metadata
6. Create Stripe Checkout session
7. Return checkout URL for frontend redirect

**Session Metadata:**

```json
{
    "campaign_id": "1",
    "donor_id": "456", // or "0" for anonymous
    "is_anonymous": "false",
    "donation_type": "one_time" // or "recurring"
}
```

### 2. Payment Processing

#### Stripe Checkout Session Configuration

**One-time Payment:**

```javascript
{
  payment_method_types: ['card'],
  mode: 'payment',
  line_items: [{
    price_data: {
      currency: 'USD',
      product_data: {
        name: 'Donation to Campaign Name'
      },
      unit_amount: Math.round(amount * 100) // Convert to cents
    },
    quantity: 1
  }],
  success_url: 'https://frontend.com/donation-success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://frontend.com/donation-cancelled',
  metadata: { /* donation metadata */ }
}
```

**Recurring Payment:**

```javascript
{
  payment_method_types: ['card'],
  mode: 'subscription',
  line_items: [{
    price: 'price_tier_monthly_id', // Predefined Stripe price ID
    quantity: 1
  }],
  success_url: 'https://frontend.com/donation-success?session_id={CHECKOUT_SESSION_ID}',
  cancel_url: 'https://frontend.com/donation-cancelled',
  metadata: { /* donation metadata */ }
}
```

### 3. Webhook Event Processing

#### Endpoint: POST /api/v1/payments/stripe/webhook

**Authentication:** Stripe signature verification

**Supported Events:**

##### checkout.session.completed

Triggered when a one-time payment is completed or a subscription is created.

**Event Processing:**

1. Extract session metadata
2. Call `donationService.handleStripeDonationSuccess()`
3. Create donation record
4. Update campaign statistics
5. Update donor profile
6. Send email receipt (if not anonymous)

##### invoice.paid

Triggered for recurring subscription payments.

**Event Processing:**

1. Retrieve original session metadata from subscription
2. Process as recurring donation
3. Update statistics and send receipt

##### checkout.session.async_payment_succeeded

Triggered for delayed payment methods (bank transfers, etc.).

**Event Processing:**
Same as `checkout.session.completed`

### 4. Donation Record Creation

When a successful payment webhook is received:

```javascript
await donationService.handleStripeDonationSuccess({
    session: stripeSession,
    campaign_id: metadata.campaign_id,
    donor_id: metadata.donor_id,
    is_anonymous: metadata.is_anonymous === "true",
    donation_type: metadata.donation_type,
});
```

**Process:**

1. **Idempotency Check**: Prevent duplicate processing using transaction_id
2. **Donor Profile Management**:
    - For authenticated users: Create/update donor profile
    - For anonymous users: Use special anonymous donor ID (0)
3. **Donation Record Creation**:
    ```json
    {
        "donor_id": "456",
        "campaign_id": "1",
        "amount": "100.00",
        "currency": "USD",
        "donation_type": "one_time",
        "payment_method": "stripe",
        "payment_status": "completed",
        "transaction_id": "pi_stripe_payment_intent_id",
        "receipt_url": "https://stripe.com/receipt/...",
        "is_anonymous": false,
        "donated_at": "2024-01-01T12:00:00.000Z"
    }
    ```
4. **Statistics Updates**:
    - Campaign: `current_amount += donation.amount`, `donor_count += 1`
    - Donor Profile: `total_donated += donation.amount`, `last_donation_date = now`
5. **Email Notification**: Send receipt email (if not anonymous)

## Error Handling

### Payment Session Creation Errors

```json
{
    "error": "Provide either amount or tier, not both."
}
```

```json
{
    "error": "campaign_id is required."
}
```

```json
{
    "error": "Campaign not found."
}
```

```json
{
    "error": "Invalid tier."
}
```

```json
{
    "error": "Minimum donation is $1."
}
```

### Webhook Processing Errors

```json
{
    "error": "Webhook Error: Invalid signature"
}
```

```json
{
    "error": "Webhook handler error"
}
```

## Security Measures

### 1. Webhook Signature Verification

```javascript
const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
);
```

### 2. Idempotency Protection

- Uses Stripe's `payment_intent` ID as unique transaction identifier
- Prevents duplicate donation records from webhook retries

### 3. Metadata Validation

- Validates campaign existence before processing
- Ensures donor_id matches authenticated user (if applicable)

### 4. Amount Verification

- Verifies payment amount matches expected donation amount
- Prevents manipulation of donation amounts

## Configuration

### Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://your-frontend.com
```

### Stripe Price IDs (for recurring donations)

```javascript
const TIER_PRICE_IDS = {
    bronze: {
        monthly: "price_bronze_monthly_id",
        yearly: "price_bronze_yearly_id",
    },
    silver: {
        monthly: "price_silver_monthly_id",
        yearly: "price_silver_yearly_id",
    },
    gold: {
        monthly: "price_gold_monthly_id",
        yearly: "price_gold_yearly_id",
    },
    platinum: {
        monthly: "price_platinum_monthly_id",
        yearly: "price_platinum_yearly_id",
    },
};
```

## Frontend Integration

### 1. Initiate Payment

```javascript
const response = await fetch("/api/v1/payments/stripe/session", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Optional for anonymous
    },
    body: JSON.stringify({
        amount: 100.0,
        campaign_id: 1,
        recurring: false,
    }),
});

const { url } = await response.json();
window.location.href = url; // Redirect to Stripe Checkout
```

### 2. Handle Success/Cancel

- **Success URL**: `/donation-success?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL**: `/donation-cancelled`

### 3. Verify Payment (Optional)

```javascript
// On success page, optionally verify payment
const sessionId = new URLSearchParams(window.location.search).get("session_id");
const response = await fetch(`/api/donations/verify/${sessionId}`, {
    headers: {
        Authorization: `Bearer ${token}`,
    },
});
```

## Testing

### Test Cards (Stripe Test Mode)

- **Success**: 4242424242424242
- **Decline**: 4000000000000002
- **Insufficient Funds**: 4000000000009995
- **3D Secure**: 4000000000003220

### Webhook Testing

Use Stripe CLI to forward webhooks to local development:

```bash
stripe listen --forward-to localhost:3000/api/v1/payments/stripe/webhook
```

## Monitoring and Logging

### Key Metrics to Monitor

1. **Payment Success Rate**: Successful payments / Total payment attempts
2. **Webhook Processing Time**: Time to process webhook events
3. **Failed Payments**: Track and analyze payment failures
4. **Duplicate Prevention**: Monitor idempotency effectiveness

### Logging

- All payment attempts logged with session ID
- Webhook events logged with event type and processing status
- Failed payments logged with error details
- Donation creation logged with campaign and donor information

## Troubleshooting

### Common Issues

1. **Webhook Not Received**
    - Check webhook endpoint URL configuration in Stripe dashboard
    - Verify webhook secret matches environment variable
    - Check server logs for webhook processing errors

2. **Duplicate Donations**
    - Verify idempotency logic using transaction_id
    - Check for webhook retry handling

3. **Payment Amount Mismatch**
    - Verify tier amount calculations
    - Check currency conversion if applicable

4. **Anonymous Donation Issues**
    - Ensure anonymous donor ID (0) is handled correctly
    - Verify email receipt logic skips anonymous donations

5. **Recurring Payment Problems**
    - Check Stripe price ID configuration
    - Verify subscription webhook handling
    - Monitor invoice.paid events

### Debug Steps

1. **Check Stripe Dashboard**
    - View payment events and webhook delivery status
    - Check for failed webhook deliveries
    - Verify payment intent status

2. **Server Logs**
    - Check webhook processing logs
    - Verify donation creation logs
    - Look for error messages and stack traces

3. **Database Verification**
    - Confirm donation records are created
    - Check campaign statistics updates
    - Verify donor profile updates

## API Integration Examples

### Complete Donation Flow Example

```javascript
// Frontend: Initiate donation
async function makeDonation(campaignId, amount, isRecurring = false) {
    try {
        // Create Stripe session
        const response = await fetch("/api/v1/payments/stripe/session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
                campaign_id: campaignId,
                amount: amount,
                recurring: isRecurring,
            }),
        });

        if (!response.ok) {
            throw new Error("Failed to create payment session");
        }

        const { url } = await response.json();

        // Redirect to Stripe Checkout
        window.location.href = url;
    } catch (error) {
        console.error("Payment initiation failed:", error);
        // Handle error (show user message, etc.)
    }
}

// Success page: Verify donation
async function verifyDonation(sessionId) {
    try {
        const response = await fetch(`/api/donations/session/${sessionId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        if (response.ok) {
            const donation = await response.json();
            // Show success message with donation details
            showSuccessMessage(donation);
        }
    } catch (error) {
        console.error("Donation verification failed:", error);
    }
}
```

### Backend Webhook Handler Flow

```javascript
// Simplified webhook handler logic
exports.stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        // Verify webhook signature
        event = stripeService.constructWebhookEvent(req.body, sig);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(event.data.object);
                break;

            case "invoice.paid":
                await handleInvoicePaid(event.data.object);
                break;

            case "checkout.session.async_payment_succeeded":
                await handleAsyncPaymentSucceeded(event.data.object);
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Error handling Stripe webhook:", err);
        res.status(500).send("Webhook handler error");
    }
};

async function handleCheckoutCompleted(session) {
    const { campaign_id, donor_id, is_anonymous, donation_type } =
        session.metadata || {};

    await donationService.handleStripeDonationSuccess({
        session,
        campaign_id,
        donor_id,
        is_anonymous: is_anonymous === "true",
        donation_type,
    });
}
```

## Best Practices

### 1. Error Handling

- Always validate input parameters before creating Stripe sessions
- Implement proper error responses with meaningful messages
- Log all errors for debugging and monitoring

### 2. Security

- Never expose Stripe secret keys in frontend code
- Always verify webhook signatures
- Validate all metadata before processing

### 3. User Experience

- Provide clear success and error messages
- Handle payment cancellations gracefully
- Show loading states during payment processing

### 4. Testing

- Use Stripe test mode for development
- Test all payment scenarios (success, failure, cancellation)
- Verify webhook handling with Stripe CLI

### 5. Monitoring

- Set up alerts for failed payments
- Monitor webhook delivery success rates
- Track payment conversion rates

## Performance Considerations

### 1. Webhook Processing

- Keep webhook handlers fast and lightweight
- Use background jobs for heavy processing
- Implement proper timeout handling

### 2. Database Operations

- Use transactions for related updates (donation + campaign + donor)
- Implement proper indexing for donation queries
- Consider read replicas for reporting queries

### 3. Caching

- Cache campaign data for payment session creation
- Use Redis for session state if needed
- Implement proper cache invalidation

## Compliance and Legal

### 1. PCI Compliance

- Never store credit card information
- Use Stripe's secure payment forms
- Implement proper data handling practices

### 2. Tax Receipts

- Generate receipts for tax-deductible donations
- Store receipt information securely
- Provide easy access to historical receipts

### 3. Data Privacy

- Handle donor information according to privacy laws
- Implement proper data retention policies
- Provide options for data deletion

## Future Enhancements

### 1. Additional Payment Methods

- Bank transfers (ACH)
- Digital wallets (Apple Pay, Google Pay)
- Cryptocurrency donations

### 2. Advanced Features

- Donation matching campaigns
- Peer-to-peer fundraising
- Corporate donation portals

### 3. Analytics

- Advanced donation analytics
- Donor behavior tracking
- Campaign performance metrics

## Troubleshooting

### Common Issues

1. **Webhook Not Received**
    - Check webhook endpoint URL configuration in Stripe dashboard
    - Verify webhook secret matches environment variable
    - Check server logs for webhook processing errors

2. **Duplicate Donations**
    - Verify idempotency logic using transaction_id
    - Check for webhook retry handling

3. **Payment Amount Mismatch**
    - Verify tier amount calculations
    - Check currency conversion if applicable

4. **Anonymous Donation Issues**
    - Ensure anonymous donor ID (0) is handled correctly
    - Verify email receipt logic skips anonymous donations

5. **Recurring Payment Problems**
    - Check Stripe price ID configuration
    - Verify subscription webhook handling
    - Monitor invoice.paid events
