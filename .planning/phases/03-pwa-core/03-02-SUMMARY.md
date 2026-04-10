---
phase: 03-pwa-core
plan: 02
subsystem: infra
tags: [pwa, vite-plugin-pwa, workbox, service-worker, manifest, offline, react]

# Dependency graph
requires:
  - phase: 03-01
    provides: Self-hosted WOFF2 fonts via Fontsource, PWA icons (pwa-192x192.png, pwa-512x512.png, maskable-icon-512x512.png) in public/

provides:
  - vite-plugin-pwa configured with generateSW mode — produces dist/sw.js and dist/manifest.webmanifest at build time
  - Web app manifest with name, short_name, 3 icons, theme/background colors, display:standalone, start_url
  - Workbox service worker precaching all assets (js, css, html, woff2, png, webp, pdf, svg, ico)
  - UpdateToast component for service worker update notifications
  - App is installable on Android home screens and works fully offline after one visit

affects: [04-seo-deploy, any future phase touching vite.config.js or service worker behavior]

# Tech tracking
tech-stack:
  added:
    - vite-plugin-pwa@1.2.0 (devDependency)
    - workbox-window@7.4.0 (devDependency)
  patterns:
    - registerType:prompt — user controls when new SW activates (prevents stranding on stale versions)
    - UpdateToast with useRegisterSW hook from virtual:pwa-register/react
    - Auto-dismiss toast via setTimeout/useEffect cleanup pattern

key-files:
  created:
    - .planning/phases/03-pwa-core/03-02-SUMMARY.md
  modified:
    - vite.config.js — added VitePWA plugin with manifest, workbox config, includeAssets
    - src/NoMeChinguen.jsx — added useRegisterSW import and UpdateToast component
    - package.json — added vite-plugin-pwa and workbox-window devDependencies

key-decisions:
  - "registerType:prompt chosen per D-04 — user decides when to reload, no silent stale caching"
  - "globPatterns extended to include woff2/png/webp/pdf/svg/ico — Workbox default only covers js/css/html"
  - "includeAssets lists volante.pdf and og-image.webp explicitly — public/ files not auto-precached by globPatterns alone"
  - "UpdateToast auto-dismisses after 15s per D-06 — non-intrusive, doesn't block content"
  - "theme_color:#1B2A1B and background_color:#F5F1EB per D-09 — matches app palette"

patterns-established:
  - "Pattern: virtual:pwa-register/react provides useRegisterSW hook — import resolves at build time only, not in node_modules"
  - "Pattern: UpdateToast as last child of root div — fixed-positioned overlay doesn't affect layout"

requirements-completed: [PWA-01, PWA-02]

# Metrics
duration: 45min
completed: 2026-04-10
---

# Phase 03 Plan 02: PWA Service Worker and Update Toast Summary

**Workbox service worker precaching entire app shell (fonts, icons, PDF, OG image) via vite-plugin-pwa, with bottom toast notifying users of updates — app is now installable and offline-capable**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-04-10T12:24:00Z
- **Completed:** 2026-04-10T12:54:00Z
- **Tasks:** 3 of 3 complete
- **Files modified:** 3

## Accomplishments

- vite-plugin-pwa configured with manifest (PWA-01) and generateSW service worker (PWA-02) — build now produces dist/sw.js and dist/manifest.webmanifest
- Workbox precaches 26 entries (~477 KiB) including WOFF2 fonts, PNG icons, volante.pdf, og-image.webp, and all app JS/CSS
- UpdateToast component wired via useRegisterSW hook — shows "Nueva versión disponible" with Actualizar button, auto-dismisses after 15 seconds

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure vite-plugin-pwa with manifest and service worker** - `8763750` (feat)
2. **Task 2: Add UpdateToast component with service worker registration** - `bf995c5` (feat)
3. **Task 3: Verify PWA offline functionality and install criteria** - human-verified (checkpoint approved)

## Files Created/Modified

- `vite.config.js` — Added VitePWA plugin with registerType:prompt, manifest, icons, globPatterns, includeAssets
- `src/NoMeChinguen.jsx` — Added useRegisterSW import and UpdateToast component (73 lines inserted)
- `package.json` / `package-lock.json` — Added vite-plugin-pwa@1.2.0 and workbox-window@7.4.0 devDependencies

## Decisions Made

- Used `registerType: "prompt"` (D-04) — prevents stranding users on stale versions; user explicitly triggers SW activation
- Extended Workbox `globPatterns` to `**/*.{js,css,html,woff2,png,webp,pdf,svg,ico}` — default only covers js/css/html and would miss fonts and assets
- Listed `volante.pdf` and `og-image.webp` in `includeAssets` — public/ files are not automatically precached by globPatterns alone
- Icon src names use plan-correct filenames (`pwa-192x192.png`, `pwa-512x512.png`, `maskable-icon-512x512.png`) NOT the RESEARCH.md example names

## Deviations from Plan

None — plan executed exactly as written. The worktree required initial setup (npm install) but this was expected for a parallel agent worktree and not a deviation.

## Issues Encountered

- Worktree initial state required git checkout to restore files to the dff77854 base commit (due to git reset --soft behavior). Resolved by checking out HEAD files explicitly. No code changes affected.

## Known Stubs

None — all data is wired. The UpdateToast will only render when a new service worker is actually detected (`needRefresh` from useRegisterSW). This is correct behavior, not a stub.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: service-worker-scope | dist/sw.js | SW controls all requests at / scope — mitigated by registerType:prompt (D-04) and public/_headers already setting Cache-Control:no-cache on /sw.js |

(No new unmitigated threats — T-03-03, T-03-04, T-03-05 are all mitigated per plan threat model)

## User Setup Required

None — no external service configuration required.

## Human Verification Results (Task 3)

Checkpoint approved 2026-04-10 with all checks passing:

- Manifest valid JSON with all required fields (name, short_name, display:standalone, theme_color, background_color, start_url, icons)
- sw.js generated, precaching 26 entries (477 KiB)
- All 3 icon files served correctly (HTTP 200)
- volante.pdf precached and served (HTTP 200)
- Fonts render correctly (DM Sans + Space Mono), zero Google Fonts CDN references
- UpdateToast component present with accented "Nueva version disponible"
- Build passes in 761ms, JS bundle 78.67 KB gzipped
- Only console error is favicon 404 (non-blocking)

## Next Phase Readiness

- PWA infrastructure complete and human-verified: sw.js + manifest.webmanifest confirmed working
- App is installable on Android home screens and works fully offline after one visit
- Phase 03 is fully complete — ready for Phase 04 (SEO/Deploy)

---
*Phase: 03-pwa-core*
*Completed: 2026-04-10*
