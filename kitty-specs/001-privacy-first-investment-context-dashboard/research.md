# Research Decisions: Privacy-First Investment Context Dashboard

## Decision 1: Local-first storage with layered persistence
- Decision: Use browser-local storage defaults (`localStorage` for lightweight settings, IndexedDB for canonical profile/snapshots/scenarios).
- Rationale: Meets privacy-first requirement, works on GitHub Pages, and keeps users in control by default.
- Alternatives considered:
  - Server-side primary database: rejected for MVP due to privacy burden, hosting complexity, and user lock-in risk.
  - File-only persistence: rejected as sole mode due to poor UX for frequent edits and higher risk of user error.

## Decision 2: Deterministic calculation engine boundaries
- Decision: Financial rules implemented as pure JavaScript modules with explicit input/output contracts and no LLM rule execution path.
- Rationale: Ensures reproducibility, testability, and auditability for tax/account/benefit logic.
- Alternatives considered:
  - Prompt-only reasoning: rejected because it is non-deterministic and non-auditable.
  - Embedded DSL early in MVP: deferred to reduce complexity.

## Decision 3: Scenario modeling approach
- Decision: Baseline deterministic projection plus sensitivity matrix and optional bounded Monte Carlo mode.
- Rationale: Provides useful uncertainty exploration without implying predictive certainty.
- Alternatives considered:
  - Deterministic only: rejected because it under-represents uncertainty.
  - Full stochastic engine in MVP: deferred due to complexity and calibration risk.

## Decision 4: Import and merge safety contract
- Decision: Enforce parse -> validate -> normalize -> match -> diff preview -> user approval -> snapshot -> apply pipeline for YAML/JSON/CSV.
- Rationale: Prevents silent data loss and preserves trust.
- Alternatives considered:
  - Direct overwrite import: rejected due to integrity and audit risks.

## Decision 5: Sustainability and climate metric policy
- Decision: Use transparent component metrics with evidence/source metadata and availability states (`measured`, `modeled`, `unavailable`).
- Rationale: Avoids greenwashing and aligns with explicit assumptions/warnings requirement.
- Alternatives considered:
  - Single blended ESG score: rejected as opaque.

## Decision 6: GitHub Actions operating boundary
- Decision: Use Actions for CI validation, regression tests, static build deploy, and public dataset refresh jobs; never default to storing private household data.
- Rationale: Supports open reproducibility while preserving user privacy.
- Alternatives considered:
  - Full cloud pipeline as default: rejected for MVP due to privacy and complexity.

## Decision 7: Rule and dataset update process
- Decision: Keep tax/benefit/public datasets as versioned data files under `data/public/*` with changelog and checksum verification in CI.
- Rationale: Makes assumptions inspectable and changes reviewable.
- Alternatives considered:
  - Hardcoded constants in engine logic: rejected due to maintainability and audit risks.

## Decision 8: LLM role contract
- Decision: LLM limited to intake prompts, missing-data detection, scenario draft generation, explanation text, and report narration from deterministic outputs.
- Rationale: Keeps explainability while preventing fabricated rule logic.
- Alternatives considered:
  - Autonomous recommendation agent: rejected as high-risk and misaligned with product principles.
