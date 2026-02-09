# Admin cURLs – News & Short Videos

**Base URL:** `http://52.35.230.229:3006/api`  
**Auth:** All requests need `Authorization: Bearer YOUR_JWT_TOKEN` (e.g. ORG_ADMIN or SUPER_ADMIN token).

---

## News (`/api/news`)

### Create news

```bash
curl -X POST "http://52.35.230.229:3006/api/news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "organizationId": "ORGANIZATION_OBJECT_ID",
    "title": "New export policy update",
    "description": "Summary of the update",
    "content": "Full article content here...",
    "imageUrl": "https://example.com/image.jpg",
    "linkUrl": "https://example.com/read-more",
    "tags": ["export", "policy"],
    "isPublished": false,
    "createdBy": "USER_OBJECT_ID"
  }'
```

Minimal (required only):

```bash
curl -X POST "http://52.35.230.229:3006/api/news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "organizationId": "ORGANIZATION_OBJECT_ID",
    "title": "Headline",
    "createdBy": "USER_OBJECT_ID"
  }'
```

**Response** `201` – created news object.

---

### Get all news (admin: include unpublished)

```bash
# All news (published only by default)
curl -X GET "http://52.35.230.229:3006/api/news?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Include unpublished (admin)
curl -X GET "http://52.35.230.229:3006/api/news?page=1&limit=20&includeUnpublished=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by organization
curl -X GET "http://52.35.230.229:3006/api/news?organizationId=ORGANIZATION_OBJECT_ID&page=1&limit=20&includeUnpublished=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200` – `{ "data": [ ... ], "meta": { "page", "limit", "total", "totalPages" } }`.

---

### Get one news by ID (admin: include unpublished)

```bash
curl -X GET "http://52.35.230.229:3006/api/news/NEWS_OBJECT_ID?includeUnpublished=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200` – single news object. `404` – News not found.

---

### Edit / update news

```bash
curl -X PUT "http://52.35.230.229:3006/api/news/NEWS_OBJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated headline",
    "description": "Updated summary",
    "content": "Updated content",
    "imageUrl": "https://example.com/new-image.jpg",
    "linkUrl": "https://example.com/new-link",
    "tags": ["export", "policy", "2025"],
    "isPublished": true
  }'
```

**Response** `200` – updated news object. `404` – News not found.

---

### Delete news

```bash
curl -X DELETE "http://52.35.230.229:3006/api/news/NEWS_OBJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200` – `{ "message": "News deleted" }`. `404` – News not found.

---

## Short Videos (`/api/short-videos`)

### Create short video

`createdBy` is taken from the JWT (no need to send).

```bash
curl -X POST "http://52.35.230.229:3006/api/short-videos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "organizationId": "ORGANIZATION_OBJECT_ID",
    "title": "Export tip – Incoterms",
    "description": "Quick recap",
    "videoUrl": "https://www.youtube.com/shorts/MpRenFR0jJk",
    "thumbnailUrl": "https://img.youtube.com/vi/MpRenFR0jJk/hqdefault.jpg",
    "durationSeconds": 45,
    "order": 1,
    "isActive": true
  }'
```

Minimal:

```bash
curl -X POST "http://52.35.230.229:3006/api/short-videos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "organizationId": "ORGANIZATION_OBJECT_ID",
    "title": "Short tip #1",
    "videoUrl": "https://www.youtube.com/shorts/MpRenFR0jJk"
  }'
```

**Response** `201` – created short video object.

---

### Get all short videos (admin: include inactive)

```bash
# Current user org, active only (default)
curl -X GET "http://52.35.230.229:3006/api/short-videos?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Include inactive (admin)
curl -X GET "http://52.35.230.229:3006/api/short-videos?page=1&limit=20&includeInactive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by organization
curl -X GET "http://52.35.230.229:3006/api/short-videos?organizationId=ORGANIZATION_OBJECT_ID&page=1&limit=20&includeInactive=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200` – `{ "data": [ ... ], "meta": { "page", "limit", "total", "totalPages" } }`.

---

### Get one short video by ID

For admin listing inactive items, use list with `includeInactive=true` to get IDs; GET by ID returns 404 if video is inactive (app behavior). To view any short by ID regardless of active state, you’d need a separate admin endpoint; for now use list to get details.

```bash
curl -X GET "http://52.35.230.229:3006/api/short-videos/SHORT_VIDEO_OBJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200` – single short video (only if active and same org). `404` – Short video not found.

---

### Edit / update short video

```bash
curl -X PATCH "http://52.35.230.229:3006/api/short-videos/SHORT_VIDEO_OBJECT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Updated title",
    "description": "Updated description",
    "videoUrl": "https://www.youtube.com/shorts/OTHER_ID",
    "thumbnailUrl": "https://img.youtube.com/vi/OTHER_ID/hqdefault.jpg",
    "durationSeconds": 60,
    "order": 5,
    "isActive": false
  }'
```

**Response** `200` – updated short video object. `404` – Short video not found.

---

### Delete short video

```bash
curl -X DELETE "http://52.35.230.229:3006/api/short-videos/SHORT_VIDEO_OBJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200` – `{ "message": "Short video deleted" }`. `404` – Short video not found.

---

## Quick reference

| Resource     | Create      | Get all              | Get one        | Edit    | Delete   |
|-------------|-------------|----------------------|----------------|--------|----------|
| **News**    | POST /news  | GET /news?…          | GET /news/:id  | PUT /news/:id  | DELETE /news/:id  |
| **Short videos** | POST /short-videos | GET /short-videos?… | GET /short-videos/:id | PATCH /short-videos/:id | DELETE /short-videos/:id |

Replace `YOUR_JWT_TOKEN`, `ORGANIZATION_OBJECT_ID`, `USER_OBJECT_ID`, `NEWS_OBJECT_ID`, `SHORT_VIDEO_OBJECT_ID` with real values.
