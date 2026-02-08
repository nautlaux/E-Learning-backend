# Auth API – cURL examples

**Base URL:** `http://52.35.230.229:3006/api`  
**Auth path:** `/auth`  
No auth required for these endpoints (public).

---

## 1. Send OTP (request login)

```bash
curl -X POST "http://52.35.230.229:3006/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "role": "USER"}'
```

With `ORG_ADMIN`:

```bash
curl -X POST "http://52.35.230.229:3006/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "role": "ORG_ADMIN"}'
```

**Response** `200 OK`:

```json
{
  "message": "OTP sent",
  "userExists": true,
  "userId": "64f0bbbb2222222222222222"
}
```

---

## 2. Verify OTP (get token)

Static OTP for development: **1234**.

```bash
curl -X POST "http://52.35.230.229:3006/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "9999999999",
    "role": "USER",
    "otp": "1234",
    "name": "John",
    "email": "john@example.com",
    "organizationId": null
  }'
```

Minimal (existing user):

```bash
curl -X POST "http://52.35.230.229:3006/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "role": "USER", "otp": "1234"}'
```

By `userId` (e.g. from send-OTP response):

```bash
curl -X POST "http://52.35.230.229:3006/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{"userId": "64f0bbbb2222222222222222", "otp": "1234"}'
```

**Response** `200 OK`:

```json
{
  "message": "OTP verified",
  "user": {
    "_id": "64f0bbbb2222222222222222",
    "name": "John",
    "email": "john@example.com",
    "role": "USER",
    "mobile": "9999999999",
    "organizationId": null,
    "avatarUrl": "",
    "isActive": true,
    "createdAt": "2025-02-04T10:00:00.000Z",
    "updatedAt": "2025-02-04T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Token expiry is set by env **`JWT_EXPIRY`** (e.g. `15m`, `1h`, `7d`, `30d`). Default: `30d`.

---

## 3. Refresh token (get new token after expiry)

Use when any protected API returns `code: "TOKEN_EXPIRED"`. Send the current (expired or valid) token; response includes a new token.

**Option A – token in header:**

```bash
curl -X POST "http://52.35.230.229:3006/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CURRENT_OR_EXPIRED_TOKEN" \
  -d '{}'
```

**Option B – token in body:**

```bash
curl -X POST "http://52.35.230.229:3006/api/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_CURRENT_OR_EXPIRED_TOKEN"}'
```

**Response** `200 OK`:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f0bbbb2222222222222222",
    "name": "John",
    "email": "john@example.com",
    "role": "USER",
    "mobile": "9999999999",
    "organizationId": null,
    "avatarUrl": "",
    "isActive": true
  }
}
```

**Error** `401` (e.g. no token / invalid):

```json
{
  "success": false,
  "code": "NO_TOKEN",
  "message": "No token provided or invalid format"
}
```

---

## 4. Static auth error responses (protected APIs)

When calling any protected route (e.g. `/api/courses`, `/api/short-videos`) without a valid token, or with an expired/invalid token, the response is **401** with one of these bodies (same shape for all auth failures):

| Code            | Message                                  |
|-----------------|------------------------------------------|
| `NO_TOKEN`      | No token provided or invalid format     |
| `INVALID_TOKEN` | Invalid token                            |
| `TOKEN_EXPIRED` | Token expired                            |
| `USER_NOT_FOUND`| User not found                           |

Example:

```json
{
  "success": false,
  "code": "TOKEN_EXPIRED",
  "message": "Token expired"
}
```

Frontend: if `code === "TOKEN_EXPIRED"`, call **POST /api/auth/refresh** with the same token, then retry the original request with the new `token`.

---

## Local / other host

Replace base URL, e.g.:

```bash
curl -X POST "http://localhost:3000/api/auth" \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9999999999", "role": "USER"}'
```
