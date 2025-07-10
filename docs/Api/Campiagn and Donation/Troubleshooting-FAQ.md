# Troubleshooting and FAQ - Campaign and Donation System

## Common Issues and Solutions

### 1. Campaign Issues

#### Q: Campaign creation fails with "SLUG_EXISTS" error
**Problem**: Attempting to create a campaign with a title that generates a duplicate slug.

**Solution**:
```javascript
// The system automatically generates slugs from titles
// If you get SLUG_EXISTS error, modify the title slightly
const campaignData = {
  title: "Clean Water Initiative 2024", // Instead of "Clean Water Initiative"
  description: "...",
  // ... other fields
};
```

**Backend Logic**: The system generates slugs by converting titles to lowercase, replacing spaces with hyphens, and removing special characters. Ensure campaign titles are unique enough to generate unique slugs.

#### Q: Campaign statistics not updating after donations
**Problem**: Campaign `current_amount` and `donor_count` not reflecting recent donations.

**Troubleshooting Steps**:
1. Check if donations have `payment_status: 'completed'`
2. Verify webhook processing is working
3. Check server logs for database update errors

**Solution**:
```sql
-- Manually verify campaign stats
SELECT 
  c.id,
  c.title,
  c.current_amount,
  c.donor_count,
  SUM(d.amount) as actual_total,
  COUNT(d.id) as actual_count
FROM campaigns c
LEFT JOIN donations d ON c.id = d.campaign_id 
WHERE d.payment_status = 'completed'
GROUP BY c.id;
```

#### Q: Translation groups not working properly
**Problem**: Campaign translations not linking correctly.

**Solution**: Ensure all translations share the same `translation_group_id`:
```javascript
// When adding translation, use the same translation_group_id
const translationData = {
  title: "የንጹህ ውሃ ተነሳሽነት",
  description: "...",
  language: "am"
  // translation_group_id is automatically handled
};
```

### 2. Donation Issues

#### Q: Anonymous donations not working
**Problem**: Anonymous donations failing or being attributed to users.

**Solution**: Ensure the frontend doesn't send authentication headers for anonymous donations:
```javascript
// Correct: No Authorization header for anonymous donations
const response = await fetch('/api/donations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
    // No Authorization header
  },
  body: JSON.stringify(donationData)
});
```

#### Q: Duplicate donations from webhook retries
**Problem**: Stripe webhooks creating multiple donation records.

**Solution**: The system uses `transaction_id` for idempotency. Ensure your Stripe integration includes unique transaction IDs:
```javascript
// Backend automatically handles idempotency
// Check for existing donation with same transaction_id
const existingDonation = await prisma.donations.findFirst({
  where: { transaction_id: webhookData.transaction_id }
});

if (existingDonation) {
  return { success: true, donation: existingDonation };
}
```

#### Q: Email receipts not being sent
**Problem**: Donors not receiving email receipts after successful donations.

