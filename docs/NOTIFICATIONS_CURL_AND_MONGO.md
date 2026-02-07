# Notifications – cURL examples & MongoDB bulk insert

Base URL: `http://52.35.230.229:3006//api` (adjust host/port as needed).  
Replace `YOUR_JWT_TOKEN` with a valid Bearer token for authenticated requests.

---

## 1. cURL commands

### Create notification (admin/system/Firebase)

```bash
curl -X POST "http://52.35.230.229:3006//api/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "USER_OBJECT_ID_HERE",
    "title": "New course available",
    "body": "Check out the new Import-Export course.",
    "source": "ADMIN_PANEL",
    "linkUrl": "/courses/COURSE_ID",
    "imageUrl": "",
    "data": null
  }'
```

**Response** `201 Created`:

```json
{
  "_id": "674a1b2c3d4e5f6789012345",
  "userId": "USER_OBJECT_ID_HERE",
  "title": "New course available",
  "body": "Check out the new Import-Export course.",
  "source": "ADMIN_PANEL",
  "read": false,
  "linkUrl": "/courses/COURSE_ID",
  "imageUrl": "",
  "data": null,
  "createdAt": "2025-02-04T10:00:00.000Z",
  "updatedAt": "2025-02-04T10:00:00.000Z"
}
```

Minimal (only required fields):

```bash
curl -X POST "http://52.35.230.229:3006//api/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"userId": "USER_OBJECT_ID_HERE", "title": "Reminder"}'
```

**Response** `201 Created` (same shape as above, with default `body: ""`, `source: "CUSTOM"`, etc.).

---

### List my notifications (paginated)

```bash
# All notifications (default page 1, limit from pagination util)
curl -X GET "http://52.35.230.229:3006//api/notifications" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# With pagination
curl -X GET "http://52.35.230.229:3006//api/notifications?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Unread only
curl -X GET "http://52.35.230.229:3006//api/notifications?read=false" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Read only
curl -X GET "http://52.35.230.229:3006//api/notifications?read=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200 OK`:

```json
{
  "data": [
    {
      "_id": "674a1b2c3d4e5f6789012345",
      "userId": "6972224bd9674f0540d14a24",
      "title": "Welcome to EXIM PRO",
      "body": "Start your first course today.",
      "source": "ADMIN_PANEL",
      "read": false,
      "linkUrl": "/courses",
      "imageUrl": "",
      "data": null,
      "createdAt": "2025-02-04T10:00:00.000Z",
      "updatedAt": "2025-02-04T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 20,
    "totalPages": 1
  }
}
```

---

### Get unread count (badge)

```bash
curl -X GET "http://52.35.230.229:3006//api/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200 OK`:

```json
{
  "unreadCount": 12
}
```

---

### Mark one notification as read

```bash
curl -X PATCH "http://52.35.230.229:3006//api/notifications/NOTIFICATION_OBJECT_ID/read" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200 OK` (updated notification):

```json
{
  "_id": "674a1b2c3d4e5f6789012345",
  "userId": "6972224bd9674f0540d14a24",
  "title": "Welcome to EXIM PRO",
  "body": "Start your first course today.",
  "source": "ADMIN_PANEL",
  "read": true,
  "linkUrl": "/courses",
  "imageUrl": "",
  "data": null,
  "createdAt": "2025-02-04T10:00:00.000Z",
  "updatedAt": "2025-02-04T10:05:00.000Z"
}
```

**Response** `404 Not Found` (wrong id or not owned by user):

```json
{
  "message": "Notification not found"
}
```

---

### Mark all as read

```bash
curl -X PATCH "http://52.35.230.229:3006//api/notifications/read-all" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200 OK`:

```json
{
  "message": "All marked as read",
  "modifiedCount": 12
}
```

---

## 2. MongoDB shell – bulk insert 20 notifications

Replace:

- `YOUR_DB_NAME` – your MongoDB database name (e.g. `exim_pro`, `e_learning`).
- `USER_OBJECT_ID` – a valid `ObjectId` of the user who should receive the notifications (e.g. from `db.users.findOne()._id`).

Run in `mongosh` (or legacy `mongo`):

