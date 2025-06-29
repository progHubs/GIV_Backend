# 🧱 Complete File Structure for GIV Society Backend

This structure considers **backend scalability**, **JWT-based authentication**, **volunteer/donor systems**, **event & donation management**, **CMS**, **media handling**, **analytics**, **email**, **multilingual support**, and **skills management**.

---

## 📦 Root Structure

```
giv-backend/
├── src/
│   ├── api/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── volunteer.controller.js
│   │   │   ├── donor.controller.js
│   │   │   ├── event.controller.js
│   │   │   ├── campaign.controller.js
│   │   │   ├── donation.controller.js
│   │   │   ├── program.controller.js
│   │   │   ├── post.controller.js
│   │   │   ├── media.controller.js
│   │   │   ├── document.controller.js
│   │   │   ├── testimonial.controller.js
│   │   │   ├── partner.controller.js
│   │   │   ├── faq.controller.js
│   │   │   ├── contact.controller.js
│   │   │   ├── newsletter.controller.js
│   │   │   ├── skill.controller.js
│   │   │   ├── analytics.controller.js
│   │   │   └── email.controller.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── volunteer.routes.js
│   │   │   ├── donor.routes.js
│   │   │   ├── event.routes.js
│   │   │   ├── campaign.routes.js
│   │   │   ├── donation.routes.js
│   │   │   ├── program.routes.js
│   │   │   ├── post.routes.js
│   │   │   ├── media.routes.js
│   │   │   ├── document.routes.js
│   │   │   ├── testimonial.routes.js
│   │   │   ├── partner.routes.js
│   │   │   ├── faq.routes.js
│   │   │   ├── contact.routes.js
│   │   │   ├── newsletter.routes.js
│   │   │   ├── skill.routes.js
│   │   │   ├── analytics.routes.js
│   │   │   └── email.routes.js
│   │   ├── validators/
│   │   │   ├── auth.validator.js
│   │   │   ├── user.validator.js
│   │   │   ├── volunteer.validator.js
│   │   │   ├── donor.validator.js
│   │   │   ├── event.validator.js
│   │   │   ├── campaign.validator.js
│   │   │   ├── donation.validator.js
│   │   │   ├── program.validator.js
│   │   │   ├── post.validator.js
│   │   │   ├── contact.validator.js
│   │   │   ├── faq.validator.js
│   │   │   ├── skill.validator.js
│   │   │   └── translation.validator.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── validate.middleware.js
│   │   │   └── language.middleware.js
│   ├── config/
│   │   ├── db.config.js
│   │   ├── jwt.config.js
│   │   ├── oauth.config.js
│   │   ├── email.config.js
│   │   └── payment.config.js
│   ├── jobs/
│   │   ├── emailReminder.job.js
│   │   ├── certificateDispatcher.job.js
│   │   └── newsletterDispatcher.job.js
│   ├── models/
│   │   ├── index.js
│   │   ├── user.model.js
│   │   ├── volunteerProfile.model.js
│   │   ├── donorProfile.model.js
│   │   ├── event.model.js
│   │   ├── eventParticipant.model.js
│   │   ├── campaign.model.js
│   │   ├── donation.model.js
│   │   ├── program.model.js
│   │   ├── post.model.js
│   │   ├── media.model.js
│   │   ├── document.model.js
│   │   ├── testimonial.model.js
│   │   ├── partner.model.js
│   │   ├── faq.model.js
│   │   ├── contactMessage.model.js
│   │   ├── newsletterSubscriber.model.js
│   │   ├── siteInteraction.model.js
│   │   ├── emailLog.model.js
│   │   ├── rolePermission.model.js
│   │   ├── skill.model.js
│   │   └── volunteerSkill.model.js
│   ├── prisma/                # If using Prisma ORM
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── token.service.js
│   │   ├── email.service.js
│   │   ├── user.service.js
│   │   ├── donor.service.js
│   │   ├── volunteer.service.js
│   │   ├── campaign.service.js
│   │   ├── donation.service.js
│   │   ├── event.service.js
│   │   ├── post.service.js
│   │   ├── media.service.js
│   │   ├── document.service.js
│   │   ├── analytics.service.js
│   │   ├── contact.service.js
│   │   ├── newsletter.service.js
│   │   ├── faq.service.js
│   │   ├── skill.service.js
│   │   └── translation.service.js
│   ├── utils/
│   │   ├── jwt.util.js
│   │   ├── hash.util.js
│   │   ├── logger.util.js
│   │   ├── response.util.js
│   │   ├── i18n.util.js
│   │   ├── emailTemplate.util.js
│   │   └── translation.util.js
│   ├── app.js
│   └── server.js
├── uploads/                   # For local media files
├── public/                    # Static assets
├── tests/
│   ├── auth.test.js
│   ├── user.test.js
│   ├── donation.test.js
│   ├── translation.test.js
│   └── etc...
├── .env
├── .gitignore
├── package.json
├── README.md
└── Dockerfile
```

---

## 📋 Key Model Files (MySQL Schema Compatible)

### **Core Models:**
- `user.model.js` - `users` table
- `volunteerProfile.model.js` - `volunteer_profiles` table
- `donorProfile.model.js` - `donor_profiles` table
- `campaign.model.js` - `campaigns` table (with language support)
- `event.model.js` - `events` table (with language support)
- `program.model.js` - `programs` table (with language support)
- `post.model.js` - `posts` table (with language support)
- `media.model.js` - `media` table (with language support)
- `document.model.js` - `documents` table (with language support)
- `testimonial.model.js` - `testimonials` table (with language support)
- `partner.model.js` - `partners` table (with language support)
- `faq.model.js` - `faqs` table (with language support)

### **Relationship Models:**
- `eventParticipant.model.js` - `event_participants` table
- `volunteerSkill.model.js` - `volunteer_skills` table
- `donation.model.js` - `donations` table

### **System Models:**
- `skill.model.js` - `skills` table
- `contactMessage.model.js` - `contact_messages` table
- `newsletterSubscriber.model.js` - `newsletter_subscribers` table
- `siteInteraction.model.js` - `site_interactions` table
- `emailLog.model.js` - `email_logs` table
- `rolePermission.model.js` - `role_permissions` table

---

## 🌐 Multilingual Support Files

### **Translation Service:**
- `translation.service.js` - Handles multilingual content operations
- `translation.util.js` - Translation utilities and helpers
- `translation.validator.js` - Validation for translation operations

### **Language Middleware:**
- `language.middleware.js` - Detects and sets user language preference

---

## 🛠️ Skills Management Files

### **Skills System:**
- `skill.controller.js` - Skills CRUD operations
- `skill.routes.js` - Skills API routes
- `skill.service.js` - Skills business logic
- `skill.validator.js` - Skills validation
- `skill.model.js` - Skills table model
- `volunteerSkill.model.js` - Volunteer-skill relationships

---

This file structure includes everything required to implement a full-stack, production-ready backend system for the GIV Society project with comprehensive multilingual support and skills management.