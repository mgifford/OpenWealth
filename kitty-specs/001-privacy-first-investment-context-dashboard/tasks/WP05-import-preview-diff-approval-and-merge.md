---
work_package_id: WP05
title: Import Preview, Diff, Approval, And Merge
lane: planned
dependencies: [WP02, WP04]
subtasks:
- T023
- T024
- T025
- T026
- T027
- T028
phase: Phase 3 - Data Ingestion
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
- FR-023
- FR-024
- FR-009
- FR-016
- FR-018
---

# Work Package Prompt: WP05 - Import Preview, Diff, Approval, And Merge

## Objectives & Success Criteria
- Implement safe import flow for YAML/JSON/CSV.
- Block silent overwrite through diff preview + approval gate.
- Record provenance and enforce snapshot-before-apply.

## Context & Constraints
- Dependencies: WP02 and WP04 complete.
- Command: `spec-kitty implement WP05 --base WP02`
- Merge flow must remain human-reviewable and reversible.

## Subtasks & Detailed Guidance

### Subtask T023 - Parsers and normalization
- Purpose: Standardize incoming data to canonical model.
- Steps:
  1. Implement parser adapters for YAML/JSON/CSV.
  2. Normalize incoming fields to canonical schema names/types.
- Files: `src/imports/parsers/*.js`, `src/imports/normalize.js`
- Parallel?: No.

### Subtask T024 - Matching and duplicate detection
- Purpose: Identify record identity and ambiguity safely.
- Steps:
  1. Implement key matching strategy by account IDs + fallback heuristics.
  2. Emit confidence for ambiguous matches.
- Files: `src/imports/match-records.js`
- Parallel?: No.

### Subtask T025 - Diff generator
- Purpose: Show user-readable changes before apply.
- Steps:
  1. Implement field-level diff model with old/new/source/confidence.
  2. Generate compact and detailed diff views.
- Files: `src/imports/diff.js`, `src/ui/import-diff-view.js`
- Parallel?: No.

### Subtask T026 - Approval and merge applicator
- Purpose: Ensure user control over update commits.
- Steps:
  1. Add explicit approve/reject gate.
  2. Apply only approved field changes; leave unrelated fields intact.
- Files: `src/imports/apply-merge.js`, `src/ui/import-approval.js`
- Parallel?: No.

### Subtask T027 - Provenance and snapshot enforcement
- Purpose: Preserve auditability and rollback safety.
- Steps:
  1. Capture pre-apply snapshot automatically.
  2. Write provenance entries for each applied field mutation.
- Files: `src/imports/provenance.js`, `src/state/snapshot-service.js`
- Parallel?: No.

### Subtask T028 - Import regression tests
- Purpose: Prevent data-loss regressions.
- Steps:
  1. Add malformed-input tests.
  2. Add conflict resolution tests and no-silent-overwrite assertions.
- Files: `tests/regression/import/**/*.test.js`, `tests/fixtures/import/**`
- Parallel?: No.

## Test Strategy
- Run parser tests across YAML/JSON/CSV matrix.
- Verify every apply action creates a snapshot and provenance records.

## Risks & Mitigations
- Risk: False match updates wrong account.
- Mitigation: mark low-confidence matches as manual resolution required.

## Review Guidance
- Validate full lifecycle parse->validate->normalize->match->diff->approve->snapshot->apply.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
