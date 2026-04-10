---
phase: 03-pwa-core
plan: 01
subsystem: fonts-and-icons
tags: [fontsource, pwa, icons, offline, privacy]
dependency_graph:
  requires: []
  provides: [self-hosted-fonts, pwa-icons]
  affects: [03-02-service-worker]
tech_stack:
  added:
    - "@fontsource/dm-sans@5.2.8"
    - "@fontsource/space-mono@5.2.9"
    - "@vite-pwa/assets-generator@1.0.2"
  patterns:
    - Fontsource CSS imports in entry point (main.jsx)
    - pwa-assets.config.js with minimal2023Preset for icon generation
key_files:
  created:
    - src/main.jsx (Fontsource CSS imports added)
    - public/nmc-icon.svg
    - public/pwa-192x192.png
    - public/pwa-512x512.png
    - public/maskable-icon-512x512.png
    - public/apple-touch-icon-180x180.png
    - pwa-assets.config.js
  modified:
    - package.json (3 new deps + generate-icons script)
    - src/NoMeChinguen.jsx (Google Fonts useEffect removed)
decisions:
  - DM Sans 600.css exists in Fontsource package -- imported 400/600/700 to match original Google Fonts weights exactly (no fallback to 500 needed)
  - apple-touch-icon-180x180.png committed as bonus output from minimal2023Preset -- useful for Plan 02 manifest
metrics:
  duration: ~8 minutes
  completed: "2026-04-10"
  tasks_completed: 3
  files_created: 7
  files_modified: 2
---

# Phase 03 Plan 01: Self-Hosted Fonts and PWA Icons Summary

**One-liner:** Fontsource WOFF2 self-hosting for DM Sans (400/600/700) and Space Mono (400) replaces Google Fonts CDN, with NMC-branded PWA icon set (192px, 512px, maskable 512px) generated via @vite-pwa/assets-generator.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Install Fontsource packages and add font imports | d4dc189 | package.json, src/main.jsx |
| 2 | Remove Google Fonts CDN references | 4dbf692 | src/NoMeChinguen.jsx |
| 3 | Generate PWA icons | bb53a99 | public/nmc-icon.svg, public/pwa-*.png, pwa-assets.config.js |

## Verification Results

1. `npm run build` — passes, built in ~735ms
2. `dist/assets/` — contains WOFF2 files for DM Sans (400/600/700, latin + latin-ext) and Space Mono (400, latin + latin-ext)
3. `grep -r "fonts.googleapis" src/ index.html` — returns no matches (PASS)
4. Three icon PNGs verified in `public/`: pwa-192x192.png (963B), pwa-512x512.png (2448B), maskable-icon-512x512.png (1781B)
5. Font-family variables `const font` and `const mono` preserved unchanged in NoMeChinguen.jsx (lines 33-34)

## Deviations from Plan

### Auto-additions (not bugs, bonus output)

**1. apple-touch-icon-180x180.png committed**
- **Found during:** Task 3 icon generation
- **Issue:** minimal2023Preset generates a 180px Apple Touch Icon in addition to the three required PNG variants
- **Fix:** Committed the bonus file to public/ since Plan 02 manifest will reference it for iOS home screen support
- **Files modified:** public/apple-touch-icon-180x180.png added to commit bb53a99

**2. DM Sans weight selection: 600 (not 500 fallback)**
- **Found during:** Task 1 — checking available weight CSS files
- **Issue:** Research open question #1 was whether 600.css would exist in Fontsource
- **Fix:** 600.css exists — imported 400/600/700 exactly matching original Google Fonts request. No fallback to 500 needed.

## Known Stubs

None. All font imports are wired to real WOFF2 assets bundled by Vite. Icons are real PNG files from SVG generation.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_resolved: T-03-01 | src/NoMeChinguen.jsx | Google Fonts CDN removed -- no third-party font requests, all fonts served from same origin bundle |

## Self-Check: PASSED

- src/main.jsx — FOUND (Fontsource imports present)
- src/NoMeChinguen.jsx — FOUND (Google Fonts useEffect removed, font vars preserved)
- public/nmc-icon.svg — FOUND
- public/pwa-192x192.png — FOUND
- public/pwa-512x512.png — FOUND
- public/maskable-icon-512x512.png — FOUND
- pwa-assets.config.js — FOUND
- Commit d4dc189 — FOUND
- Commit 4dbf692 — FOUND
- Commit bb53a99 — FOUND