```javascript
use YOUR_DB_NAME;

var userId = ObjectId("6972224bd9674f0540d14a24");  // e.g. ObjectId("507f1f77bcf86cd799439011")

db.notifications.insertMany([
  { userId: userId, title: "Welcome to EXIM PRO", body: "Start your first course today.", source: "ADMIN_PANEL", read: false, linkUrl: "/courses", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "New course: Import Documentation", body: "Learn import documentation step by step.", source: "ADMIN_PANEL", read: false, linkUrl: "/courses/import-doc", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Certificate ready", body: "Your certificate for Basics of Export is ready to download.", source: "CUSTOM", read: false, linkUrl: "/certificates", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Lesson completed", body: "You completed 'Incoterms 2020' in Export Fundamentals.", source: "CUSTOM", read: true, linkUrl: "/my-courses", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Reminder: Finish your course", body: "You have 2 modules left in Import Procedures.", source: "FIREBASE", read: false, linkUrl: "/my-courses", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "New announcement", body: "Holiday schedule: Office closed on 26 Jan.", source: "ADMIN_PANEL", read: false, linkUrl: "/news", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Quiz result", body: "You scored 85% in Export Documentation quiz.", source: "CUSTOM", read: true, linkUrl: "/courses/export-doc/quiz", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "New content added", body: "New videos added to Export Procedures course.", source: "ADMIN_PANEL", read: false, linkUrl: "/courses/export-procedures", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Profile update", body: "Your profile has been updated successfully.", source: "CUSTOM", read: true, linkUrl: "/profile", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Payment received", body: "Payment for Premium plan received. Thank you!", source: "CUSTOM", read: false, linkUrl: "/billing", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Live webinar tomorrow", body: "Join our webinar on Export Compliance at 3 PM.", source: "FIREBASE", read: false, linkUrl: "/webinars", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Course expiry reminder", body: "Your access to Advanced Import ends in 7 days.", source: "FIREBASE", read: false, linkUrl: "/my-courses", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Discussion reply", body: "Someone replied to your question in Export Fundamentals.", source: "CUSTOM", read: true, linkUrl: "/courses/export-fundamentals/discuss", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Survey request", body: "Help us improve by taking a 2-min survey.", source: "ADMIN_PANEL", read: false, linkUrl: "/survey", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Badge earned", body: "You earned the 'First Steps' badge.", source: "CUSTOM", read: true, linkUrl: "/profile/badges", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "System maintenance", body: "Scheduled maintenance on Feb 10, 2–4 AM. Service may be briefly unavailable.", source: "ADMIN_PANEL", read: false, linkUrl: "", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Password changed", body: "Your password was changed. If this wasn't you, contact support.", source: "CUSTOM", read: true, linkUrl: "/profile/security", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "New instructor message", body: "Your instructor posted an update in Import Basics.", source: "FIREBASE", read: false, linkUrl: "/courses/import-basics", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Course recommended for you", body: "Based on your progress we recommend 'Export Documentation'.", source: "CUSTOM", read: false, linkUrl: "/courses/export-doc", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() },
  { userId: userId, title: "Support ticket resolved", body: "Your ticket #1234 has been resolved. Please rate the support.", source: "ADMIN_PANEL", read: true, linkUrl: "/support", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }
]);
```

One-liner (paste as one line after setting `YOUR_DB_NAME` and replacing `USER_OBJECT_ID`):

```bash
mongosh YOUR_DB_NAME --eval 'var userId = ObjectId("USER_OBJECT_ID"); db.notifications.insertMany([ { userId: userId, title: "Welcome to EXIM PRO", body: "Start your first course today.", source: "ADMIN_PANEL", read: false, linkUrl: "/courses", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "New course: Import Documentation", body: "Learn import documentation step by step.", source: "ADMIN_PANEL", read: false, linkUrl: "/courses/import-doc", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Certificate ready", body: "Your certificate for Basics of Export is ready to download.", source: "CUSTOM", read: false, linkUrl: "/certificates", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Lesson completed", body: "You completed Incoterms 2020 in Export Fundamentals.", source: "CUSTOM", read: true, linkUrl: "/my-courses", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Reminder: Finish your course", body: "You have 2 modules left in Import Procedures.", source: "FIREBASE", read: false, linkUrl: "/my-courses", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "New announcement", body: "Holiday schedule: Office closed on 26 Jan.", source: "ADMIN_PANEL", read: false, linkUrl: "/news", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Quiz result", body: "You scored 85% in Export Documentation quiz.", source: "CUSTOM", read: true, linkUrl: "/courses/export-doc/quiz", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "New content added", body: "New videos added to Export Procedures course.", source: "ADMIN_PANEL", read: false, linkUrl: "/courses/export-procedures", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Profile update", body: "Your profile has been updated successfully.", source: "CUSTOM", read: true, linkUrl: "/profile", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Payment received", body: "Payment for Premium plan received. Thank you!", source: "CUSTOM", read: false, linkUrl: "/billing", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Live webinar tomorrow", body: "Join our webinar on Export Compliance at 3 PM.", source: "FIREBASE", read: false, linkUrl: "/webinars", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Course expiry reminder", body: "Your access to Advanced Import ends in 7 days.", source: "FIREBASE", read: false, linkUrl: "/my-courses", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Discussion reply", body: "Someone replied to your question in Export Fundamentals.", source: "CUSTOM", read: true, linkUrl: "/courses/export-fundamentals/discuss", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Survey request", body: "Help us improve by taking a 2-min survey.", source: "ADMIN_PANEL", read: false, linkUrl: "/survey", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Badge earned", body: "You earned the First Steps badge.", source: "CUSTOM", read: true, linkUrl: "/profile/badges", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "System maintenance", body: "Scheduled maintenance on Feb 10, 2–4 AM.", source: "ADMIN_PANEL", read: false, linkUrl: "", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Password changed", body: "Your password was changed. If this was not you, contact support.", source: "CUSTOM", read: true, linkUrl: "/profile/security", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "New instructor message", body: "Your instructor posted an update in Import Basics.", source: "FIREBASE", read: false, linkUrl: "/courses/import-basics", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Course recommended for you", body: "Based on your progress we recommend Export Documentation.", source: "CUSTOM", read: false, linkUrl: "/courses/export-doc", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() }, { userId: userId, title: "Support ticket resolved", body: "Your ticket #1234 has been resolved.", source: "ADMIN_PANEL", read: true, linkUrl: "/support", imageUrl: "", data: null, createdAt: new Date(), updatedAt: new Date() } ]);'
```

To get a user's `_id` in the shell:

```javascript
db.users.findOne({}, { _id: 1 });
```

Use that `_id` value as `USER_OBJECT_ID` (with or without `ObjectId()` in the script as shown).
