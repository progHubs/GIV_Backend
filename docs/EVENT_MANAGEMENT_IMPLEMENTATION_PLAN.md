# Event Management System Implementation Plan

## 1. Overview & Objectives

The Event Management System enables GIV Society to create, manage, and track events, including volunteer sign-ups, participant management, reminders, and analytics. It supports multilingual content, role-based permissions, and seamless integration with user and volunteer systems.

**Key Goals:**
- Allow admins to create and manage events
- Enable users/volunteers to register for events
- Track participation, hours, and feedback
- Support event reminders and notifications
- Provide analytics and reporting
- Multilingual support (English/Amharic)

---

## 2. Database Schema & Key Tables

### 2.1. `events`
| Field                  | Type      | Description                                 |
|------------------------|-----------|---------------------------------------------|
| id                     | bigint    | Primary key                                 |
| title                  | string    | Event title                                 |
| slug                   | string    | Unique slug for URL                         |
| description            | text      | Event description                           |
| event_date             | date      | Date of event                               |
| event_time             | time      | Time of event                               |
| timezone               | string    | Timezone                                    |
| location               | string    | Physical/virtual location                   |
| latitude/longitude     | decimal   | Geolocation (optional)                      |
| category               | string    | Event category                              |
| capacity               | int       | Max participants                            |
| registered_count       | int       | Number of registered participants           |
| status                 | enum      | upcoming/ongoing/completed/cancelled        |
| registration_deadline  | datetime  | Last date/time to register                  |
| registration_link      | string    | External registration link (optional)       |
| agenda                 | text      | Event agenda                                |
| speaker_info           | json      | Speaker details                             |
| requirements           | text      | Participation requirements                  |
| ticket_price           | decimal   | Ticket price (if any)                       |
| ticket_link            | string    | Ticket purchase link                        |
| is_featured            | boolean   | Highlighted event                           |
| created_by             | bigint    | User who created the event                  |
| language               | enum      | 'en' or 'am'                                |
| translation_group_id   | string    | For multilingual support                    |
| created_at/updated_at  | datetime  | Timestamps                                  |
| deleted_at             | datetime  | Soft delete                                 |

### 2.2. `event_participants`
| Field              | Type      | Description                                 |
|--------------------|-----------|---------------------------------------------|
| event_id           | bigint    | Event reference                             |
| user_id            | bigint    | User reference                              |
| role               | enum      | volunteer/attendee/organizer                |
| status             | enum      | registered/confirmed/attended/no_show       |
| hours_contributed  | decimal   | Volunteer hours                             |
| feedback           | text      | Participant feedback                        |
| rating             | int       | 1-5 rating                                  |
| registered_at      | datetime  | Registration timestamp                      |
| attended_at        | datetime  | Attendance timestamp                        |

---

## 3. API Endpoints

### 3.1. Event CRUD (Admin/Editor)
- `POST   /api/v1/events`           — Create event
- `GET    /api/v1/events`           — List/filter events (public, with filters)
- `GET    /api/v1/events/:id`       — Get event details
- `PATCH  /api/v1/events/:id`       — Update event (admin/editor)
- `DELETE /api/v1/events/:id`       — Soft delete event (admin)

### 3.2. Event Registration & Participation
- `POST   /api/v1/events/:id/register`         — Register for event (user/volunteer)
- `GET    /api/v1/events/:id/participants`     — List participants (admin/organizer)
- `PATCH  /api/v1/events/:id/participants/:user_id` — Update participant status/feedback (admin/organizer)
- `DELETE /api/v1/events/:id/participants/:user_id` — Remove participant (admin/organizer)

### 3.3. Analytics & Reporting
- `GET    /api/v1/events/:id/analytics`        — Event stats (admin/organizer)
- `GET    /api/v1/events/analytics`            — Aggregate stats (admin)

### 3.4. Public Calendar & Featured Events
- `GET    /api/v1/events/calendar`             — Public calendar view
- `GET    /api/v1/events/featured`             — List featured events

---

## 4. Backend Architecture & File Structure

| Layer         | File(s)                                    | Purpose                                  |
|--------------|--------------------------------------------|------------------------------------------|
| Controller   | `src/api/controllers/event.controller.js`  | Handle HTTP requests, validation, response|
| Service      | `src/services/event.service.js`             | Business logic, DB operations            |
| Validator    | `src/api/validators/event.validator.js`     | Input validation (Joi/express-validator) |
| Routes       | `src/api/routes/event.routes.js`            | Route definitions, middleware            |
| Participant  | `eventParticipant.controller.js`, `eventParticipant.service.js`, `eventParticipant.validator.js`, `eventParticipant.routes.js` | Participant management                   |
| Utils        | `src/utils/event.util.js`                   | Helper functions (date, calendar, etc.)  |

---

## 5. Multilingual Support
- `language` and `translation_group_id` fields in `events`
- Endpoints accept `?lang=en|am` for filtering
- Controllers/services handle translation group logic

---

## 6. Permissions & Roles
- **Admin/Editor:** Full CRUD on events, manage participants
- **Organizer:** Manage participants, view analytics
- **Volunteer/User:** Register, view own participation, feedback
- **Public:** View events, calendar, featured events
- Use JWT and role-based middleware for access control

---

## 7. Validation & Error Handling
- Use Joi or express-validator for all input
- Validate event dates, capacity, required fields
- Return clear error messages and status codes

---

## 8. Event Registration & Participant Management
- Users/volunteers can register for events (if not full, before deadline)
- Prevent duplicate registrations
- Track status: registered, confirmed, attended, no_show
- Allow feedback and rating after event
- Admin/organizer can update status, hours, feedback

---

## 9. Notifications & Background Jobs
- Email reminders to registered participants (before event)
- Confirmation emails on registration
- Post-event feedback requests
- Use background jobs (cron) for scheduled reminders

---

## 10. Analytics & Reporting
- Track registrations, attendance, hours contributed
- Event-level and aggregate stats
- Export reports (CSV/Excel, optional)

---

## 11. Testing, Security, & Deployment
- Unit and integration tests for all endpoints
- Input validation and sanitization
- Rate limiting and authentication
- Soft delete for events (preserve data)
- Logging and monitoring (Winston, Sentry)
- API documentation (OpenAPI/Swagger)

---

## 12. Implementation Roadmap

### **Phase 1: Core Event CRUD**
- [ ] Implement event model, controller, service, validator, routes
- [ ] Admin/editor CRUD endpoints
- [ ] Multilingual support
- [ ] Public event listing and details

### **Phase 2: Registration & Participation**
- [ ] Participant model, controller, service, validator, routes
- [ ] Registration endpoint and logic
- [ ] Participant status management
- [ ] Prevent duplicate/late registrations

### **Phase 3: Notifications & Reminders**
- [ ] Email confirmation/reminder jobs
- [ ] Feedback request after event
- [ ] Background job scheduling

### **Phase 4: Analytics & Reporting**
- [ ] Event and aggregate analytics endpoints
- [ ] Reporting/export features

### **Phase 5: Testing & Documentation**
- [ ] Unit/integration tests
- [ ] API documentation
- [ ] Security review

---

## 13. References & Related Files
- `prisma/schema.prisma` — Event and participant models
- `src/api/routes/event.routes.js` — Route definitions
- `src/api/controllers/event.controller.js` — Controller logic
- `src/services/event.service.js` — Business logic
- `src/api/validators/event.validator.js` — Input validation
- `src/utils/event.util.js` — Utilities

---

> This plan provides a clear, phased roadmap for implementing a robust, multilingual, and secure Event Management System for GIV Society, supporting all core event and participant workflows. 