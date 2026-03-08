---
work_package_id: WP02
title: Canonical Schemas And Validation Layer
lane: planned
dependencies: [WP01]
subtasks:
- T006
- T007
- T008
- T009
- T010
- T011
phase: Phase 1 - Foundation
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
- FR-016
- FR-017
- FR-018
- FR-019
- FR-024
- FR-025
---

# Work Package Prompt: WP02 - Canonical Schemas And Validation Layer

## Objectives & Success Criteria
- Deliver versioned schemas for all core entities.
- Enforce strict validation and actionable error reporting.
- Provide fixture-based schema tests for valid/invalid documents.

## Context & Constraints
- Dependencies: WP01 complete.
- Command: `spec-kitty implement WP02 --base WP01`
- Keep schema evolution forward-compatible via explicit `schema_version`.

## Subtasks & Detailed Guidance

### Subtask T006 - Household/person/income/goal schemas
- Purpose: Define canonical household profile structure.
- Steps:
  1. Create JSON Schema/YAML contracts for household and nested entities.
  2. Mark required vs optional fields according to `data-model.md`.
- Files: `src/schemas/household.schema.json`, `src/schemas/person.schema.json`, `src/schemas/income.schema.json`, `src/schemas/goal.schema.json`
- Parallel?: No.

### Subtask T007 - Account and liability schemas
- Purpose: Support required Canadian account/debt types with audit fields.
- Steps:
  1. Add enum-restricted account types.
  2. Include contribution/withdrawal, cost-base, confidence, and verification fields.
- Files: `src/schemas/account.schema.json`, `src/schemas/liability.schema.json`
- Parallel?: No.

### Subtask T008 - Scenario override schema
- Purpose: Enable non-destructive scenario patching.
- Steps:
  1. Define scenario file structure with base household reference.
  2. Constrain overrides to known schema paths.
- Files: `src/schemas/scenario-override.schema.json`
- Parallel?: No.

### Subtask T009 - Sustainability and climate schemas
- Purpose: Represent preference profiles and metric availability states.
- Steps:
  1. Define preference schema with exclusions/priorities/tradeoff fields.
  2. Define climate metric schema with `measured|modeled|unavailable` states.
- Files: `src/schemas/sustainability.schema.json`, `src/schemas/climate-metrics.schema.json`
- Parallel?: No.

### Subtask T010 - Provenance/snapshot/manifest schemas
- Purpose: Guarantee traceability and portable bundle metadata.
- Steps:
  1. Define provenance record schema.
  2. Define snapshot and report manifest schemas with checksums and warnings.
- Files: `src/schemas/provenance.schema.json`, `src/schemas/snapshot.schema.json`, `src/schemas/report-manifest.schema.json`
- Parallel?: No.

### Subtask T011 - Validation module and schema tests
- Purpose: Centralize validation behavior and lock schema quality.
- Steps:
  1. Implement validator adapter (Ajv or equivalent) with consistent error formatting.
  2. Add fixture sets for positive/negative test cases.
- Files: `src/schemas/validate.js`, `tests/schema/**/*.test.js`, `tests/fixtures/schemas/**`
- Parallel?: Yes.

## Test Strategy
- Run `npm run test:schema` and ensure failures include path+reason.
- Add snapshot tests for validation error shape stability.

## Risks & Mitigations
- Risk: Schema strictness blocks legitimate migration paths.
- Mitigation: Add explicit compatibility notes and migration handlers in WP04.

## Review Guidance
- Verify requirement coverage for FR-016..FR-019 and manifest/provenance needs.
- Verify enums and numeric constraints match data model.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
