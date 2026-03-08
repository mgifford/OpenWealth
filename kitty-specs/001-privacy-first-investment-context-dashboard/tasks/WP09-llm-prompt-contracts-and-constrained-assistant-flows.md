---
work_package_id: WP09
title: LLM Prompt Contracts And Constrained Assistant Flows
lane: planned
dependencies: [WP03, WP06]
subtasks:
- T047
- T048
- T049
- T050
- T051
phase: Phase 5 - Assistant Layer
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
- FR-007
- FR-029
- FR-006
---

# Work Package Prompt: WP09 - LLM Prompt Contracts And Constrained Assistant Flows

## Objectives & Success Criteria
- Add LLM assistance for intake/explanation/scenario scaffolding.
- Enforce strict contract boundaries so LLM never acts as financial rules engine.
- Ensure outputs include missing inputs, assumptions, and confidence notes.

## Context & Constraints
- Dependencies: WP03 and WP06 complete.
- Command: `spec-kitty implement WP09 --base WP03`
- No deterministic rule values may originate from LLM output.

## Subtasks & Detailed Guidance

### Subtask T047 - Define LLM I/O contracts
- Purpose: Stabilize machine-readable assistant integration.
- Steps:
  1. Define payload schemas for intake, scenario draft, explanation summary.
  2. Require structured fields for assumptions/missing-inputs/confidence.
- Files: `src/llm/contracts/*.json`, `src/schemas/llm-*.schema.json`
- Parallel?: No.

### Subtask T048 - Guardrails for prohibited authority
- Purpose: Prevent policy violations and fabricated certainty.
- Steps:
  1. Implement output validator rejecting disallowed claims (e.g., tax rule authority).
  2. Add mandatory disclaimer stitching for narrative outputs.
- Files: `src/llm/guardrails.js`, `src/llm/policies.js`
- Parallel?: No.

### Subtask T049 - Missing-data/confidence extraction
- Purpose: Make uncertainty explicit and actionable.
- Steps:
  1. Parse model outputs into standardized missing-data prompts.
  2. Normalize confidence notes for UI/report display.
- Files: `src/llm/extract-missing-data.js`, `src/llm/extract-confidence.js`
- Parallel?: No.

### Subtask T050 - Prompt generator UX
- Purpose: Let users export useful discussion prompts from deterministic outputs.
- Steps:
  1. Build UI action to generate prompt package from current scenario context.
  2. Include assumptions and caveat sections in generated prompt text.
- Files: `src/ui/prompt-generator/**`
- Parallel?: Yes.

### Subtask T051 - Contract and guardrail tests
- Purpose: Prevent regressions in assistant boundaries.
- Steps:
  1. Add tests verifying required output fields are always present.
  2. Add tests confirming prohibited output patterns are blocked.
- Files: `tests/unit/llm/**/*.test.js`, `tests/fixtures/llm/**`
- Parallel?: No.

## Test Strategy
- Run LLM contract tests with deterministic fixture responses.
- Validate blocked output examples for prohibited claims.

## Risks & Mitigations
- Risk: Prompt drift weakens guardrails.
- Mitigation: lock contract schema versions and enforce strict validation.

## Review Guidance
- Confirm LLM integration is optional assistant layer and not a rules authority.

## Activity Log
- 2026-03-08T20:59:34Z - system - lane=planned - Prompt created.
