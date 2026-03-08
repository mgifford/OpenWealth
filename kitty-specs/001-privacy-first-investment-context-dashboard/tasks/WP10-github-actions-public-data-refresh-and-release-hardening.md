---
work_package_id: WP10
title: GitHub Actions, Public Data Refresh, And Release Hardening
lane: planned
dependencies: [WP01, WP02, WP08]
subtasks:
- T052
- T053
- T054
- T055
- T056
- T057
phase: Phase 5 - Automation
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
- FR-030
- FR-008
- FR-023
- FR-025
---

# Work Package Prompt: WP10 - GitHub Actions, Public Data Refresh, And Release Hardening

## Objectives & Success Criteria
- Automate CI, dataset refresh, preview deploy, and artifact packaging.
- Enforce privacy constraints in automation artifacts/logs.
- Provide reliable failure surfacing and reproducible release outputs.

## Context & Constraints
- Dependencies: WP01, WP02, WP08 complete.
- Command: `spec-kitty implement WP10 --base WP01`
- GitHub Actions must not become private household datastore.

## Subtasks & Detailed Guidance

### Subtask T052 - Core CI workflows
- Purpose: Validate quality on every PR/push.
- Steps:
  1. Add CI workflows for lint, schema, unit, and regression suites.
  2. Add path filters to avoid unnecessary job cost.
- Files: `.github/workflows/ci.yml`
- Parallel?: No.

### Subtask T053 - Scheduled public dataset refresh
- Purpose: Keep public assumptions/rules datasets current.
- Steps:
  1. Add schedule-triggered workflow for market/climate/rule refresh.
  2. Produce checksums and dataset changelog artifact.
- Files: `.github/workflows/data-refresh.yml`, `scripts/data-refresh/**`
- Parallel?: No.

### Subtask T054 - Preview build and Pages deploy
- Purpose: Provide deterministic static deploy path.
- Steps:
  1. Add build + artifact upload for preview environments.
  2. Configure GitHub Pages deploy on approved main changes.
- Files: `.github/workflows/pages-deploy.yml`
- Parallel?: No.

### Subtask T055 - Batch scenario/report artifact workflow
- Purpose: Support reproducible scenario batch runs and report artifacts.
- Steps:
  1. Add workflow dispatch for scenario batch execution using synthetic/public fixtures.
  2. Upload report artifacts with naming and retention policy.
- Files: `.github/workflows/batch-scenarios.yml`
- Parallel?: No.

### Subtask T056 - Failure surfacing and release packaging
- Purpose: Improve operational visibility and release repeatability.
- Steps:
  1. Add workflow summaries and annotations on failure.
  2. Add release packaging workflow with changelog attachment.
- Files: `.github/workflows/release.yml`
- Parallel?: Yes.

### Subtask T057 - Artifact privacy checks
- Purpose: Prevent accidental PII exposure.
- Steps:
  1. Add allowlist/denylist checks for artifact paths.
  2. Fail workflow if private household data patterns detected.
- Files: `scripts/privacy/artifact-guard.js`, `.github/workflows/privacy-guard.yml`
- Parallel?: No.

## Test Strategy
- Dry-run workflows with `workflow_dispatch` and synthetic fixtures.
- Verify failure path annotations and retention settings.

## Risks & Mitigations
- Risk: Private data leakage via artifacts.
- Mitigation: add hard-fail guard and short retention defaults for non-release artifacts.

## Review Guidance
- Confirm trigger conditions, artifact naming, retention, and failure visibility match plan.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
