# 📖 Donation System API Documentation (Frontend Guide)

## Overview

The donation system supports both **authenticated** (logged-in) and **anonymous** (unregistered) users. It allows users to:
- Make donations to campaigns
- Retrieve donation details and receipts
- View their own donation history (if authenticated)
- (Admin) List all donations

All endpoints are under the base URL:  
`/api/v1/donations`

---

## 1. Make a Donation

### **POST /api/v1/donations**

- **Description:** Create a new donation (supports both anonymous and authenticated users).
- **Authentication:** Optional (JWT Bearer token for logged-in users).

### **Request Body**

| Field            | Type      | Required | Description                                 |
|------------------|-----------|----------|---------------------------------------------|
| campaign_id      | number    | Yes      | ID of the campaign to donate to             |
| amount           | number    | Yes      | Donation amount (e.g., 100.00)              |
| currency         | string    | No       | Currency code (default: "USD")              |
| donation_type    | string    | Yes      | "one_time", "recurring", or "in_kind"       |
| payment_method   | string    | No       | e.g., "paypal", "stripe", "telebirr"        |
| is_anonymous     | boolean   | No       | If true, donor will be marked as anonymous  |
| notes            | string    | No       | Optional message/note                       |

#### Example (Anonymous Donation)
```json
{
  "campaign_id": 1,
  "amount": 50.00,
  "donation_type": "one_time",
  "is_anonymous": true,
  "payment_method": "paypal"
}
```

#### Example (Authenticated Donation)
```json
{
  "campaign_id": 2,
  "amount": 100.00,
  "donation_type": "recurring",
  "is_anonymous": false,
  "payment_method": "stripe"
}
```

### **Headers**
- For authenticated users:  
  `Authorization: Bearer <JWT_TOKEN>`

### **Response**
- **201 Created**  
  ```json
  {
    "success": true,
    "data": {
      "id": 123,
      "donor_id": 5,
      "campaign_id": 2,
      "amount": "100.00",
      "currency": "USD",
      "donation_type": "recurring",
      "payment_method": "stripe",
      "payment_status": "pending",
      "is_anonymous": false,
      "notes": null,
      "donated_at": "2024-06-01T12:34:56.000Z"
    }
  }
  ```
- **Error Example**
  ```json
  {
    "success": false,
    "message": "Validation error: amount is required"
  }
  ```

---

## 2. Get Donation by ID

### **GET /api/v1/donations/:id**

- **Description:** Retrieve details of a specific donation.
- **Authentication:** Not required (but only admins can access all donations; users can only access their own).

### **Response**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "donor_id": 5,
    "campaign_id": 2,
    "amount": "100.00",
    "currency": "USD",
    "donation_type": "recurring",
    "payment_method": "stripe",
    "payment_status": "completed",
    "is_anonymous": false,
    "notes": null,
    "donated_at": "2024-06-01T12:34:56.000Z"
  }
}
```

---

## 3. Get My Donations (Authenticated Users)

### **GET /api/v1/donations/me**

- **Description:** Retrieve all donations made by the currently logged-in user.
- **Authentication:** **Required** (JWT Bearer token).

### **Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "campaign_id": 2,
      "amount": "100.00",
      "donation_type": "recurring",
      "is_anonymous": false,
      "donated_at": "2024-06-01T12:34:56.000Z"
    }
    // ...more donations
  ]
}
```

---

## 4. Get Donation Receipt (PDF)

### **GET /api/v1/donations/:id/receipt**

- **Description:** Download a PDF receipt for a specific donation.
- **Authentication:** Required for user's own donations; admin for any donation.

### **Response**
- Returns a PDF file as a download.

---

## 5. (Admin) List All Donations

### **GET /api/v1/donations**

- **Description:** List all donations (admin only).
- **Authentication:** **Required** (admin JWT).

### **Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "donor_id": 5,
      "campaign_id": 2,
      "amount": "100.00",
      "is_anonymous": false,
      "donated_at": "2024-06-01T12:34:56.000Z"
    }
    // ...more donations
  ]
}
```

---

## 6. Donation Object Reference

| Field            | Type      | Description                                      |
|------------------|-----------|--------------------------------------------------|
| id               | number    | Donation ID                                      |
| donor_id         | number    | Donor profile ID (anonymous or user)             |
| campaign_id      | number    | Campaign ID                                      |
| amount           | string    | Donation amount                                  |
| currency         | string    | Currency code (e.g., "USD")                      |
| donation_type    | string    | "one_time", "recurring", or "in_kind"            |
| payment_method   | string    | Payment method used                              |
| payment_status   | string    | "pending", "completed", "failed"                 |
| is_anonymous     | boolean   | Whether the donation is anonymous                |
| notes            | string    | Optional note/message                            |
| donated_at       | string    | ISO timestamp of donation                        |

---

## 7. Authentication & Anonymous Donations

- **Authenticated Users:**  
  - Must include `Authorization: Bearer <JWT_TOKEN>` header.
  - Their donation will be linked to their donor profile.
- **Anonymous Users:**  
  - No authentication required.
  - Their donation will be linked to a reserved "anonymous" donor profile in the backend.
  - If `is_anonymous` is true, the donor's name will not be shown in public listings.

---

## 8. Validation & Error Handling

- All required fields must be present; otherwise, a 400 error is returned.
- Amount must be a positive number.
- `donation_type` must be one of: `"one_time"`, `"recurring"`, `"in_kind"`.
- If the campaign does not exist, a 404 error is returned.
- If the user is not authenticated for `/me` or `/receipt`, a 401 error is returned.

---

## 9. Example Usage (Frontend)

### **Making a Donation (Anonymous)**
```js
fetch('/api/v1/donations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    campaign_id: 1,
    amount: 25,
    donation_type: 'one_time',
    is_anonymous: true
  })
})
```

### **Making a Donation (Authenticated)**
```js
fetch('/api/v1/donations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <JWT_TOKEN>'
  },
  body: JSON.stringify({
    campaign_id: 2,
    amount: 100,
    donation_type: 'recurring',
    is_anonymous: false
  })
})
```

### **Get My Donations**
```js
fetch('/api/v1/donations/me', {
  headers: { 'Authorization': 'Bearer <JWT_TOKEN>' }
})
```

---

## 10. Best Practices

- Always validate user input before sending to the API.
- For anonymous donations, encourage users to provide an email if they want a receipt (if supported).
- Handle all error responses gracefully and display user-friendly messages.
- For authenticated users, refresh JWT tokens as needed to avoid 401 errors.
- Use HTTPS for all API requests in production.

---

## 11. FAQ

**Q: Can users donate without logging in?**  
A: Yes! Anonymous donations are fully supported.

**Q: How do we show/hide donor names?**  
A: Use the `is_anonymous` field in the donation object. If true, do not display the donor's name.

**Q: How do we get a donation receipt?**  
A: Use the `/api/v1/donations/:id/receipt` endpoint (authenticated).

**Q: How do we show a user's donation history?**  
A: Use the `/api/v1/donations/me` endpoint (authenticated).

---

