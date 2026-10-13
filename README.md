# Saaya — Heatwave Safety Intelligence System

A front-end for **Saaya** (Urdu/Sindhi for "shade"), built for OpenHack'26, Challenge CL-02 (Health track).

Saaya uses weather data and a heat-risk indicator to communicate danger levels and connect residents with cooling centers, water points, and community assistance — across Pakistan, in three languages.

## Quick start

### Mock mode (no backend needed)

```bash
cp .env.example .env      # VITE_USE_MOCK=true is already set
npm install
npm run dev
```

Open the app at the URL shown in your terminal.

### Real API mode

1. Start the backend (separate project) on `http://localhost:8000`.
2. Edit `.env`:

   ```
   VITE_USE_MOCK=false
   VITE_API_BASE_URL=http://localhost:8000
   VITE_DEMO=true
   ```

3. Run:

   ```bash
   npm run dev
   ```

No code changes are needed to switch between mock and real API — it's controlled entirely by environment variables.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_USE_MOCK` | `false` | `true` = serve local mock JSON |
| `VITE_DEMO` | `false` | `true` = show "simulate extreme heat" toggle in sidebar |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Run unit tests (Vitest) |
| `npm run lint` | ESLint |

## Demo steps

### How to trigger the red extreme-heat pop-up

1. Start the app with `VITE_DEMO=true` (the `.env.example` already sets this).
2. Open the dashboard (`/dashboard`).
3. In the sidebar, toggle **"Demo: simulate extreme heat day"** to ON.
4. The app reloads data with `scenario=extreme`. A full-screen red warning modal appears.
5. The modal shows the risk level, the time window, the top 3 actions, and three buttons.
6. Dismiss it — it won't pop up again for the same alert (deduplicated by ID in localStorage).
7. To see it again: clear localStorage (`saaya-dismissed-alerts` key) or use a different alert ID.

### Full demo script (2 minutes)

1. **Landing page (20s)**: Show the hero, tagline, features overview, and the "How we calculate risk" section. Point out the disclaimer and PMD/NDMA links.
2. **Open dashboard (15s)**: Click "Open dashboard". Show the sidebar with nav, location toggle, and language switcher. Point out the active location name.
3. **Overview page (15s)**: Show the current risk badge (with icon and label — not color alone), current weather, next elevated-risk period, top guidance, and nearest cooling places.
4. **Weather forecast (10s)**: Switch to Weather. Show the 48-hour chart with temperature, feels-like, humidity, UV. Scroll the 7-day list.
5. **Heat risk (15s)**: Switch to Heat Risk. Show the heat index, drivers, the hourly timeline with color-coded bars and elevated periods shaded, and the methodology panel.
6. **Safety guidance (10s)**: Switch to Guidance. Show items grouped by audience (everyone, outdoor workers, older adults, children). Note the icons and short text.
7. **Trigger extreme pop-up (15s)**: Toggle "Demo: simulate extreme heat day" in the sidebar. The red modal appears. Show the time window, actions, and buttons. Click "Find cooling centers".
8. **Cooling map (10s)**: Show the Pakistan map with colored markers. Use the type/province filters. Click "Near me" to zoom in and list closest places. Click a marker to show the popup with details and "Get directions".
9. **Language switch (10s)**: Switch to Urdu — the entire UI flips to RTL. Switch to Sindhi. Switch back to English.

## Features

- **Landing page**: hero, problem statement, feature cards, methodology section, language overview, disclaimer, footer with PMD/NDMA links
- **Dashboard with vertical sidebar**: Overview, Weather, Heat Risk, Guidance, Notifications (with unread badge), Cooling Map
- **Location**: toggle between browser geolocation and city picker (Khairpur Mirs default). Never shows a blank screen.
- **Heat risk indicator**: four levels (low/moderate/high/extreme) with color + label + icon. Elevated periods highlighted.
- **Safety guidance**: adapts to current risk level, grouped by audience, with icons
- **Notifications**: polled every 5 minutes, with a red full-screen alert modal for danger severity (focus-trapped, Escape to close, deduplicated by alert ID)
- **Cooling map**: Leaflet + OpenStreetMap, markers by type with legend, filters by type/province, search, "near me" button, popups with details and directions link, sample-data badge for unverified entries, optional city risk markers
- **Three languages**: English (LTR), Urdu (RTL), Sindhi (RTL). Full UI direction flip. Choice remembered in localStorage.
- **Mock + demo modes**: `VITE_USE_MOCK=true` serves contract-shaped JSON. `VITE_DEMO=true` adds the extreme-heat toggle.
- **Loading, error, and empty states** for every data section
- **Responsive** from 360px wide, with a slide-in drawer sidebar on mobile
- **Accessibility**: WCAG AA contrast, visible keyboard focus, aria labels, reduced-motion support, role="alertdialog" for the alert modal

## Project structure

```
src/
  api/            API client + mock data
  components/     Shared UI (Logo, Sidebar, Header, RiskBadge, AlertModal, etc.)
  context/        React contexts (Location, Demo, Notification)
  hooks/          Data-fetching hooks (useWeather, useRisk, useGuidance, etc.)
  i18n/           i18n context + translations (en, ur, sd)
  pages/          Route pages (Landing, DashboardLayout, Overview, Weather, etc.)
  types/          TypeScript API contract types
  utils/          Logic helpers (risk, location) + tests
```

## Tests

```bash
npm test
```

Tests cover:
- Risk level classification (`isElevated`)
- Alert modal logic (`shouldShowAlertModal`)
- Alert deduplication (`isAlertDismissed`, `markAlertDismissed`, `dedupeKey`)
- Time formatting (`formatTimeRange`)
- Location fallback logic (`resolveLocation`, `getDefaultCity`, `findCityById`)

## Disclaimer

Saaya is a community tool and **not a substitute for official warnings or professional medical advice**. Always follow guidance from the [Pakistan Meteorological Department](https://www.pmd.gov.pk) and [NDMA](https://ndma.gov.pk). In a medical emergency, call 1122.

## Note on translations

Urdu and Sindhi translations are marked in the source with a note that they need native-speaker review.
