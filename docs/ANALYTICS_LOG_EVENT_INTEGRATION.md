# Backend Integration Guide: Custom Analytics Event Logging

Technical specifications for the endpoint that captures mobile app analytics events.

---

## 1. API Endpoint

**POST** `{{baseUrl}}/api/analytics/log-event`

Example: `POST http://52.35.230.229:3006/api/analytics/log-event`

---

## 2. Authentication

The app sends the user's JWT in the header for every request.

| Header Key   | Header Value        |
|-------------|---------------------|
| Authorization | Bearer \<JWT_TOKEN\> |

The backend attaches `userId` and `organizationId` from the token to the stored event when the user is logged in.

---

## 3. Request Body (JSON)

| Field        | Type   | Description |
|-------------|--------|-------------|
| event_name  | String | Unique identifier for the event (e.g. `screen_view`, `shorts_view`). |
| parameters  | Object | Key-value pairs for event-specific data (e.g. `short_id`, `screen_name`). |
| phone_number| String | User's mobile number (optional; if logged in). |
| timestamp   | String | ISO 8601 date when the event occurred (e.g. `2026-02-08T23:15:30.000Z`). |

- **event_name**: required, non-empty string.
- **parameters**: optional; if omitted or not an object, stored as `{}`.
- **phone_number**: optional.
- **timestamp**: optional; if omitted or invalid, server uses current time.

---

## 4. Response

- **201 Created**  
  ```json
  { "success": true }
  ```

- **400 Bad Request** – Missing or invalid `event_name` or `timestamp`.  
  ```json
  { "success": false, "message": "event_name is required and must be a non-empty string" }
  ```

- **401 Unauthorized** – Missing or invalid JWT (same as other protected routes).

- **500 Internal Server Error**  
  ```json
  { "success": false, "message": "Internal server error" }
  ```

---

## 5. Example Payloads & cURLs

**Base URL:** `http://52.35.230.229:3006/api`  
Replace `YOUR_JWT_TOKEN` with a valid token.

### A. Screen View (Dashboard)

When the user lands on the Home Screen.

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "event_name": "screen_view",
    "parameters": {
      "screen_name": "dashboard"
    },
    "phone_number": "9876543210",
    "timestamp": "2026-02-08T23:15:30.000Z"
  }'
```

### B. Shorts Interaction

When a user views a specific short.

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "event_name": "shorts_view",
    "parameters": {
      "short_id": "674a1b2c3d4e5f6789012345",
      "title": "Pro Import-Export Tip"
    },
    "phone_number": "9876543210",
    "timestamp": "2026-02-08T23:16:10.000Z"
  }'
```

### C. Course View

When a user opens a course to see details.

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "event_name": "view_course_details",
    "parameters": {
      "course_id": "998877",
      "course_name": "Advanced Logistics 101"
    },
    "phone_number": "9876543210",
    "timestamp": "2026-02-08T23:18:20.000Z"
  }'
```

### D. Video Playback

When a video starts playing inside a lesson.

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "event_name": "video_start",
    "parameters": {
      "video_id": "vid_001",
      "video_title": "Understanding Bill of Lading"
    },
    "phone_number": "9876543210",
    "timestamp": "2026-02-08T23:20:05.000Z"
  }'
```

### E. Quiz Session

When a user starts a quiz.

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "event_name": "quiz_start",
    "parameters": {
      "quiz_id": "q_772",
      "quiz_title": "Weekly Customs Quiz"
    },
    "phone_number": "9876543210",
    "timestamp": "2026-02-08T23:25:00.000Z"
  }'
```

### F. Generic Button Tap

For general UI interactions (e.g. Contact Support).

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "event_name": "button_tap",
    "parameters": {
      "button_name": "contact_support",
      "screen_name": "profile_screen"
    },
    "phone_number": "9876543210",
    "timestamp": "2026-02-08T23:28:45.000Z"
  }'
```

---

## 6. Implementation Notes

- **Scalability**: The endpoint is a single-document insert. For very high volume, consider batching (e.g. a separate batch endpoint that accepts an array of events) or async/queue processing.
- **Storage**: Events are stored in MongoDB. The `parameters` field is stored as a flexible document (similar to JSONB); any valid JSON object is accepted.
- **Enrichment**: Backend adds `userId` and `organizationId` from the JWT when present, so reporting can be filtered by user or organization without relying only on `phone_number`.