**Troubleshooting**:
1. Check if donation is anonymous (`is_anonymous: true` doesn't send emails)
2. Verify email service configuration
3. Check email logs table

**Solution**:
```javascript
// Check email logs
const emailLogs = await prisma.email_logs.findMany({
  where: {
    recipient: donorEmail,
    template_used: 'donationReceipt'
  },
  orderBy: { sent_at: 'desc' }
});
```

### 3. Stripe Integration Issues

#### Q: Stripe webhook signature verification failing
**Problem**: Webhook events returning "Webhook Error: Invalid signature".

**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` environment variable
2. Ensure raw body is passed to webhook handler
3. Check Stripe dashboard for webhook endpoint configuration

```javascript
// Correct webhook setup in Express
app.use('/api/v1/payments/stripe/webhook', express.raw({type: 'application/json'}));
app.post('/api/v1/payments/stripe/webhook', stripeController.stripeWebhook);
```

#### Q: Payment sessions not redirecting properly
**Problem**: Users not redirected to success/cancel pages after payment.

**Solution**: Verify frontend URL configuration:
```env
FRONTEND_URL=https://your-actual-domain.com
```

```javascript
// Backend uses this for success/cancel URLs
const sessionParams = {
  success_url: `${process.env.FRONTEND_URL}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/donation-cancelled`
};
```

#### Q: Recurring donations not processing correctly
**Problem**: Subscription payments not creating donation records.

**Solution**: Ensure `invoice.paid` webhook is configured and handled:
```javascript
// Check Stripe dashboard webhook events
// Ensure these events are enabled:
// - checkout.session.completed
// - invoice.paid
// - checkout.session.async_payment_succeeded
```

### 4. Donor Profile Issues

#### Q: Donor profile not created automatically
**Problem**: User makes donation but donor profile isn't created.

**Solution**: Check the donation creation logic:
```javascript
// This should happen automatically in donation service
if (dbUser && !dbUser.is_donor) {
  await prisma.users.update({ 
    where: { id: BigInt(userId) }, 
    data: { is_donor: true } 
  });
  
  await prisma.donor_profiles.create({
    data: {
      user_id: userId,
      is_recurring_donor: false,
      is_anonymous: false
    }
  });
}
```

#### Q: Donation tier not updating
**Problem**: Donor tier remains the same despite increased total donations.

**Solution**: Tier calculation is based on `total_donated` field. Check if this field is being updated:
```sql
-- Check donor profile totals
SELECT 
  dp.user_id,
  dp.total_donated,
  dp.donation_tier,
  SUM(d.amount) as actual_total
FROM donor_profiles dp
LEFT JOIN donations d ON dp.user_id = d.donor_id
WHERE d.payment_status = 'completed'
GROUP BY dp.user_id;
```

### 5. Authentication and Authorization Issues

#### Q: "UNAUTHORIZED" errors for valid tokens
**Problem**: API returning 401 errors despite valid authentication.

**Troubleshooting**:
1. Check token expiration
2. Verify token format (Bearer prefix)
3. Check middleware order

**Solution**:
```javascript
// Correct token format
const headers = {
  'Authorization': `Bearer ${token}` // Note the space after "Bearer"
};

// Check token expiration
const tokenData = JSON.parse(atob(token.split('.')[1]));
const isExpired = tokenData.exp < Date.now() / 1000;
```

#### Q: Admin-only endpoints accessible by regular users
**Problem**: Security middleware not properly restricting access.

**Solution**: Verify middleware order in routes:
```javascript
// Correct order: authenticate first, then check admin role
router.post('/', 
  authenticateToken,    // First: verify token
  requireAdmin,         // Second: check admin role
  campaignController.createCampaign
);
```

### 6. Database Issues

#### Q: BigInt serialization errors
**Problem**: JSON serialization failing with BigInt values.

**Solution**: The system includes automatic BigInt conversion:
```javascript
// This is handled automatically in services
const convertBigIntToString = (obj) => {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
};
```

#### Q: Foreign key constraint errors
**Problem**: Database operations failing due to missing references.

**Common Causes**:
- Trying to create donation for non-existent campaign
- Referencing deleted user accounts
- Invalid donor profile references

**Solution**:
```javascript
// Always verify references exist before creating records
const campaign = await prisma.campaigns.findFirst({
  where: { id: campaignId, deleted_at: null }
});

if (!campaign) {
  throw new Error('Campaign not found');
}
```

## Performance Issues

### Q: Slow campaign listing with many campaigns
**Problem**: GET /api/campaigns taking too long to respond.

**Solutions**:
1. Implement proper pagination
2. Add database indexes
3. Use caching for frequently accessed data

```sql
-- Add indexes for common queries
CREATE INDEX idx_campaigns_active_featured ON campaigns(is_active, is_featured);
CREATE INDEX idx_campaigns_category_language ON campaigns(category, language);
CREATE INDEX idx_donations_campaign_status ON donations(campaign_id, payment_status);
```

### Q: Memory issues with large donation datasets
**Problem**: Server running out of memory when processing donations.

**Solutions**:
1. Use streaming for large datasets
2. Implement proper pagination
3. Use database aggregation instead of in-memory calculations

```javascript
// Use database aggregation for statistics
const stats = await prisma.donations.aggregate({
  where: { payment_status: 'completed' },
  _sum: { amount: true },
  _count: { id: true }
});
```

## Development and Testing Issues

### Q: Tests failing due to database state
**Problem**: Unit tests interfering with each other.

**Solution**: Use proper test isolation:
```javascript
// Use transactions for test isolation
beforeEach(async () => {
  await prisma.$transaction(async (tx) => {
    // Setup test data
  });
});

afterEach(async () => {
  await prisma.$transaction(async (tx) => {
    // Cleanup test data
  });
});
```

### Q: Stripe webhooks not working in development
**Problem**: Local development not receiving webhook events.

**Solution**: Use Stripe CLI for local webhook forwarding:
```bash
# Install Stripe CLI
npm install -g stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/v1/payments/stripe/webhook

# Use the webhook secret provided by CLI
STRIPE_WEBHOOK_SECRET=whsec_local_development_secret
```

## Monitoring and Debugging

### Q: How to monitor donation processing health
**Solution**: Implement health checks and monitoring:

```javascript
// Health check endpoint
app.get('/api/health/donations', async (req, res) => {
  try {
    // Check recent donation processing
    const recentDonations = await prisma.donations.count({
      where: {
        created_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });

    // Check webhook processing
    const failedWebhooks = await prisma.webhook_logs.count({
      where: {
        status: 'failed',
        created_at: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });

    res.json({
      status: 'healthy',
      recentDonations,
      failedWebhooks,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### Q: How to debug webhook processing
**Solution**: Add comprehensive logging:

```javascript
// Enhanced webhook logging
exports.stripeWebhook = async (req, res) => {
  const eventId = req.headers['stripe-signature']?.split(',')[0];
  
  logger.info('Webhook received', {
    eventId,
    eventType: req.body?.type,
    timestamp: new Date().toISOString()
  });

  try {
    // Process webhook
    const result = await processWebhook(req.body);
    
    logger.info('Webhook processed successfully', {
      eventId,
      result
    });
    
    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', {
      eventId,
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
```

## Best Practices for Prevention

### 1. Always Use Transactions for Related Operations
```javascript
// Good: Use transaction for related updates
await prisma.$transaction(async (tx) => {
  const donation = await tx.donations.create({ data: donationData });
  await tx.campaigns.update({
    where: { id: campaignId },
    data: {
      current_amount: { increment: amount },
      donor_count: { increment: 1 }
    }
  });
  await tx.donor_profiles.update({
    where: { user_id: donorId },
    data: {
      total_donated: { increment: amount },
      last_donation_date: new Date()
    }
  });
});
```

### 2. Implement Proper Error Handling
```javascript
// Good: Comprehensive error handling
try {
  const result = await campaignService.createCampaign(data, userId);
  return res.status(201).json(result);
} catch (error) {
  logger.error('Campaign creation failed', { error, userId, data });
  
  if (error.code === 'VALIDATION_ERROR') {
    return res.status(400).json({
      success: false,
      errors: error.errors,
      code: error.code
    });
  }
  
  return res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  });
}
```

### 3. Use Proper Validation
```javascript
// Good: Validate all inputs
const { error, value } = donationSchema.validate(req.body);
if (error) {
  return res.status(400).json({
    success: false,
    errors: error.details.map(d => d.message),
    code: 'VALIDATION_ERROR'
  });
}
```

### 4. Implement Rate Limiting
```javascript
// Good: Rate limiting for sensitive endpoints
const rateLimit = require('express-rate-limit');

const donationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 donations per window
  message: 'Too many donation attempts, please try again later'
});

router.post('/donations', donationLimiter, donationController.createDonation);
```

## Getting Help

### 1. Check Logs First
- Application logs: `/var/log/giv-society/`
- Database logs: Check MySQL/PostgreSQL logs
- Stripe dashboard: Check webhook delivery status

### 2. Use Debug Mode
```env
NODE_ENV=development
DEBUG=giv-society:*
LOG_LEVEL=debug
```

### 3. Database Debugging
```sql
-- Check recent errors
SELECT * FROM error_logs ORDER BY created_at DESC LIMIT 10;

-- Check webhook processing
SELECT * FROM webhook_logs WHERE status = 'failed' ORDER BY created_at DESC;

-- Verify data consistency
SELECT 
  c.id,
  c.current_amount,
  SUM(d.amount) as calculated_amount
FROM campaigns c
LEFT JOIN donations d ON c.id = d.campaign_id
WHERE d.payment_status = 'completed'
GROUP BY c.id
HAVING c.current_amount != calculated_amount;
```
