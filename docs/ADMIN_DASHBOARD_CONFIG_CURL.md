# Admin – Dashboard Config cURLs

**Base URL:** `http://52.35.230.229:3006/api`  
**Path:** `/dashboard/config`  
**Auth:** `Authorization: Bearer YOUR_JWT_TOKEN` (e.g. ORG_ADMIN; organizationId can come from token or query/body).

---

## Get config (initial / read)

```bash
# organizationId from JWT (logged-in admin's org)
curl -X GET "http://52.35.230.229:3006/api/dashboard/config" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Or pass organizationId in query (e.g. super admin)
curl -X GET "http://52.35.230.229:3006/api/dashboard/config?organizationId=ORGANIZATION_OBJECT_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response** `200 OK` (no config in DB = defaults returned; otherwise saved config + inlineBanners):

```json
{
  "organizationId": "6972184e424ea4761fff6655",
  "sections": [
    { "key": "course", "title": "Most Popular Courses", "subtitle": "Discover our most popular courses", "order": 1, "isActive": true, "sectionType": "popular" },
    { "key": "course", "title": "Recommended Courses", "subtitle": "Discover our recommended courses", "order": 2, "isActive": true, "sectionType": "recommended" },
    { "key": "banner", "title": "Banner", "subtitle": "", "order": 3, "isActive": true },
    { "key": "continue", "title": "Continue Courses", "subtitle": "Continue your learning", "order": 4, "isActive": true },
    { "key": "freeVideos", "title": "Free Videos", "subtitle": "Discover our free videos", "order": 5, "isActive": true },
    { "key": "shorts", "title": "Shorts", "subtitle": "Short videos & reels", "order": 6, "isActive": true }
  ],
  "addons": {
    "language": "english,hindi,bhojpuri,...",
    "darkMode": true,
    "theme": "light,dark",
    "font": "Roboto,Arial,Helvetica,sans-serif",
    "fontSize": "14px",
    "fontWeight": "400",
    "fontColor": "#000000",
    "backgroundColor": "#ffffff",
    "borderRadius": "10px",
    "primaryColor": "#000000",
    "secondaryColor": "#ffffff"
  },
  "inlineBanners": [
    { "_id": "...", "title": "...", "ctaText": "...", "ctaUrl": "...", "imageUrl": "...", "type": "INLINE" }
  ]
}
```

**Error** `400`: `{ "message": "organizationId required" }`

---

## Update config (admin)

```bash
curl -X PUT "http://52.35.230.229:3006/api/dashboard/config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "organizationId": "ORGANIZATION_OBJECT_ID",
    "sections": [
      { "key": "course", "title": "Most Popular Courses", "subtitle": "Discover our most popular courses", "order": 1, "isActive": true, "sectionType": "popular" },
      { "key": "banner", "title": "Banner", "subtitle": "", "order": 2, "isActive": true },
      { "key": "course", "title": "Recommended Courses", "subtitle": "For you", "order": 3, "isActive": true, "sectionType": "recommended" },
      { "key": "continue", "title": "Continue Learning", "subtitle": "Pick up where you left off", "order": 4, "isActive": true },
      { "key": "freeVideos", "title": "Free Videos", "subtitle": "Watch for free", "order": 5, "isActive": true },
      { "key": "shorts", "title": "Shorts", "subtitle": "Short videos & reels", "order": 6, "isActive": false }
    ],
    "addons": {
      "language": "english,hindi,bhojpuri,telugu,kannada,malayalam,punjabi,urdu,sindhi,gujarati,odia,tamil,bengali,marathi",
      "darkMode": true,
      "theme": "light,dark",
      "font": "Roboto,Arial,Helvetica,sans-serif",
      "fontSize": "14px",
      "fontWeight": "400",
      "fontColor": "#000000",
      "backgroundColor": "#ffffff",
      "borderRadius": "10px",
      "primaryColor": "#000000",
      "secondaryColor": "#ffffff"
    }
  }'
```

- **organizationId**: from JWT or send in body (e.g. for super admin).
- **sections**: array of `{ key, title, subtitle?, order, isActive?, sectionType? }`.  
  **key** must be one of: `course`, `continue`, `freeVideos`, `banner`, `shorts`. Include the **shorts** section (key: `"shorts"`) when updating so the dashboard shows the short videos / reels block.  
  **sectionType** only for `key: "course"`: use `"popular"` or `"recommended"` so the backend knows which data to show and returns the same in GET /api/dashboard.
- **addons**: optional; if sent, replaces addons (any keys you want for theme/language etc.).

**Minimal update (sections only):**

```bash
curl -X PUT "http://52.35.230.229:3006/api/dashboard/config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sections": [
      { "key": "shorts", "title": "Reels", "subtitle": "Short videos", "order": 1, "isActive": true },
      { "key": "course", "title": "Popular Courses", "subtitle": "", "order": 2, "isActive": true, "sectionType": "popular" }
    ]
  }'
```

**Response** `200 OK` – updated config (sections + addons as stored). Does **not** include `inlineBanners` (use GET config for that).

```json
{
  "_id": "...",
  "organizationId": "6972184e424ea4761fff6655",
  "sections": [ ... ],
  "addons": { ... },
  "createdAt": "2025-02-04T10:00:00.000Z",
  "updatedAt": "2025-02-04T10:05:00.000Z"
}
```

**Error** `400`: `{ "message": "organizationId required" }`

---

## Summary

| Action   | Method | URL                          |
|----------|--------|------------------------------|
| Get config | GET  | `/api/dashboard/config`      |
| Update config | PUT | `/api/dashboard/config`   |

---

## How sectionType works

- **Course sections**: Frontend (admin) sends `sectionType: "popular"` or `"recommended"` on sections with `key: "course"` in **PUT /api/dashboard/config**. Backend stores it and uses it in **GET /api/dashboard** to pick the data source and returns `sectionType` in the response. If omitted, backend falls back by order (first = popular, second = recommended).
- **Shorts section**: Include a section with `key: "shorts"` in the config (e.g. title: "Shorts", subtitle: "Short videos & reels"). Backend returns `sectionType: "shorts"` for that section in **GET /api/dashboard** so the app can render the short videos / reels block. Default config already includes shorts at order 6.

Replace `YOUR_JWT_TOKEN`, `ORGANIZATION_OBJECT_ID` with real values.
