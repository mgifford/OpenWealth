---
work_package_id: WP04
title: Local Persistence, Snapshots, And Session State
lane: completed
dependencies: [WP02]
subtasks:
- T018
- T019
- T020
- T021
- T022
phase: Phase 2 - Core State
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
- timestamp: '2026-03-08T21:55:20Z'
  lane: completed
  agent: GPT-5.3-Codex
  shell_pid: ''
  action: Implemented storage adapters, state repositories, snapshot/rollback service, migration handlers, and integration tests.
requirement_refs:
- FR-010
- FR-011
- FR-015
- FR-016
- FR-024
---

# Work Package Prompt: WP04 - Local Persistence, Snapshots, And Session State

## Objectives & Success Criteria
- Implement local-first persistence and recovery-friendly snapshots.
- Support draft state, canonical state, and rollback paths.
- Ensure schema migrations are safe and explicit.

## Context & Constraints
- Dependencies: WP02 complete.
- Command: `spec-kitty implement WP04 --base WP02`
- Default privacy mode must keep user data local unless exported.

## Subtasks & Detailed Guidance

### Subtask T018 - Storage adapters
- Purpose: Separate persistence mechanics from business logic.
- Steps:
  1. Implement settings adapter on `localStorage`.
  2. Implement canonical/snapshot adapter on IndexedDB.
- Files: `src/storage/local-settings.js`, `src/storage/indexeddb-store.js`
- Parallel?: No.

### Subtask T019 - State repository lifecycle
- Purpose: Centralize state read/write/update semantics.
- Steps:
  1. Build repository with load/save/update APIs for household and scenarios.
  2. Enforce immutable IDs and update timestamps.
- Files: `src/state/household-repository.js`, `src/state/scenario-repository.js`
- Parallel?: No.

### Subtask T020 - Snapshot and rollback primitives
- Purpose: Guarantee reversible changes before risky operations.
- Steps:
  1. Add snapshot creation API with reason and hash metadata.
  2. Add rollback/load-by-snapshot APIs.
- Files: `src/state/snapshot-service.js`
- Parallel?: No.

### Subtask T021 - Schema migration handlers
- Purpose: Keep persisted data compatible across versions.
- Steps:
  1. Add migration registry keyed by schema version.
  2. Add startup migration path with non-destructive conversion logs.
- Files: `src/state/migrations/*.js`
- Parallel?: Yes.

### Subtask T022 - Persistence integration tests
- Purpose: Validate reload/restore correctness.
- Steps:
  1. Add tests for refresh persistence and rollback integrity.
  2. Add migration tests using older fixture versions.
- Files: `tests/integration/persistence/**/*.test.js`, `tests/fixtures/persistence/**`
- Parallel?: No.

## Test Strategy
- Run integration suite for persistence flows.
- Verify rollback restores exact prior state hash.

## Risks & Mitigations
- Risk: Migration bug corrupts household data.
- Mitigation: backup snapshot before migration apply and add fallback restore.

## Review Guidance
- Confirm local-first behavior and no network requirement for persistence.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
- 2026-03-08T21:55:20Z - GPT-5.3-Codex - lane=completed - Added `localStorage` settings adapter, IndexedDB/memory canonical store abstraction, household/scenario repositories, deterministic snapshot hashing with rollback, startup migration flow with pre-migration snapshot, and integration tests for persistence + migration integrity.
