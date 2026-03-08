---
work_package_id: WP07
title: Sustainability And Climate Overlay Modules
lane: planned
dependencies: [WP03, WP06]
subtasks:
- T035
- T036
- T037
- T038
- T039
- T040
phase: Phase 4 - Values And Climate
assignee: ''
agent: ''
shell_pid: ''
review_status: ''
reviewed_by: ''
history:
- timestamp: '2026-03-08T20:59:34Z'
  lane: planned
  agent: system
  shell_pid: ''
  action: Prompt generated via /spec-kitty.tasks
requirement_refs:
- FR-014
- FR-027
- FR-028
- FR-020
---

# Work Package Prompt: WP07 - Sustainability And Climate Overlay Modules

## Objectives & Success Criteria
- Make sustainability context default in scenario outputs.
- Provide transparent component metrics and confidence states.
- Avoid opaque aggregate ESG scoring.

## Context & Constraints
- Dependencies: WP03 and WP06 complete.
- Command: `spec-kitty implement WP07 --base WP03`
- Output must distinguish measured, modeled, and unavailable values.

## Subtasks & Detailed Guidance

### Subtask T035 - Sustainability preferences UX/model
- Purpose: Capture user values and tradeoff preferences.
- Steps:
  1. Build preference schema bindings and form controls.
  2. Support exclusions and positive priorities distinctly.
- Files: `src/ui/sustainability/preferences/**`, `src/schemas/sustainability.schema.json`
- Parallel?: No.

### Subtask T036 - Component metric calculators
- Purpose: Calculate interpretable sustainability components.
- Steps:
  1. Implement calculators for fossil, carbon, renewable/transition, social/community, controversial exposure.
  2. Emit metric-level evidence references.
- Files: `src/engine/sustainability/metrics/*.js`
- Parallel?: No.

### Subtask T037 - Climate overlay scenarios
- Purpose: Show portfolio behavior under climate transition assumptions.
- Steps:
  1. Add rapid-transition, delayed-transition, worsened-physical-risk overlays.
  2. Integrate overlays into scenario run pipeline.
- Files: `src/engine/sustainability/climate-overlays.js`
- Parallel?: No.

### Subtask T038 - Provenance and confidence labeling
- Purpose: Prevent false precision.
- Steps:
  1. Add value labels (`measured`, `modeled`, `unavailable`).
  2. Display source + confidence in UI and report data.
- Files: `src/ui/sustainability/metric-disclosure.js`, `src/reports/sections/sustainability.js`
- Parallel?: No.

### Subtask T039 - Alternatives panel
- Purpose: Suggest values-aligned alternatives without advice claims.
- Steps:
  1. Build alternatives panel with transparent tradeoff notes.
  2. Include uncertainty and data-gap notices.
- Files: `src/ui/sustainability/alternatives-panel.js`
- Parallel?: Yes.

### Subtask T040 - Sustainability tests
- Purpose: Ensure metric and disclosure integrity.
- Steps:
  1. Add fixture tests with partial/absent coverage.
  2. Add assertions preventing single opaque score output.
- Files: `tests/regression/sustainability/**/*.test.js`, `tests/fixtures/sustainability/**`
- Parallel?: No.

## Test Strategy
- Verify default inclusion of sustainability section in scenario results.
- Verify unavailable data paths produce explicit unavailable labels.

## Risks & Mitigations
- Risk: Metric interpretation appears as recommendation.
- Mitigation: keep explanatory language descriptive and disclaimer-bound.

## Review Guidance
- Confirm component-level transparency and no hidden aggregation.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
