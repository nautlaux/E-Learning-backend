# App Modules API – cURL (server host)

**Server host:** `http://52.35.230.229:3006`  
**Base path:** `/api/app-modules`  
No authentication required (public endpoint).

---

## Get app modules (dynamic display for frontend)

```bash
curl -X GET "http://52.35.230.229:3006/api/app-modules"
```

**Response** `200 OK`:

```json
{
  "success": true,
  "data": {
    "carousel": true,
    "courses": true,
    "continueLearning": false,
    "quizzes": false,
    "freeVideos": true,
    "tools": true,
    "news": true,
    "banners": true
  }
}
```

---

Using a different host/port (e.g. local):

```bash
curl -X GET "http://localhost:3000/api/app-modules"
```
