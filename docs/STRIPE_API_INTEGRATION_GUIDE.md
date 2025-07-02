# Stripe API Integration Guide for GIV Society Backend

## Overview

The GIV Society backend integrates Stripe to securely process donations, supporting:
- One-time and recurring (subscription) donations
- User-defined and fixed-tier donation amounts
- Anonymous and authenticated donations
- Automatic email receipts
- Secure webhook handling for payment confirmation

All Stripe-related endpoints are namespaced under:
`/api/v1/payments/stripe`

---

## 1. Endpoints Summary

### 1.1. Create Stripe Checkout Session
- **POST** `/api/v1/payments/stripe/session`
- **Purpose:** Initiate a Stripe Checkout session for a donation (one-time or recurring)
- **Request Body:**
  | Field        | Type     | Required | Description                                  |
  |--------------|----------|----------|----------------------------------------------|
  | amount       | number   | Yes*     | Donation amount in USD (min $1, required if no tier) |
  | tier         | string   | Yes*     | Tier name (e.g., "bronze", "silver", "gold"; required if no amount) |
  | recurring    | boolean  | Yes      | true for recurring (monthly), false for one-time |
  | campaign_id  | number   | Yes      | Target campaign ID                           |

  *Provide either `amount` or `tier`, not both.

- **Authentication:** Optional (JWT Bearer token for logged-in users)
- **Response:**
  ```json
  { "url": "https://checkout.stripe.com/pay/cs_test_..." }
  ```
- **Frontend Action:** Redirect user to the returned `url` to complete payment.

#### Example Request (One-time, anonymous):
```json
{
  "amount": 25,
  "recurring": false,
  "campaign_id": 1
}
```

#### Example Request (Recurring, tiered, authenticated):
```json
{
  "tier": "silver",
  "recurring": true,
  "campaign_id": 2
}
```

---

### 1.2. Stripe Webhook Endpoint
- **POST** `/api/v1/payments/stripe/webhook`
- **Purpose:** Stripe calls this endpoint to notify the backend of successful payments.
- **Frontend:** You do NOT call this endpoint directly.
- **Security:** Uses `express.raw` and verifies Stripe signature.
- **Events Handled:**
  - `checkout.session.completed` (one-time donations)
  - `invoice.paid` (recurring donations)
  - `checkout.session.async_payment_succeeded` (delayed payments)
- **Backend Action:**
  - Extracts metadata (campaign, donor, anonymity, type)
  - Creates/updates donation record
  - Updates campaign and donor stats
  - Sends receipt email (if not anonymous)

---

## 2. Donation Flows

### 2.1. One-Time Donation (User-Defined Amount)
- User selects a campaign and enters an amount (min $1)
- Frontend sends POST `/api/v1/payments/stripe/session` with `amount`, `recurring: false`, and `campaign_id`
- Backend returns Stripe Checkout URL
- User completes payment on Stripe
- Stripe calls webhook; backend finalizes donation

### 2.2. Recurring Donation (Tiered)
- User selects a campaign and a tier (e.g., bronze/silver/gold)
- Frontend sends POST `/api/v1/payments/stripe/session` with `tier`, `recurring: true`, and `campaign_id`
- Backend maps tier to Stripe Price ID (see `src/api/utils/stripeTiers.js`)
- User completes subscription on Stripe
- Stripe calls webhook on each successful payment

### 2.3. Anonymous vs. Authenticated Donations
- If user is **not logged in**: donation is anonymous, linked to reserved donor profile
- If user is **logged in**: donation is linked to their donor profile
- The backend determines anonymity automatically; frontend does not need to send an `is_anonymous` flag

---

## 3. Stripe Metadata & Donation Records
- The backend attaches metadata to each Stripe session:
  - `campaign_id`: Target campaign
  - `donor_id`: User ID (if authenticated) or anonymous
  - `is_anonymous`: true/false (derived from authentication)
  - `donation_type`: 'one_time' or 'recurring'
- On webhook, this metadata is used to create/update the donation record in the database.

---

## 4. Testing & Switching to Production

### 4.1. Testing
- Use Stripe test keys and test cards (e.g., 4242 4242 4242 4242)
- Test all flows: one-time, recurring, tiered, anonymous, authenticated
- Simulate webhooks using Stripe CLI or Dashboard
- Check that donation records and campaign stats update correctly

### 4.2. Switching to Production
- Update `.env` with live Stripe keys and webhook secret
- Update tier Price IDs in `src/api/utils/stripeTiers.js` to live values
- Set webhook endpoint in Stripe Dashboard to your production backend URL
- Remove any test endpoints or files
- Test with a real card before launch

---

## 5. Security & Best Practices
- Never expose secret keys to frontend
- Always use HTTPS in production
- Webhook endpoint uses signature verification
- All sensitive logic (donor identity, amount, campaign) is validated server-side
- Only allow your frontend domain via CORS

---

## 6. Reference: Key Files
- **Routes:** `src/api/routes/stripe.routes.js`
- **Controller:** `src/api/controllers/stripe.controller.js`
- **Service:** `src/services/stripe.service.js`
- **Donation Logic:** `src/services/donation.service.js`
- **Tier Mapping:** `src/api/utils/stripeTiers.js`
- **Environment:** `.env` (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`)

---

## 7. Caveats & Gotchas
- The backend determines anonymity; frontend should not send an `is_anonymous` flag
- For recurring donations, only predefined tiers are supported (see tier mapping)
- Stripe Checkout handles all card data; you never collect card info directly
- Always check for errors in the response and handle them gracefully in the frontend

---

## 8. Example: Full Donation Flow (Frontend)

1. User selects campaign and donation type (one-time/recurring, amount/tier)
2. (If logged in) Attach JWT token to request
3. POST to `/api/v1/payments/stripe/session` with required fields
4. Redirect user to returned Stripe Checkout URL
5. On success, Stripe redirects user to `/donation-success` page
6. Backend receives webhook, finalizes donation, updates stats, sends receipt
7. (Optional) Poll or query donation status via `/api/v1/donations` endpoints

---

> For any questions or issues, contact the backend team or refer to the codebase files listed above. 