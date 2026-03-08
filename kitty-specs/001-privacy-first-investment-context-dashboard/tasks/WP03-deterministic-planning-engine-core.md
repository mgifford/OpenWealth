---
work_package_id: WP03
title: Deterministic Planning Engine Core
lane: completed
dependencies: [WP02]
subtasks:
- T012
- T013
- T014
- T015
- T016
- T017
phase: Phase 2 - Core Modeling
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
- timestamp: '2026-03-08T21:52:02Z'
  lane: completed
  agent: GPT-5.3-Codex
  shell_pid: ''
  action: Implemented deterministic engine core modules, benefit timing, strategies, sensitivity/simulation, and passing regression coverage.
requirement_refs:
- FR-004
- FR-005
- FR-012
- FR-013
- FR-020
- FR-021
- FR-022
---

# Work Package Prompt: WP03 - Deterministic Planning Engine Core

## Objectives & Success Criteria
- Implement deterministic financial model pipeline for core Canadian pathways.
- Support retirement age, CPP/OAS timing, and withdrawal strategy comparisons.
- Produce repeatable outputs under fixed assumptions and seeds.

## Context & Constraints
- Dependencies: WP02 complete.
- Command: `spec-kitty implement WP03 --base WP02`
- No LLM-generated logic inside rules engine.

## Subtasks & Detailed Guidance

### Subtask T012 - Account rule modules
- Purpose: Encode account mechanics per account type.
- Steps:
  1. Implement contribution and withdrawal handlers for TFSA/RRSP/FHSA/RESP/non-registered.
  2. Keep rule data separate from computation logic.
- Files: `src/engine/accounts/*.js`, `data/public/tax/**`
- Parallel?: No.

### Subtask T013 - CPP/OAS timing logic
- Purpose: Enable scenario comparisons for public benefit timing.
- Steps:
  1. Add CPP start-age adjustment logic.
  2. Add OAS timing assumptions with explicit output annotation.
- Files: `src/engine/benefits/cpp.js`, `src/engine/benefits/oas.js`, `data/public/benefits/**`
- Parallel?: No.

### Subtask T014 - Cashflow projection pipeline
- Purpose: Compute annual projections across accumulation/decumulation phases.
- Steps:
  1. Implement yearly projection graph.
  2. Integrate inflation and return assumptions from scenario context.
- Files: `src/engine/scenarios/project-cashflow.js`
- Parallel?: No.

### Subtask T015 - Withdrawal strategy variants
- Purpose: Compare TFSA-first, RRSP-first, and blended approaches.
- Steps:
  1. Implement strategy interface and planners.
  2. Emit comparable metrics and tax-impact summaries.
- Files: `src/engine/scenarios/withdrawal-strategies/*.js`
- Parallel?: No.

### Subtask T016 - Sensitivity and bounded simulation
- Purpose: Capture uncertainty without overstating certainty.
- Steps:
  1. Implement deterministic sensitivity matrix runner.
  2. Add bounded simulation mode with explicit seed and warning labels.
- Files: `src/engine/scenarios/sensitivity.js`, `src/engine/scenarios/simulation.js`
- Parallel?: No.

### Subtask T017 - Engine regression tests
- Purpose: Prevent silent logic drift.
- Steps:
  1. Add fixture-based deterministic snapshots for all primary strategies.
  2. Add benefit timing and edge-case tests.
- Files: `tests/regression/engine/**/*.test.js`, `tests/fixtures/engine/**`
- Parallel?: No.

## Test Strategy
- Run `npm run test:unit` and `npm run test:regression`.
- Ensure repeatability check passes with same inputs and seed.

## Risks & Mitigations
- Risk: Rule assumptions become implicit.
- Mitigation: Emit assumptions block in every scenario result object.

## Review Guidance
- Confirm no hidden randomness in deterministic outputs.
- Confirm FR-012/013/020/021/022 coverage in tests.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
- 2026-03-08T21:52:02Z - GPT-5.3-Codex - lane=completed - Added Canadian account-rule handlers, CPP/OAS timing calculations, annual projection pipeline, TFSA-first/RRSP-first/blended strategy planner, deterministic sensitivity matrix, seeded bounded simulation, and regression fixtures/tests.
