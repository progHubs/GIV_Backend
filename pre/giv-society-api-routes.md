# GIV Society API Endpoints

Base URL: `/api/v1/`

---

## 🧑‍💼 Auth & User Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /auth/register         | Register user (volunteer/donor) |
| POST   | /auth/login            | Login and receive JWT |
| POST   | /auth/logout           | Logout user (invalidate token) |
| POST   | /auth/refresh          | Refresh token |
| GET    | /auth/me               | Get current logged-in user |
| PATCH  | /auth/change-password  | Change password |
| POST   | /auth/request-reset    | Request password reset |
| POST   | /auth/reset-password   | Reset password with token |

---

## 👤 User Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /users                 | Get all users (admin) |
| GET    | /users/:id             | Get user by ID |
| PATCH  | /users/:id             | Update user info |
| DELETE | /users/:id             | Delete user (admin only) |
| PATCH  | /users/:id/language    | Update language preference |

---

## 🙋 Volunteer Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /volunteers             | List all volunteers (admin) |
| GET    | /volunteers/:id         | Get volunteer profile |
| POST   | /volunteers             | Create volunteer profile |
| PATCH  | /volunteers/:id         | Update volunteer profile |
| GET    | /volunteers/:id/certificate | Get/download certificate |
| GET    | /volunteers/:id/skills  | Get volunteer skills |
| POST   | /volunteers/:id/skills  | Add skill to volunteer |
| DELETE | /volunteers/:id/skills/:skillId | Remove skill from volunteer |

---

## 💰 Donor Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /donors               | List donors (admin) |
| GET    | /donors/:id           | Get donor profile |
| POST   | /donors               | Create donor profile |
| PATCH  | /donors/:id           | Update donor profile |

---

## 🎯 Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /campaigns            | Get all campaigns |
| GET    | /campaigns/:id        | Get single campaign |
| POST   | /campaigns            | Create campaign (admin) |
| PATCH  | /campaigns/:id        | Update campaign (admin) |
| DELETE | /campaigns/:id        | Delete campaign |
| GET    | /campaigns/:id/translations | Get all language versions |

---

## 💳 Donations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /donations            | List all donations (admin) |
| GET    | /donations/me         | Get logged-in user's donations |
| POST   | /donations            | Make a donation |
| GET    | /donations/:id        | Get specific donation |
| GET    | /donations/:id/receipt| Get/download receipt (PDF) |

---

## 📆 Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /events               | List all events (public) |
| GET    | /events/:id           | Get event details |
| POST   | /events               | Create new event |
| PATCH  | /events/:id           | Update event |
| DELETE | /events/:id           | Delete event |
| GET    | /events/:id/translations | Get all language versions |

---

## 👥 Event Participants

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /events/:id/participants | List all participants |
| POST   | /events/:id/register     | Register for event |
| DELETE | /events/:id/unregister   | Remove self from event |
| PATCH  | /events/:id/participants/:userId | Update participant status |

---

## 📚 Programs & Initiatives

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /programs             | List all programs |
| GET    | /programs/:id         | Get program details |
| POST   | /programs             | Create new program |
| PATCH  | /programs/:id         | Update program |
| DELETE | /programs/:id         | Delete program |
| GET    | /programs/:id/translations | Get all language versions |

---

## 📰 Blog / News / Press

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /posts               | List all posts |
| GET    | /posts/:slug         | Get post by slug |
| POST   | /posts               | Create post |
| PATCH  | /posts/:id           | Update post |
| DELETE | /posts/:id           | Delete post |
| GET    | /posts/:id/translations | Get all language versions |

---

## 🎞️ Media Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /media               | List all media |
| POST   | /media               | Upload media |
| DELETE | /media/:id           | Delete media |
| GET    | /media/:id/translations | Get all language versions |

---

## 📄 Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /documents            | List documents |
| POST   | /documents            | Upload document |
| DELETE | /documents/:id        | Delete document |
| GET    | /documents/:id/download | Download document |
| GET    | /documents/:id/translations | Get all language versions |

---

## 💬 Testimonials

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /testimonials         | List all testimonials |
| POST   | /testimonials         | Create testimonial |
| DELETE | /testimonials/:id     | Delete testimonial (admin) |
| GET    | /testimonials/:id/translations | Get all language versions |

---

## 🤝 Partners

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /partners             | List all partners |
| POST   | /partners             | Create partner |
| DELETE | /partners/:id         | Delete partner |
| GET    | /partners/:id/translations | Get all language versions |

---

## 📨 Contact & Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /contact              | Submit contact form |
| GET    | /contact-messages     | Admin get all messages |
| GET    | /contact-messages/:id | View specific message |
| DELETE | /contact-messages/:id | Delete message |
| PATCH  | /contact-messages/:id/status | Update message status |

---

## 🧠 FAQ

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /faqs                | List FAQs |
| POST   | /faqs                | Add FAQ |
| PATCH  | /faqs/:id            | Update FAQ |
| DELETE | /faqs/:id            | Delete FAQ |
| GET    | /faqs/:id/translations | Get all language versions |

---

## 📬 Newsletter

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | /newsletter/subscribe | Subscribe to newsletter |
| GET    | /newsletter/subscribers | Admin view subscribers |
| DELETE | /newsletter/unsubscribe | Unsubscribe from newsletter |

---

## 🛠️ Skills Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /skills              | List all skills |
| POST   | /skills              | Create new skill |
| PATCH  | /skills/:id          | Update skill |
| DELETE | /skills/:id          | Delete skill |

---

## 📈 Site Interaction Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /analytics/interactions | Admin view site interactions |
| POST   | /analytics/track        | Log interaction (frontend call) |

---

## 📧 Email Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /emails              | View email logs |
| GET    | /emails/:id          | Get specific email log |

---

## 🌐 Multilingual Content

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | /content/:type/:id/translations | Get all translations for content |
| POST   | /content/:type/:id/translations | Create translation |
| PATCH  | /content/:type/:id/translations/:language | Update specific translation |
| DELETE | /content/:type/:id/translations/:language | Delete specific translation |