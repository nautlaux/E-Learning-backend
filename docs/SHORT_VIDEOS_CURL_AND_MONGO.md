# Short Videos API – cURL examples & MongoDB insert

**Base URL:** `http://52.35.230.229:3006/api` (adjust host/port as needed)  
**Path:** `/short-videos`  
All endpoints require: `Authorization: Bearer YOUR_JWT_TOKEN`

---

## 1. cURL commands

### Create short video (admin)

```bash
curl -X POST "http://52.35.230.229:3006/api/short-videos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "organizationId": "ORGANIZATION_OBJECT_ID",
    "title": "Export tip – Incoterms",
    "description": "Quick recap of Incoterms 2020",
    "videoUrl": "https://www.youtube.com/shorts/MpRenFR0jJk",
    "thumbnailUrl": "https://img.youtube.com/vi/MpRenFR0jJk/hqdefault.jpg",
    "durationSeconds": 45,
    "order": 1,
    "isActive": true
  }'
```

**Response** `201 Created`:

```json
{
  "_id": "674a1b2c3d4e5f6789012345",
  "organizationId": "6972184e424ea4761fff6655",
  "title": "Export tip – Incoterms",
  "description": "Quick recap of Incoterms 2020",
  "videoUrl": "https://www.youtube.com/shorts/MpRenFR0jJk",
  "thumbnailUrl": "https://img.youtube.com/vi/MpRenFR0jJk/hqdefault.jpg",
  "durationSeconds": 45,
  "order": 1,
  "isActive": true,
  "createdBy": "64f0bbbb2222222222222222",
  "createdAt": "2025-02-04T10:00:00.000Z",
  "updatedAt": "2025-02-04T10:00:00.000Z"
}
```

---

### List short videos (app feed / admin list)

```bash
# App: current user org, active only (default), page 1, limit 15
curl -X GET "http://52.35.230.229:3006/api/short-videos?page=1&limit=15" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Admin: include inactive
curl -X GET "http://52.35.230.229:3006/api/short-videos?page=1&limit=20&includeInactive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Admin: filter by organization
curl -X GET "http://52.35.230.229:3006/api/short-videos?organizationId=ORGANIZATION_OBJECT_ID&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200 OK`:

```json
{
  "data": [
    {
      "_id": "674a1b2c3d4e5f6789012345",
      "organizationId": "6972184e424ea4761fff6655",
      "title": "Short tip #1 – 1",
      "description": "Short video 1",
      "videoUrl": "https://www.youtube.com/shorts/MpRenFR0jJk",
      "thumbnailUrl": "https://img.youtube.com/vi/MpRenFR0jJk/hqdefault.jpg",
      "durationSeconds": 45,
      "order": 1,
      "isActive": true,
      "createdBy": "64f0bbbb2222222222222222",
      "createdAt": "2025-02-04T10:00:00.000Z",
      "updatedAt": "2025-02-04T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 15,
    "total": 30,
    "totalPages": 2
  }
}
```

---

### Get one short video by ID

```bash
curl -X GET "http://52.35.230.229:3006/api/short-videos/SHORT_VIDEO_OBJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200 OK` – full short video object (same shape as list item).

**Response** `404` – `{ "message": "Short video not found" }`

---

### Update short video (admin)

```bash
curl -X PATCH "http://52.35.230.229:3006/api/short-videos/SHORT_VIDEO_OBJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated title",
    "isActive": false,
    "order": 10
  }'
```

**Response** `200 OK` – updated short video object.

---

### Delete short video (admin)

```bash
curl -X DELETE "http://52.35.230.229:3006/api/short-videos/SHORT_VIDEO_OBJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200 OK`:

```json
{
  "message": "Short video deleted"
}
```

---

## 2. MongoDB shell – bulk insert (e.g. 30 short videos)

Replace `YOUR_DB_NAME`, `ORGANIZATION_OBJECT_ID`, and `CREATED_BY_USER_OBJECT_ID` before running in `mongosh` (or legacy `mongo`).

```javascript
use YOUR_DB_NAME;

var orgId = ObjectId("ORGANIZATION_OBJECT_ID");
var createdBy = ObjectId("CREATED_BY_USER_OBJECT_ID");

var videos = [
  { url: "https://www.youtube.com/shorts/MpRenFR0jJk", thumb: "https://img.youtube.com/vi/MpRenFR0jJk/hqdefault.jpg", title: "Short tip #1" },
  { url: "https://www.youtube.com/shorts/MpRenFR0jJk", thumb: "https://img.youtube.com/vi/MpRenFR0jJk/hqdefault.jpg", title: "Short tip #2" },
  { url: "http://youtube.com/shorts/tkMV0U42Qa4", thumb: "https://img.youtube.com/vi/tkMV0U42Qa4/hqdefault.jpg", title: "Short tip #3" },
  { url: "https://www.youtube.com/shorts/ZPE39TK46-A", thumb: "https://img.youtube.com/vi/ZPE39TK46-A/hqdefault.jpg", title: "Short tip #4" }
];

var docs = [];
for (var i = 0; i < 30; i++) {
  var v = videos[i % 4];
  docs.push({
    organizationId: orgId,
    title: v.title + " – " + (i + 1),
    description: "Short video " + (i + 1),
    videoUrl: v.url,
    thumbnailUrl: v.thumb,
    durationSeconds: 45,
    order: i + 1,
    isActive: true,
    createdBy: createdBy,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

db.shortvideos.insertMany(docs);
print("Inserted " + docs.length + " short videos.");
```

To get IDs in the shell:

```javascript
db.organizations.findOne({}, { _id: 1 });
db.users.findOne({}, { _id: 1 });
```

Runnable script version: `docs/SHORT_VIDEOS_MONGO_INSERT.js` (replace placeholders and run with `mongosh YOUR_DB_NAME < docs/SHORT_VIDEOS_MONGO_INSERT.js` or paste into mongosh).
