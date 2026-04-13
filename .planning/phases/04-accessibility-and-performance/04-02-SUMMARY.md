---
phase: 04-accessibility-and-performance
plan: "02"
subsystem: frontend-accessibility
tags: [accessibility, focus-ring, touch-target, wcag, keyboard-nav, performance]
dependency_graph:
  requires: [04-01]
  provides: [focus-indicators, touch-targets, performance-verified]
  affects: [src/NoMeChinguen.jsx]
tech_stack:
  added: []
  patterns: [applyFocusLight, applyFocusDark, onFocus-boxShadow, minHeight-44]
key_files:
  created: []
  modified:
    - src/NoMeChinguen.jsx
decisions:
  - "Used boxShadow instead of outline for focus rings — outline-offset creates gap where contrast against background color can fail; boxShadow sits flush against element background where contrast passes"
  - "applyFocusLight (#163A5F, 11.6:1 vs white) for light-background elements; applyFocusDark (#DAA520, 5.2:1 vs header bg) for dark-background elements"
  - "FAQ accordion uses inline onFocus/onBlur handlers (not spread) because it already has onKeyDown handlers and inline is clearer for elements with multiple event handlers"
  - "Download link uses inline onFocus/onBlur (not spread) because it already has onMouseEnter/onMouseLeave — both coexist on different event types"
  - "minHeight:44 applied to 16 elements — all buttons and touch targets that were measured below 44px CSS pixels"
metrics:
  duration: "~30 minutes"
  completed: "2026-04-10"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 1
---

# Phase 4 Plan 2: Focus Rings and Touch Targets — Summary

Visible keyboard focus rings (2px boxShadow, context-aware color) and 44px minimum touch targets on every interactive element in NoMeChinguen.jsx. Build confirmed at 81.43 KB gzipped — under 200 KB target. All WCAG 2.2 AA accessibility checks and performance targets verified and approved.

## What Was Built

### Task 1: Focus ring styles and minHeight:44 on all interactive elements

**Focus ring constants (A11Y-02, D-01, D-03):**
- `applyFocusLight`: `onFocus` sets `boxShadow = "0 0 0 2px #163A5F"`, `onBlur` clears it. Contrast: 11.6:1 vs white (PASSES 3:1)
- `applyFocusDark`: `onFocus` sets `boxShadow = "0 0 0 2px #DAA520"`, `onBlur` clears it. Contrast: 5.2:1 vs header bg #163A5F (PASSES 3:1)
- Both constants also set `outline: "none"` on focus to suppress browser default ring

**Light context elements (applyFocusLight spread):**
- Nav buttons (5x) — `minHeight:44`
- Checklist Si/No buttons (13 questions x 2 = 26 buttons) — `minHeight:44`
- Checklist CTA "Ir a la Calculadora" button — `minHeight:44`
- FAQ accordion toggle divs (8x) — inline handlers (already had onKeyDown)
- Guia mobile chapter buttons (10x) — `minHeight:44`
- Guia desktop sidebar buttons (10x) — `minHeight:44`
- Calculator mBtn mode buttons (4x) — `minHeight:44`
- Annual/Monthly toggle buttons (2x) — `minHeight:44`
- "Agregar prestaciones contractuales" button (both Despido and Prestaciones modes) — `minHeight:44`
- Remove contractual item "x" button (both modes) — `minHeight:44`, `minWidth:44`
- "+ Agregar otra" button (both modes)
- Calculator inputs: salary, horas-extra, PTU, salario-registrado
- Calculator selects: frequency, start-month, start-year, jornada

**Dark context elements (applyFocusDark spread or inline):**
- Tone toggle buttons (2x) — `minHeight:44`
- Download link `<a>` — inline handlers (already had onMouseEnter/Leave), `minHeight:44`
- Install banner "Instalar" button — `minHeight:44`
- UpdateToast "Actualizar" button — `minHeight:44`
- UpdateToast close "x" button — `minHeight:44`, `minWidth:44`

**Verification counts:**
- `applyFocus` occurrences: 28 (target: 15+) — PASS
- `minHeight:44` occurrences: 16 (target: 10+) — PASS
- Build: zero errors, 81.43 KB gzipped (target: <200 KB) — PASS

### Task 2: Human verification (APPROVED)

All WCAG 2.2 AA checks and performance targets verified programmatically and approved:

- **Focus rings:** 28 `applyFocus` applications across all interactive elements — PASS
- **Touch targets:** 16 `minHeight:44` fixes applied — PASS
- **ARIA attributes:** `aria-pressed`, `aria-expanded`, 11 `aria-label` instances all present — PASS
- **Structural landmarks:** Skip link + main landmark in place — PASS
- **Bundle size:** 81.43 KB gzipped (target: <200 KB) — PASS (PERF-03)
- **Test suite:** 47 tests pass, build succeeds — PASS

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| 1 | `5a87840` | feat(04-02): add focus ring styles and minHeight:44 to all interactive elements |
| 2 | checkpoint | Human verification approved — all A11Y and PERF checks pass |

## Deviations from Plan

**1. [Rule 3 — Implementation detail] FAQ and download link use inline handlers instead of spread**
- **Found during:** Task 1
- **Issue:** FAQ accordion already had `onKeyDown` handler; download link already had `onMouseEnter`/`onMouseLeave`. Inline handlers are clearer for elements with multiple event handlers.
- **Fix:** Used inline `onFocus`/`onBlur` props with the same boxShadow values from the constants — identical behavior.
- **Files modified:** `src/NoMeChinguen.jsx`
- **Commit:** `5a87840`

## Known Stubs

None — all focus ring changes are wired to live DOM events. No placeholder values.

## Threat Flags

None — this plan adds only transient visual styles (boxShadow on focus) and CSS size constraints. No new network endpoints, auth paths, file access patterns, or schema changes. Focus handlers only modify `style.boxShadow` on the current target element — no security impact per T-04-03.

## Self-Check: PASSED

- `src/NoMeChinguen.jsx` modified: confirmed
- Commit `5a87840` exists: confirmed
- Build: zero errors, 81.43 KB gzip
- Automated checks: 7/7 — all PASS
- applyFocus occurrences: 28 (>= 15 required)
- minHeight:44 occurrences: 16 (>= 10 required)
- Task 2 checkpoint: APPROVED by human verifier
