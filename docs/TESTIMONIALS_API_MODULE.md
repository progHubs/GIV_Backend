
# 📝 Testimonials API Documentation

## Overview
The Testimonials module provides a full-featured API for managing testimonials with multi-language support. It allows users to create, read, delete, and retrieve translations of testimonials.

## Database Model
- **Table:** testimonials
- **Fields:**
  - id (BigInt, auto-increment)
  - name (string, max 100 chars)
  - role (string, max 100 chars, optional)
  - message (text)
  - image_url (string, max 512 chars, optional)
  - type (enum: volunteer, beneficiary, partner)
  - language (enum: en, am, default en)
  - translation_group_id (string, max 36 chars, optional)
  - is_featured (boolean, default false)
  - created_at (timestamp)
  - updated_at (timestamp)
  
## API Endpoints

### 1. Get All Testimonials
- **Endpoint:** `GET /testimonials`
- **Description:** Retrieves a list of all testimonials.
- **Response:** JSON array of testimonial objects with success status.

### 2. Create Testimonial
- **Endpoint:** `POST /testimonials`
- **Description:** Creates a new testimonial entry.
- **Request Body:** JSON object with testimonial fields:
  - `name` (required, string)
  - `role` (optional, string)
  - `message` (required, string, min 10 chars)
  - `type` (required, one of volunteer, beneficiary, partner)
  - `language` (optional, en or am, default en)
  - `image_url` (optional, valid URL)
  - `translation_group_id` (optional, string max 36 chars)
  - `is_featured` (optional, boolean)
- **Response:** JSON object with created testimonial data and success status.
- **Validation:** Checks all input fields with descriptive error messages.

### 3. Delete Testimonial
- **Endpoint:** `DELETE /testimonials/:id`
- **Description:** Deletes a testimonial by its ID (admin only).
- **Response:** Success or failure message with appropriate HTTP status.

### 4. Get Testimonial Translations
- **Endpoint:** `GET /testimonials/:id/translations`
- **Description:** Retrieves all language versions of a testimonial grouped by `translation_group_id`.
- **Response:** JSON array of related testimonial translations.

## Input Validation & Error Handling
- All input fields are validated in the controller layer before database interaction.
- Errors return descriptive messages with `400` status for bad requests.
- Unexpected errors return a `500` status with a general failure message.
- Deletion handles not found errors with a `404` response.

## Usage Notes
- The API supports multi-language testimonials with the ability to link translations via `translation_group_id`.
- `is_featured` flag can be used to highlight testimonials in the frontend display.
- BigInt IDs are converted to strings in responses for frontend compatibility.

## Project Structure
- **Models:** `/models` (Prisma ORM schema)
- **Controllers:** `/controllers` (Request handling, validation, and business logic)
- **Services:** `/services` (Database interaction with Prisma)
- **Routes:** `/routes` (API route definitions connecting to controllers)

## Security & Performance
- Input validation prevents malformed or malicious data.
- Proper error handling avoids exposing sensitive information.
- Prisma ORM used to prevent SQL injection risks.
- Indexes on frequently queried columns improve read performance.

## Contact & Support
For issues or questions about the Testimonials API, please reach out to the backend team in your project channel.

---
*This documentation is part of the GIV Society backend API project.*
