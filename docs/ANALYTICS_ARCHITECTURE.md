# Analytics Architecture: Heatmaps & Click Tracking

## Goal
- Track where users click/tap on each screen (heatmap data).
- Admin sees a “preview app” style dashboard with heatmaps (hottest zones) to decide where to place ads/banners.

---

## Existing (Keep As-Is)
- **analytics_events** – business events (COURSE_VIEW, COURSE_PURCHASE, etc.).
- **analytics_summary** – pre-computed metrics by period (revenue, top course, etc.).

---

## New: Click / Heatmap Layer

### 1. Raw clicks: `AnalyticsClick` model
Store each tap/click with:
- **organizationId** – org scope.
- **userId** – optional (anonymous allowed).
- **screenName** – e.g. `dashboard`, `course_detail`, `lesson_player`.
- **sectionKey** – e.g. `mostPopular`, `banner`, `continue`, `freeVideos` (matches dashboard sections).
- **xPercent, yPercent** – normalized 0–100 (so heatmap works across devices).
- **viewportWidth, viewportHeight** – optional, for reference.
- **createdAt** – timestamp.

Indexes: `(organizationId, screenName, sectionKey, createdAt)` for fast aggregation.

### 2. Flow

**App (your frontend)**  
- On click/tap: send `POST /api/analytics/clicks` with `{ screenName, sectionKey, xPercent, yPercent }`.  
- Optionally batch: `{ events: [ { screenName, sectionKey, xPercent, yPercent }, ... ] }`.  
- Compute xPercent/yPercent from event coordinates and viewport (e.g. `xPercent = (clientX / window.innerWidth) * 100`).

**Backend**  
- Validates and stores each click in `AnalyticsClick`.  
- Optional: cron or on-demand job to pre-aggregate into a heatmap summary (see below).

**Admin dashboard (“preview app” with heatmaps)**  
- **Screens list** – e.g. Dashboard, Course detail, Lesson player.  
- **Per screen** – list of sections (e.g. Most Popular, Banner, Continue).  
- **Per section** – show heatmap: grid (e.g. 10×10) of click counts so “hottest” cells can be highlighted (e.g. red = most clicks).  
- Admin uses this to decide: “Banner section has hot zone at top-right → I’ll put my ad there.”

### 3. APIs

| Method | Endpoint | Purpose |
|--------|----------|--------|
| POST   | `/api/analytics/clicks`     | Record one or many click events (body: single object or `{ events: [...] }`). |
| GET    | `/api/analytics/heatmap`   | Aggregated heatmap for admin. Query: `organizationId`, `screenName`, `sectionKey`, `from`, `to`, `gridSize` (default 10). Returns grid of counts. |
| GET    | `/api/analytics/screens`   | List distinct (screenName, sectionKey) for org (for admin dropdowns). |

### 4. Aggregation (heatmap)
- Filter: `organizationId`, `screenName`, `sectionKey`, `createdAt` in date range.
- Bucket `xPercent` / `yPercent` into grid (e.g. 10×10 → 100 cells).  
- Return e.g. `{ grid: [[count, count, ...], ...], gridSize: 10 }` so frontend can render a heat layer (e.g. canvas or divs with opacity/color by count).

### 5. What NOT to do (MVP)
- No full session replay.
- No mouse-move streaming (only click/tap).
- No PII in click payload (only userId ref if logged in).
- No client-side fingerprint; keep it minimal.

---

## Summary
- **One new collection**: `AnalyticsClick` (raw clicks with screen, section, normalized position).
- **One new API**: record clicks (POST) + heatmap aggregation (GET) + list screens (GET).
- **Admin UX**: “Preview app” screens → choose screen + section → show heatmap grid → decide ad/banner placement.

---

## Sensor & Deep Analytics (Suggestions Only — Implement After Approval)

### 1. Ambient light (room dark / light)
- **What**: Use device Ambient Light Sensor (or camera/brightness heuristic) to classify context as `dark` / `dim` / `light`.
- **Store**: e.g. `AnalyticsSensor` or extend events with `sensor: { ambient: 'dark'|'dim'|'light' }` plus `screenName`, `sectionKey`, timestamp.
- **Use**: Admin sees “% of sessions in dark vs light” → adjust theme defaults, suggest dark mode, or place high-contrast ads in dim/dark segments.

### 2. Similar sensor / context ideas (suggestions only)
- **Device orientation** – portrait vs landscape; which orientation gets more engagement on which screen (e.g. video vs quiz).
- **Connection type** – wifi vs cellular vs unknown; correlate with drop-off or video quality choices (e.g. show “low bandwidth” tips or lighter content).
- **Time of day / timezone** – peak learning hours; when to show certain banners or send nudges.
- **Session duration & scroll depth** – time on screen, max scroll % per screen; “how far do users go” before leaving (drop-off funnel).
- **Focus / visibility** – tab or app in foreground vs background (e.g. Page Visibility API); “did they leave the tab during video?” for completion quality.
- **Audio / mute state** – whether video was played muted; useful for auto-play and ad placement (e.g. prefer visual ads when muted).
- **Battery / power** – low battery vs charging; optional “low power” UX or lighter tracking when battery is low (privacy-friendly).

### 3. Deep analytics (no code yet — for approval)
- **Funnel analytics** – dashboard → course view → lesson start → lesson complete; step-wise conversion and drop-off rates per org/screen.
- **Cohort analytics** – retention by signup week or first-course; “week 1 retention”, “day 7 active” etc.
- **Content affinity** – which courses/sections are viewed together; “users who viewed X also viewed Y” for recommendations.
- **Engagement score** – composite (clicks + time + completion %) per user or per course; rank “most engaged” content for admin.
- **A/B experiment events** – store variant (e.g. banner position A vs B) with events; later aggregate by variant for “which placement converts better”.
- **Session replay metadata (lightweight)** – not full replay; only “list of (eventType, timestamp, screenName)” per session for a timeline view in admin (e.g. “user did: login → dashboard → course view → lesson start → leave”).

If you approve any of the above (e.g. ambient light + one or two deep analytics), we can design the schema and APIs next and then implement.
