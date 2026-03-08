---
work_package_id: WP06
title: Onboarding, Household Capture, And Scenario UX
lane: completed
dependencies: [WP03, WP04]
subtasks:
- T029
- T030
- T031
- T032
- T033
- T034
phase: Phase 3 - User Experience
assignee: GitHub Copilot
agent: GPT-5.3-Codex
shell_pid: ''
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-03-08T20:59:34Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
- timestamp: '2026-03-08T22:24:27Z'
  lane: completed
  agent: GPT-5.3-Codex
  shell_pid: ''
  action: Implemented onboarding, account editing, scenario authoring, comparison views, state panels, assumptions panel, and UI integration tests.
requirement_refs:
- FR-001
- FR-002
- FR-003
- FR-019
- FR-020
---

# Work Package Prompt: WP06 - Onboarding, Household Capture, And Scenario UX

## Objectives & Success Criteria
- Deliver end-to-end user journey from onboarding to scenario comparison.
- Keep assumptions, warnings, and non-advisory messaging visible.
- Support single-household local workspace scope cleanly.

## Context & Constraints
- Dependencies: WP03 and WP04 complete.
- Command: `spec-kitty implement WP06 --base WP03`
- UX should be simple but not simplistic; avoid hidden assumptions.

## Subtasks & Detailed Guidance

### Subtask T029 - Onboarding wizard
- Purpose: Capture required profile inputs without overwhelming users.
- Steps:
  1. Implement stepwise onboarding for household identity, people, province, and starter balances.
  2. Add progressive disclosure for optional fields.
- Files: `src/ui/onboarding/**`
- Parallel?: No.

### Subtask T030 - Account editing flows
- Purpose: Enable structured account data entry/update.
- Steps:
  1. Build account form components with account-type-aware fields.
  2. Include confidence and user-verified controls.
- Files: `src/ui/accounts/**`, `src/components/account-form.js`
- Parallel?: No.

### Subtask T031 - Scenario authoring UI
- Purpose: Let users define meaningful variants quickly.
- Steps:
  1. Build scenario controls for retirement age, CPP/OAS, withdrawal strategy, inflation, spending.
  2. Persist scenario files through state repository.
- Files: `src/ui/scenarios/**`
- Parallel?: No.

### Subtask T032 - Scenario comparison views
- Purpose: Show side-by-side outcomes with transparent differences.
- Steps:
  1. Build comparison table/cards for key metrics.
  2. Add drill-down for assumption differences.
- Files: `src/ui/comparison/**`
- Parallel?: No.

### Subtask T033 - Empty/error/loading and assumptions panel
- Purpose: Handle real-world data states and uncertainty communication.
- Steps:
  1. Add robust states for no data, stale data, validation error, running model.
  2. Keep assumptions/warnings panel visible in all result views.
- Files: `src/components/state-panels/**`, `src/components/assumptions-panel.js`
- Parallel?: Yes.

### Subtask T034 - UI integration tests
- Purpose: Protect primary user journeys from regression.
- Steps:
  1. Add journey tests: onboard -> add account -> create scenario -> run -> compare.
  2. Add edge tests for invalid scenario and missing data states.
- Files: `tests/integration/ui/**/*.test.js`
- Parallel?: No.

## Test Strategy
- Run integration tests for complete P1 user stories.
- Validate non-advisory disclaimer presence in core pages.

## Risks & Mitigations
- Risk: Form complexity causes user drop-off.
- Mitigation: keep first-run mandatory fields minimal and guide optional enrichments.

## Review Guidance
- Confirm UX flow supports independent test criteria in spec user stories.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
- 2026-03-08T22:24:27Z - GPT-5.3-Codex - lane=completed - Added onboarding wizard draft/finalization flow, account form validation and editor, scenario authoring model, scenario comparison view builders, assumptions + empty/error/loading/stale state panels, and integration tests for journey and error paths.
