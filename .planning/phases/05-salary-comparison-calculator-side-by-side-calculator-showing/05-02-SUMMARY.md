---
phase: 05-salary-comparison-calculator
plan: 02
subsystem: ui
tags: [react, calculator, lft, comparacion, imss, infonavit]

# Dependency graph
requires:
  - phase: 05-01
    provides: calcComparacion and calcInfonavitCredit functions in src/utils/calculations.js

provides:
  - "Nomina Real vs Minimo mode in CalcTab — worker sees side-by-side benefit comparison"
  - "Desktop 4-column table (Concepto | Real | IMSS | Lo que pierdes) with red loss column"
  - "Mobile stacked card layout — one card per benefit concept"
  - "Minimo toggle defaulting to $315.04/dia with custom salary input fallback"
  - "Legal callout citing Art. 15 Ley del Seguro Social and PROFEDET 800 911 7877"

affects: [verify-work, deployment]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "IIFE pattern for full-width CalcTab modes: {mode==='X' && (()=>{ ... })()}"
    - "Concept array iteration (conceptos map) for DRY table/card rendering"
    - "usaMinimo toggle pattern: checkbox clears custom input on re-check"

key-files:
  created: []
  modified:
    - src/NoMeChinguen.jsx

key-decisions:
  - "Show info callout instead of table when salarioDia <= sdRegistrado — zero-loss comparison confuses workers"
  - "Desktop renders 4-column table; mobile renders stacked cards — prevents overflow on 375px viewport"
  - "Default usaMinimo=true so worker sees comparison result immediately with the minimum wage as registered salary"

patterns-established:
  - "Full-width mode rendering pattern established for despido and comparacion — use {mode==='X' && (() => { ... })()}"
  - "Concept iteration via CONCEPTOS array keeps table/card code DRY across both layouts"

requirements-completed: [COMP-04, COMP-05, COMP-06, COMP-07, COMP-08]

# Metrics
duration: 20min
completed: 2026-04-10
---

# Phase 05 Plan 02: Salary Comparison Calculator — UI Summary

**Side-by-side salary comparison table in CalcTab showing workers their benefit losses from IMSS subregistro, with red loss column, minimo toggle, and Art. 15 LSS legal callout**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-04-13T12:26:00Z
- **Completed:** 2026-04-10T00:00:00Z
- **Tasks:** 2 of 2 (all tasks complete, Task 2 human-verify checkpoint APPROVED)
- **Files modified:** 1

## Accomplishments

- Added "Nomina Real vs Minimo" mode button to CalcTab alongside Prestaciones, Horas Extra, Despido
- Registered salary input card with checkbox toggle defaulting to $315.04/dia (SALARIO_MINIMO_DIARIO)
- Desktop comparison table: 4 columns (Concepto, Salario Real, Registrado IMSS, Lo que pierdes) across 7 benefit rows + total
- Mobile stacked card layout: one card per concept, no horizontal overflow on 375px viewport
- Loss column styled with C.error (red) and fontWeight 700 per D-03
- Summary Callout (error) shows total loss amount; info Callout cites Art. 15 Ley del Seguro Social + PROFEDET

## Task Commits

1. **Task 1: Add Comparacion mode to CalcTab** - `a0d0f45` (feat)
2. **Task 2: Visual verification checkpoint** - APPROVED (no code commit — verification only)

## Files Created/Modified

- `src/NoMeChinguen.jsx` - Added calcComparacion import, salarioRegistrado/usaMinimo state, mode button, full comparacion IIFE render block, updated mode!=="despido" condition to also exclude "comparacion"

## Decisions Made

- `usaMinimo` defaults to `true` so the worker immediately sees the comparison without needing to enter a registered salary — the common case is minimum wage subregistro
- Guard `salarioDia <= sdRegistrado` shows an info callout instead of rendering a zero-or-negative loss table, which would be misleading in this educational context
- Desktop table uses `<table>` element (not flex/grid divs) for semantic clarity and accessibility of tabular data
- Mobile renders cards via `.map()` over the same `conceptos` array used for the desktop table — single source of truth

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added cherry-pick of Plan 01 commits into parallel worktree**
- **Found during:** Pre-task worktree branch check
- **Issue:** Worktree branch `worktree-agent-af3cbbb1` diverged from the Plan 01 base commit `c4424349` — Plan 01's `calcComparacion` and `calcInfonavitCredit` were not present in this worktree
- **Fix:** Cherry-picked `4098f5e` (test) and `c442434` (feat) from Plan 01's branch into this worktree before implementing Plan 02
- **Files modified:** src/utils/calculations.js, src/utils/calculations.test.js
- **Verification:** `calcComparacion` and `calcInfonavitCredit` present in calculations.js; build succeeds
- **Committed in:** 66f4ee3, 467db28 (cherry-picks)

---

**Total deviations:** 1 auto-fixed (Rule 1 — blocking setup issue)
**Impact on plan:** Cherry-pick was necessary to have the calculation functions available. No scope creep.

## Issues Encountered

- Parallel worktree was created from a branch that diverged before Plan 01 completed. Resolved via `git cherry-pick` of Plan 01 commits. This is expected behavior for parallel executor worktrees — Plan 02 depends on Plan 01 (`depends_on: ["05-01"]`).

## User Setup Required

None - no external service configuration required.

## Known Stubs

None — all seven benefit concepts are wired directly to `calcComparacion()` output. No placeholder data.

## Checkpoint Verification Results (Task 2 — APPROVED)

Human visual verification confirmed all acceptance criteria passed:
- 7 concept comparison table renders correctly with LFT article references
- Red "Lo que pierdes" column displays losses prominently
- Red error callout with total loss amount is visible
- Legal callout cites Art. 15 LSS + PROFEDET phone number (800 911 7877)
- Build passes cleanly
- "Minimo" checkbox defaults ON, fills $315.04 automatically
- Custom salary input appears when checkbox is unchecked, table updates on change
- Mobile stacked card layout works on 375px viewport

## Next Phase Readiness

- Plan 05-02 is complete — all tasks done and verified
- Phase 05 (salary comparison calculator) is fully implemented
- Phase 05 ready for verify-work

## Self-Check: PASSED

- src/NoMeChinguen.jsx — FOUND
- 05-02-SUMMARY.md — FOUND (main project .planning path)
- commit a0d0f45 — FOUND
- npm run build — PASSED (exit 0)
- Task 2 visual verification — APPROVED by human
