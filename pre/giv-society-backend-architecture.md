# GIV Society Backend Architecture & Workflow Documentation

## 🏗️ 1. Architecture Overview

**Stack:**

- **Runtime:** Node.js (ESM syntax)
- **Framework:** Express.js
- **Database:** MySQL (based on giv.sql schema)
- **ORM:** Prisma / Sequelize / Knex (recommend Prisma)
- **Authentication:** JWT + bcrypt, optional OAuth
- **File Storage:** AWS S3 / Cloudflare R2 or local
- **Email Service:** SendGrid / Mailgun
- **Payments:** Telebirr, PayPal, Stripe
- **Admin Panel:** Express-based or headless CMS (Strapi/Directus)
- **Multilingual:** i18n middleware + DB language fields
- **Analytics:** Google Analytics
- **Logging/Monitoring:** Winston, Morgan, Sentry

---

## 📂 2. Professional Backend Folder Structure

```
giv-backend/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── validators/
│   ├── config/
│   ├── jobs/                 # Background jobs & schedulers
│   ├── models/               # ORM models
│   ├── prisma/               # Prisma schema (if Prisma)
│   ├── services/             # Business logic layer
│   ├── utils/                # Utilities (logger, i18n, etc.)
│   ├── app.js                # App setup
│   ├── server.js             # Entry point
├── uploads/                  # File uploads (if local)
├── tests/
├── .env
├── package.json
└── README.md
```

---

## 🔐 3. Authentication & Authorization

### Tables:
- `users`
- `role_permissions`

### Features:
- JWT login for Volunteers, Donors, Admins, Editors
- Role-based access control
- bcrypt password hashing
- Optional 2FA or OAuth (Google, Facebook)

---

## 👤 4. User Management

### Volunteer:
- `users` + `volunteer_profiles`
- Tracks skills, availability, training, hours
- Event registration, certificate downloads

### Donor:
- `users` + `donor_profiles`
- Tracks donation history, preferences

### Features:
- Registration, login
- Profile editing
- Language toggle (en/am)
- Personalized dashboards

---

## 💳 5. Donation System

### Tables:
- `donations`
- `campaigns`

### Features:
- One-time and recurring donations
- Telebirr, PayPal, Stripe integrations
- In-kind donations
- Real-time campaign progress bars
- PDF receipts and CRM auto emails

---

## 📅 6. Event Management

### Tables:
- `events`
- `event_participants`

### Features:
- Public calendar with filters
- Admin event creation & management
- Ticketing for fundraisers
- Email reminders
- Volunteer sign-ups per event

---

## 🪧 7. Content Management (CMS)

### Tables:
- `posts`
- `faqs`
- `contact_messages`

### Features:
- Multilingual blog, news, press releases
- Slug-based routing
- Editor/admin control
- Popup for recent news

---

## 🎥 8. Media & Document Management

### Tables:
- `media` (images, videos, PDFs)
- `documents` (reports, brochures)

### Features:
- File upload and linking
- Attach to events, programs, blog
- Public media & doc center
- Role-based uploads

---

## 🙋‍♀️ 9. Volunteer System

### Tables:
- `volunteer_profiles`
- `volunteer_skills`
- `skills`
- Training files in `media` or separate

### Features:
- Volunteer application forms
- Certificates and hour tracking
- Resource library (PDFs, videos)
- Testimonials & FAQ

---

## 📢 10. Testimonials, Partners & Newsletter

### Tables:
- `testimonials`
- `partners`
- `newsletter_subscribers`

### Features:
- Testimonials with role and image
- Partner logos, quotes, categories
- Email subscription form
- Newsletter archive

---

## 📈 11. Impact & Analytics

### Tables:
- `site_interactions`
- `campaigns` (progress bar)

### Features:
- Real-time impact stats
- Admin analytics dashboard
- Google Analytics integration

---

## 🛡️ 12. Security and Performance

- HTTPS/SSL encryption
- Helmet.js headers
- Rate limiting
- Input validation (Joi or express-validator)
- SQL injection-safe queries (ORM)
- File upload sanitization
- CORS configuration
- GDPR-style data policies

---

## 🖥️ 13. Admin Dashboard (CMS or Internal)

- Role-based access:
  - Admin (full)
  - Editor (content only)
  - Volunteer Manager
- Dashboard for donations, users, media
- Reports export

---

## 🔁 14. Background Jobs (CRON)

- Scheduled donation emails
- Event reminders
- Monthly newsletter delivery
- Acknowledgment and receipts

---

## 🧪 15. Testing & Deployment

### Testing:
- Unit: Jest
- Integration: Supertest

### DevOps:
- Dockerized services
- CI/CD: GitHub Actions or GitLab CI
- `.env` support per environment
- Logging with Winston
- Monitoring via Sentry or PM2

---

## ✅ Summary of Key Components (Database Tables)

| Feature                 | Table(s) Involved                                    |
|------------------------|------------------------------------------------------|
| Authentication         | `users`, `role_permissions`                          |
| Volunteers             | `volunteer_profiles`, `volunteer_skills`, `skills`   |
| Donors                 | `donor_profiles`, `donations`                        |
| Donations              | `donations`, `campaigns`                             |
| Events                 | `events`, `event_participants`                       |
| Programs               | `programs`, `media`, `testimonials`                  |
| CMS (Blog/News)        | `posts`, `faqs`, `media`                             |
| Media Center           | `media`, `documents`                                 |
| Contact & Feedback     | `contact_messages`, `testimonials`                   |
| Partners               | `partners`                                           |
| Newsletter             | `newsletter_subscribers`                             |
| Site Activity          | `site_interactions`                                  |
| Emails                 | `email_logs`                                         |

---

## 🌐 16. Multilingual Support

### Tables with Language Support:
- `campaigns` - Campaign titles and descriptions
- `events` - Event details and descriptions
- `programs` - Program information
- `posts` - Blog posts and news articles
- `media` - Media titles and descriptions
- `testimonials` - User testimonials
- `faqs` - Frequently asked questions
- `partners` - Partner information and quotes
- `documents` - Document titles and descriptions

### Implementation:
- `language` field: ENUM('en', 'am') for English and Amharic
- `translation_group_id` field: Links different language versions
- Automatic UUID generation for translation groups
- Language-based content filtering and retrieval

---

> Built to serve the mission of **GIV Society Ethiopia** — scalable, secure, and impactful.