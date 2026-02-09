# Backend API Specification: Install Source Tracking

This endpoint logs the **source of the app installation** immediately on first launch.

---

## 1. Endpoint

**POST** `{{baseUrl}}/api/analytics/log-install`  
**Access:** Public (no Authorization header required)

Example: `POST http://52.35.230.229:3006/api/analytics/log-install`

---

## 2. Request Payload Schema

The request body is a JSON object with a top-level `timestamp` and a `parameters` object.

### Top-level fields

| Field     | Type   | Required | Description                                   | Example                        |
|----------|--------|----------|-----------------------------------------------|--------------------------------|
| timestamp| String | Yes      | ISO 8601 timestamp of the API call           | `2024-03-15T10:00:00.000Z`     |
| parameters | Object | Yes    | Container for all attribution data           | `{ ... }`                      |

### `parameters` object details

| Key              | Type   | Description                                                                                   |
|------------------|--------|-----------------------------------------------------------------------------------------------|
| installer_store  | String | Store that managed the install. e.g. `com.android.vending` (Google Play), `manual_apk`.     |
| app_version      | String | App version installed (e.g. `1.0.2`).                                                        |
| build_number     | String | Build number (e.g. `12`).                                                                    |
| referrer_url     | String | Raw referrer string from the store (or `unknown`).                                          |
| click_timestamp  | Long   | Timestamp (seconds) when the ad link was clicked.                                           |
| install_timestamp| Long   | Timestamp (seconds) when installation began.                                                |
| utm_source       | String | Campaign Source (e.g. `google`, `facebook`, `manual_sideload`).                             |
| utm_medium       | String | Campaign Medium (e.g. `cpc`, `organic`, `apk_sharing`).                                      |
| utm_campaign     | String | Campaign Name.                                                                               |
| utm_term         | String | Campaign Term (keywords).                                                                    |
| utm_content      | String | Campaign Content (Ad ID / Variation).                                                       |

All keys under `parameters` are stored as-is (flexible document).

---

## 3. Example Requests

Base URL: `http://52.35.230.229:3006/api`

### A. Google Ads Install (Paid)

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-install" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-03-15T10:00:00.000Z",
    "parameters": {
      "installer_store": "com.android.vending",
      "app_version": "1.0.2",
      "build_number": "12",
      "referrer_url": "utm_source=google&utm_medium=cpc&utm_campaign=winter_sale&utm_term=export_business",
      "click_timestamp": 1709268000,
      "install_timestamp": 1709268300,
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "winter_sale",
      "utm_term": "export_business"
    }
  }'
```

### B. Organic Play Store Install

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-install" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-03-15T10:05:00.000Z",
    "parameters": {
      "installer_store": "com.android.vending",
      "app_version": "1.0.2",
      "build_number": "12",
      "referrer_url": "utm_source=google-play&utm_medium=organic",
      "click_timestamp": 1709268500,
      "install_timestamp": 1709268800,
      "utm_source": "google-play",
      "utm_medium": "organic"
    }
  }'
```

### C. Manual Sideload (APK Share)

```bash
curl -X POST "http://52.35.230.229:3006/api/analytics/log-install" \
  -H "Content-Type: application/json" \
  -d '{
    "timestamp": "2024-03-15T10:10:00.000Z",
    "parameters": {
      "installer_store": "manual_apk",
      "app_version": "1.0.2",
      "build_number": "12",
      "referrer_url": "unknown",
      "click_timestamp": 0,
      "install_timestamp": 0,
      "utm_source": "manual_sideload",
      "utm_medium": "apk_sharing"
    }
  }'
```

---

## 4. Responses

- **201 Created**  
  ```json
  { "success": true }
  ```

- **400 Bad Request** – missing or invalid fields  
  ```json
  { "success": false, "message": "timestamp is required" }
  ```  
  or  
  ```json
  { "success": false, "message": "timestamp must be a valid ISO 8601 date string" }
  ```  
  or  
  ```json
  { "success": false, "message": "parameters is required and must be an object" }
  ```

- **500 Internal Server Error**  
  ```json
  { "success": false, "message": "Internal server error" }
  ```

---

## 5. Implementation Notes

- **Duplicate Check**: The mobile app is responsible for sending this data **only once per fresh install / cleared data**. Backend will accept multiple records if they arrive (no hard dedupe), but you can deduplicate later using `timestamp` + `parameters` or device fingerprinting.
- **Access**: This endpoint is mounted as a **public route** and does **not** use JWT auth (`/api/analytics/log-install` is outside the `authenticate` middleware chain).
- **Storage**: Data is stored in the `AnalyticsInstall` collection with:
  - `timestamp` (Date) – parsed from the `timestamp` string
  - `parameters` (Mixed) – full attribution payload  
  - `createdAt` (Date) – server insert time
- **Querying**: Use the `timestamp` index to fetch install records by time range or to build attribution reports.

