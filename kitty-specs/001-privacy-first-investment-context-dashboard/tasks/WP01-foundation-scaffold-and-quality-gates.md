---
work_package_id: WP01
title: Foundation Scaffold And Quality Gates
lane: planned
dependencies: []
subtasks:
- T001
- T002
- T003
- T004
- T005
phase: Phase 1 - Setup
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
- FR-008
- FR-009
- FR-030
---

# Work Package Prompt: WP01 - Foundation Scaffold And Quality Gates

## Objectives & Success Criteria
- Establish baseline project structure and scripts for deterministic, test-first development.
- Ensure local commands and CI smoke checks work without feature code.
- Preserve low-dependency, vanilla-JS architecture constraints.

## Context & Constraints
- Spec: `kitty-specs/001-privacy-first-investment-context-dashboard/spec.md`
- Plan: `kitty-specs/001-privacy-first-investment-context-dashboard/plan.md`
- Tasks index: `kitty-specs/001-privacy-first-investment-context-dashboard/tasks.md`
- Command: `spec-kitty implement WP01`

## Subtasks & Detailed Guidance

### Subtask T001 - Scaffold repository structure
- Purpose: Create predictable module boundaries for UI, engine, schemas, imports, reports, and tests.
- Steps:
  1. Create directories from plan structure under `src/`, `tests/`, `data/public/`, and `examples/`.
  2. Add minimal placeholder index files where required to avoid empty-module ambiguity.
- Files: `src/**`, `tests/**`, `data/public/**`, `examples/**`
- Parallel?: No.

### Subtask T002 - Add project scripts and baseline package metadata
- Purpose: Provide deterministic command surface for contributors and CI.
- Steps:
  1. Define scripts for `lint`, `test:schema`, `test:unit`, `test:regression`, `build`, `dev`.
  2. Ensure script names align with `quickstart.md` expectations.
- Files: `package.json`, `README.md`
- Parallel?: No.

### Subtask T003 - Configure linting/formatting
- Purpose: Keep code style consistent and review-friendly.
- Steps:
  1. Add linter and formatter configs for ES modules.
  2. Keep rule set strict enough to prevent hidden globals and unused logic.
- Files: `.eslintrc.*`, `.prettierrc*`, `.editorconfig`
- Parallel?: Yes.

### Subtask T004 - Add baseline CI workflow
- Purpose: Fail fast on formatting/schema/unit regressions.
- Steps:
  1. Add workflow triggered on pull requests and pushes to `main`.
  2. Run install + lint + schema smoke + unit smoke.
- Files: `.github/workflows/ci.yml`
- Parallel?: Yes.

### Subtask T005 - Document development constraints
- Purpose: Encode privacy-first and deterministic boundaries for implementers.
- Steps:
  1. Add contributor guidance on no hidden LLM logic and no silent data overwrite.
  2. Add rule that private household data fixtures must be synthetic only.
- Files: `CONTRIBUTING.md`, `docs/development-constraints.md`
- Parallel?: No.

## Test Strategy
- Run `npm run lint`.
- Run `npm run test:schema` (placeholder smoke acceptable for this WP).
- Validate CI workflow executes on branch push.

## Risks & Mitigations
- Risk: Over-tooling introduces framework drift.
- Mitigation: Keep dependencies minimal and document each dependency purpose.

## Review Guidance
- Confirm structure matches plan.
- Confirm scripts and CI are runnable and deterministic.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
