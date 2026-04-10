# Roadmap: No Me Chinguen

## Overview

An existing React SPA — with all core labor-rights content already built — is elevated into a legally verified, installable, offline-first Progressive Web App ready for WhatsApp distribution across Mexico. The journey: verify the law is right, get the site live with HTTPS, add the offline/install layer, then confirm it meets accessibility and performance standards for low-end Android devices on 2G/3G.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Legal Verification** - Verify every LFT article reference, monetary value, and contact against current law before anything ships (completed 2026-04-06)
- [ ] **Phase 2: Deployment Foundation** - Live site on nomechinguen.com.mx with HTTPS, correct Spanish OG cards for WhatsApp, and critical cache headers
- [ ] **Phase 3: PWA Core** - Installable offline-first app: self-hosted fonts, service worker, manifest, and icons
- [ ] **Phase 4: Accessibility and Performance** - WCAG 2.2 AA compliance and LCP under 2.5s on throttled 3G confirmed before public promotion

## Phase Details

### Phase 1: Legal Verification
**Goal**: Every legal claim, calculation, and contact in the app is verified against current authoritative sources before the app is deployed
**Depends on**: Nothing (first phase)
**Requirements**: LEGAL-01, LEGAL-02, LEGAL-03, LEGAL-04, LEGAL-05, LEGAL-06, LEGAL-07, LEGAL-08
**Success Criteria** (what must be TRUE):
  1. Every LFT article cited in the checklist questions and guide is confirmed correct against the ultima reforma DOF 21/02/2025 text
  2. The overtime calculator produces correct doble/triple results for all three jornada types as defined in Art. 66-68
  3. The severance calculator produces correct outputs for Art. 48 (3 meses), Art. 50 (20 dias/ano), and Art. 162 (prima de antiguedad)
  4. The vacation table matches Art. 76 post-2023 reform days exactly
  5. All resource contact numbers and URLs (PROFEDET, STPS, IMSS, Infonavit, Conciliacion) resolve to active pages
**Plans:** 2/2 plans complete
Plans:
- [x] 01-01-PLAN.md — Extract monetary constants to legal.js, fix stale UMA, correct citations, verify URLs
- [x] 01-02-PLAN.md — Produce structured verification report, project owner review checkpoint

### Phase 2: Deployment Foundation
**Goal**: The app is live at nomechinguen.com.mx over HTTPS with correct Spanish WhatsApp link previews and Cloudflare cache headers that will never serve stale service workers
**Depends on**: Phase 1
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03, SEO-01, SEO-02, SEO-03
**Success Criteria** (what must be TRUE):
  1. Pasting https://nomechinguen.com.mx into WhatsApp shows a preview card with the correct Spanish title, description, and OG image
  2. The site loads over HTTPS at nomechinguen.com.mx with no mixed-content warnings
  3. The HTML element carries lang="es-MX" (verifiable in DevTools Elements panel)
  4. A curl of /sw.js response headers shows Cache-Control: no-cache, no-store (even before the SW file exists)
  5. robots.txt and sitemap.xml are accessible at their canonical URLs
**Plans:** 2 plans
Plans:
- [x] 02-01-PLAN.md — Edit index.html (lang fix + OG tags), create public/ static files, generate OG image
- [x] 02-02-PLAN.md — Deploy to Cloudflare Pages, configure custom domain, verify live site
**UI hint**: yes

### Phase 02.4: Full Legal Guide PDF (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 2
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 02.4 to break down)

### Phase 02.3: Personalized Results PDF (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 2
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 02.3 to break down)

### Phase 02.2: Shareable PDF Flyer (INSERTED)

**Goal:** A one-page PDF flyer ("volante") listing 7 common labor violations is downloadable from the app header — pre-generated at build time, under 500KB for WhatsApp sharing, with a QR code linking back to the site
**Requirements**: FLYER-01, FLYER-02, FLYER-03, FLYER-04, FLYER-05, FLYER-06, FLYER-07, FLYER-08
**Depends on:** Phase 2
**Plans:** 2/2 plans complete

Plans:
- [x] 02.2-01-PLAN.md — Create generate-flyer.js script and produce volante.pdf (A4 flyer with violations, phone numbers, QR code)
- [x] 02.2-02-PLAN.md — Add download button to app header, human verification of button + PDF

### Phase 02.1: Full Compensation Calculator (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 2
**Plans:** 3/3 plans complete

Plans:
- [x] TBD (run /gsd-plan-phase 02.1 to break down) (completed 2026-04-07)

### Phase 3: PWA Core
**Goal**: A worker who visits nomechinguen.com.mx can install the app to their home screen and use all content fully offline after first visit, with fonts loading from the service worker cache
**Depends on**: Phase 2
**Requirements**: PERF-01, PWA-01, PWA-02, PWA-03
**Success Criteria** (what must be TRUE):
  1. Chrome on Android shows an "Add to Home Screen" install prompt (or the install criteria are met and manually verified in Chrome DevTools Application panel)
  2. With network throttling set to Offline in DevTools, navigating to the app after one prior visit loads all content including fonts — no blank screen, no broken layout
  3. The web app manifest is valid with name, short_name, icons (192px + 512px + maskable), theme_color, background_color, display:standalone, and start_url
  4. DM Sans and Space Mono load with zero external network requests (confirmed via DevTools Network panel with cache cleared)
**Plans:** 2 plans

Plans:
- [ ] 03-01-PLAN.md — Replace Google Fonts with Fontsource self-hosted WOFF2 packages, generate PWA icon assets
- [ ] 03-02-PLAN.md — Configure vite-plugin-pwa (manifest + service worker + precaching), add update notification toast

### Phase 4: Accessibility and Performance
**Goal**: Every worker can use the app regardless of disability or device capability — keyboard users, screen reader users, low-vision users, and workers on budget Androids with 3G connections
**Depends on**: Phase 3
**Requirements**: A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. A user navigating only with Tab/Enter/Space can reach and operate every interactive element: nav tabs, checklist answers, FAQ accordion, overtime and severance calculator inputs, and the tone toggle
  2. Focused elements have a visible focus ring meeting 3:1 contrast and all touch targets on checklist, nav, and calculators are at minimum 44x44px
  3. Lighthouse mobile audit run on the deployed Cloudflare URL shows LCP under 2.5s and a PWA score of 90 or higher
  4. Total JS bundle is under 200KB gzipped (confirmed via bundle analyzer output)
  5. VoiceOver or TalkBack announces the tone toggle state (pressed/not pressed), FAQ accordion state (expanded/collapsed), and calculator input labels correctly
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Legal Verification | 2/2 | Complete    | 2026-04-06 |
| 2. Deployment Foundation | 0/2 | Planned | - |
| 3. PWA Core | 0/2 | Planned | - |
| 4. Accessibility and Performance | 0/TBD | Not started | - |
