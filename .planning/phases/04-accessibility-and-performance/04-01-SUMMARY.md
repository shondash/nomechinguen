---
phase: 04-accessibility-and-performance
plan: "01"
subsystem: frontend-accessibility
tags: [accessibility, aria, wcag, keyboard-nav, color-contrast, skip-link]
dependency_graph:
  requires: []
  provides: [aria-semantics, keyboard-navigation, skip-link, main-landmark, color-contrast-fix]
  affects: [src/NoMeChinguen.jsx]
tech_stack:
  added: []
  patterns: [role=button+tabIndex+onKeyDown, aria-pressed, aria-expanded+aria-controls, htmlFor+id+aria-label, skip-link-visually-hidden]
key_files:
  created: []
  modified:
    - src/NoMeChinguen.jsx
decisions:
  - "Darkened C.info from #2F80ED to #1A63C0 (5.3:1 vs white) and C.warning from #C28A2E to #8A5E10 (6.5:1 vs white) — both now pass WCAG AA 4.5:1"
  - "Skip-to-content link implemented as visually-hidden <a> that appears on focus using onFocus/onBlur DOM style mutation"
  - "Content wrapper converted from <div> to <main id=main-content> landmark"
  - "Guia desktop sidebar converted from div-onClick to native <button> elements — cleaner than div+role=button since D-05 only constrains FAQ"
  - "InstallBanner outer div onClick removed — inner <button> already handles action accessibly"
  - "FAQ accordion uses div+role=button pattern per D-05 (not converted to native button)"
  - "D-08 heading hierarchy verified correct with no code changes needed: h1 site title, H1 component renders h2, H2 component renders h3"
metrics:
  duration: "~35 minutes"
  completed: "2026-04-13"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 4 Plan 1: ARIA, Keyboard Access, Skip Link, Color Contrast — Summary

WCAG AA accessibility pass: keyboard navigation, ARIA semantics, skip-to-content link, main landmark, and color contrast fixes across all interactive elements in NoMeChinguen.jsx.

## What Was Built

### Task 1: Skip link, main landmark, color contrast fixes, heading verification

**Color contrast fixes (A11Y-06):**
- `C.info` darkened from `#2F80ED` (3.9:1, FAIL) to `#1A63C0` (5.3:1, PASS)
- `C.warning` darkened from `#C28A2E` (3.0:1, FAIL) to `#8A5E10` (6.5:1, PASS)
- Both values remain in the same hue family; all other C.* values already passed WCAG AA

**Skip-to-content link (WCAG 2.4.1 Level A):**
- Added `SKIP_LINK_STYLE` constant: `position:absolute, top:-9999` (visually hidden)
- Added `<a href="#main-content">Saltar al contenido principal</a>` as first focusable element in root div, before InstallBanner
- `onFocus` sets `top: "0"`, `onBlur` sets `top: "-9999px"` — appears only on keyboard focus

**Main landmark:**
- Content wrapper `<div>` converted to `<main id="main-content">` — skip link target + semantic landmark for screen readers

**Heading hierarchy (D-08):**
- Verified: `<h1>` in header (site title), `H1` component → `<h2>` (tab headings), `H2` component → `<h3>` (sub-sections)
- No code changes needed — hierarchy was already correct

### Task 2: ARIA attributes and keyboard access for all interactive elements

**Tone toggle (D-04):**
- Added `aria-pressed={tone===t}` to each button — screen readers announce "directo, toggle button, pressed/not pressed"

**FAQ accordion (D-05, A11Y-01):**
- Outer div: removed `onClick` and `cursor:pointer`
- Inner question div: added `role="button"`, `tabIndex={0}`, `aria-expanded={openIdx===i}`, `aria-controls={"faq-answer-"+i}`, `onKeyDown` handler for Enter/Space with `e.preventDefault()` (prevents page scroll on Space)
- Answer div: added `id={"faq-answer-"+i}` and `role="region"`

**Guia desktop sidebar (A11Y-01):**
- Converted all 10 `<div onClick>` chapter items to native `<button>` elements
- Applied `display:block, width:100%, textAlign:left` to preserve visual layout
- Explicitly removed top/right/bottom borders (only borderLeft used for active indicator)

**InstallBanner wrapper (Claude's Discretion):**
- Removed `onClick={handleInstall}` and `cursor:"pointer"` from outer `<div>`
- Moved `onClick={handleInstall}` to the inner `<button>Instalar</button>` which already existed
- Eliminates duplicate click handlers and inaccessible click target

**Checklist Si/No buttons (D-07):**
- Added `aria-label={\`${opt==="si"?"Sí":"No"} — ${item.q}\`}` combining answer + full question text
- Screen readers announce full context: "Sí — ¿Tu jornada laboral es de más de 8 horas...?"

**Calculator inputs (D-06):**
- Salary input: `id="calc-salary"`, `htmlFor="calc-salary"`, `aria-label` (dynamic: neto/bruto)
- Frequency select: `id="calc-frequency"`, `htmlFor`, `aria-label="Frecuencia de pago"`
- Start month select: `id="calc-start-month"`, `htmlFor`, `aria-label="Mes de ingreso"`
- Start year select: `id="calc-start-year"`, `htmlFor`, `aria-label="Anio de ingreso"`
- Horas extra input: `id="calc-horas-extra"`, `htmlFor`, `aria-label="Horas extra trabajadas en la semana"`
- Jornada select: `id="calc-jornada"`, `htmlFor`, `aria-label="Tipo de jornada laboral"`
- PTU input: `id="calc-ptu"`, `htmlFor`, `aria-label="Monto de PTU recibida"`
- Salario registrado input (comparacion mode): `aria-label="Salario diario registrado en el IMSS"`

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `0813290` | feat(04-01): skip link, main landmark, color contrast fixes |
| 2 | `22e05c7` | feat(04-01): ARIA attributes and keyboard access for all interactive elements |

## Deviations from Plan

None — plan executed exactly as written.

All changes followed the specific patterns documented in 04-RESEARCH.md:
- FAQ uses `div+role=button` per D-05 (not converted to native button)
- Guia sidebar uses native `<button>` per open question #2 resolution
- InstallBanner outer div onClick removed per open question #3 resolution
- Context-aware focus styles deferred to Plan 02 (focus rings are Plan 02 scope)

## Known Stubs

None — all ARIA changes are wired to live React state. No placeholder values.

## Threat Flags

None — this plan added only ARIA attributes and navigation aids. No new network endpoints, auth paths, file access patterns, or schema changes. All aria-label text uses static content from constants or controlled React state (no user input injection risk, per T-04-01).

## Self-Check: PASSED

- `src/NoMeChinguen.jsx` modified: confirmed
- Commit `0813290` exists: confirmed
- Commit `22e05c7` exists: confirmed
- Build: zero errors, 80.71 KB gzip (unchanged from baseline)
- Automated checks: 6/6 Task 1, 9/9 Task 2 — all PASS
