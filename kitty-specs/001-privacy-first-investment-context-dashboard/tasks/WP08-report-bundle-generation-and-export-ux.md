---
work_package_id: WP08
title: Report Bundle Generation And Export UX
lane: planned
dependencies: [WP03, WP04, WP06, WP07]
subtasks:
- T041
- T042
- T043
- T044
- T045
- T046
phase: Phase 4 - Reporting
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
- FR-011
- FR-025
- FR-026
- FR-006
---

# Work Package Prompt: WP08 - Report Bundle Generation And Export UX

## Objectives & Success Criteria
- Produce downloadable offline bundle with required artifacts.
- Ensure HTML report contains assumptions, caveats, sustainability/climate, and change log.
- Emit verifiable manifest with hashes and metadata.

## Context & Constraints
- Dependencies: WP03, WP04, WP06, WP07 complete.
- Command: `spec-kitty implement WP08 --base WP03`
- Required artifacts: HTML + YAMLs + manifest.

## Subtasks & Detailed Guidance

### Subtask T041 - Report section assembler
- Purpose: Build report content pipeline from scenario outputs.
- Steps:
  1. Implement section builders for profile, accounts, scenarios, assumptions, caveats, sustainability/climate.
  2. Include recommended next questions and change log sections.
- Files: `src/reports/sections/**/*.js`
- Parallel?: No.

### Subtask T042 - YAML export writers
- Purpose: Generate portable data artifacts.
- Steps:
  1. Implement writers for `household.yaml`, `scenario-results.yaml`, `assumptions.yaml`.
  2. Ensure schema_version fields are included.
- Files: `src/reports/export-yaml.js`
- Parallel?: No.

### Subtask T043 - Manifest generator
- Purpose: Make bundles auditable and reproducible.
- Steps:
  1. Generate manifest with artifact list, checksums, generation timestamp, schema versions, warnings.
  2. Validate required artifact presence before finalize.
- Files: `src/reports/manifest.js`
- Parallel?: No.

### Subtask T044 - Bundle packaging and download flow
- Purpose: Deliver one-click user-owned bundle.
- Steps:
  1. Package report artifacts as downloadable bundle.
  2. Ensure naming convention includes feature/date/version.
- Files: `src/reports/package-bundle.js`, `src/ui/export/**`
- Parallel?: No.

### Subtask T045 - Metadata embedding and disclaimers
- Purpose: Preserve machine-readable context and legal clarity.
- Steps:
  1. Embed report metadata where appropriate.
  2. Include non-advisory disclaimer in overview and recommendation sections.
- Files: `src/reports/templates/report.html`, `src/reports/sections/disclaimer.js`
- Parallel?: Yes.

### Subtask T046 - Report tests and golden fixtures
- Purpose: Prevent output regressions.
- Steps:
  1. Add golden fixtures for HTML and YAML outputs.
  2. Add manifest checksum validation tests.
- Files: `tests/regression/reports/**/*.test.js`, `tests/fixtures/reports/**`
- Parallel?: No.

## Test Strategy
- Generate bundle from reference fixture and assert required artifacts.
- Compare generated report against golden baseline with allowed dynamic fields masked.

## Risks & Mitigations
- Risk: Bundle incompatibility across browsers.
- Mitigation: use browser-safe packaging APIs and fallback save path.

## Review Guidance
- Confirm bundle completeness and offline readability.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
