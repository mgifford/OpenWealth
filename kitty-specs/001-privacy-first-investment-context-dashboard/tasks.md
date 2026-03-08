# Work Packages: Privacy-First Investment Context Dashboard

**Inputs**: Design documents from `/kitty-specs/001-privacy-first-investment-context-dashboard/`
**Prerequisites**: `plan.md` (required), `spec.md` (user stories), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Include explicit schema, unit, regression, import, report, and contract tests because this feature requires deterministic financial logic and non-regression safety.

**Organization**: Fine-grained subtasks (`Txxx`) roll up into work packages (`WPxx`). Each work package is independently deliverable and testable.

**Prompt Files**: Each work package references a matching prompt file in `/tasks/`.

---

## Work Package WP01: Foundation Scaffold And Quality Gates (Priority: P0)

**Goal**: Establish repository skeleton, deterministic coding guardrails, and baseline developer workflow.
**Independent Test**: Project boots locally, schema test command works, and baseline CI checks pass on a no-op commit.
**Prompt**: `/tasks/WP01-foundation-scaffold-and-quality-gates.md`
**Requirements Refs**: FR-008, FR-009, FR-030
**Estimated prompt size**: ~320 lines

### Included Subtasks
- [x] T001 Create source/test/data directory skeleton aligned to plan structure.
- [x] T002 Add package scripts for lint, schema-test, unit-test, regression-test, and build.
- [x] T003 [P] Configure formatter/linter with deterministic style rules and no hidden transpilation assumptions.
- [x] T004 [P] Add baseline CI workflow for install, lint, schema validation, and unit smoke.
- [x] T005 Document local-first/privacy-first development constraints in contributor docs.

### Implementation Notes
- Keep dependencies minimal and inspectable.
- Prefer plain ES modules and browser-native APIs.

### Parallel Opportunities
- T003 and T004 can run in parallel after T001/T002.

### Dependencies
- None.

### Risks & Mitigations
- Risk: Tooling creep introduces unnecessary complexity.
- Mitigation: Enforce dependency review in PR checklist.

---

## Work Package WP02: Canonical Schemas And Validation Layer (Priority: P0)

**Goal**: Implement versioned canonical schemas for household, accounts, scenarios, sustainability, provenance, snapshots, and report manifest.
**Independent Test**: Valid fixtures pass, invalid fixtures fail with actionable validation errors.
**Prompt**: `/tasks/WP02-canonical-schemas-and-validation-layer.md`
**Requirements Refs**: FR-016, FR-017, FR-018, FR-019, FR-024, FR-025
**Estimated prompt size**: ~380 lines

### Included Subtasks
- [x] T006 Define household/person/income/goal schemas with required-vs-optional fields and versioning.
- [x] T007 Define account/liability schemas for Canadian account set and debt types.
- [x] T008 Define scenario-override schema with patch semantics and guardrails.
- [x] T009 Define sustainability/climate metric schemas including availability states.
- [x] T010 Define provenance, snapshot, and report-manifest schemas.
- [x] T011 [P] Implement schema validation module and fixture-based schema tests.

### Implementation Notes
- Keep schema modules decoupled from engine implementation.
- Include constraints for age ranges, money fields, and currency handling.

### Parallel Opportunities
- T009 and T010 can proceed in parallel with T006-T008 once naming conventions are fixed.

### Dependencies
- Depends on WP01.

### Risks & Mitigations
- Risk: Schema churn destabilizes downstream modules.
- Mitigation: Lock semantic versions and add compatibility notes.

---

## Work Package WP03: Deterministic Planning Engine Core (Priority: P1) 🎯 MVP

**Goal**: Build deterministic projection engine for Canadian account pathways, withdrawal logic, and benefit timing scenarios.
**Independent Test**: Given fixed fixtures and assumptions, repeated runs produce identical scenario outputs.
**Prompt**: `/tasks/WP03-deterministic-planning-engine-core.md`
**Requirements Refs**: FR-004, FR-005, FR-012, FR-013, FR-020, FR-021, FR-022
**Estimated prompt size**: ~460 lines

### Included Subtasks
- [x] T012 Implement account contribution/withdrawal rule modules (TFSA, RRSP, FHSA, RESP, non-registered).
- [x] T013 Implement CPP/OAS timing scenario logic with explicit assumptions output.
- [x] T014 Implement retirement cashflow projection pipeline with inflation and return assumptions.
- [x] T015 Implement withdrawal strategy variants (TFSA-first, RRSP-first, blended).
- [x] T016 Implement sensitivity matrix and bounded scenario-distribution simulation mode.
- [x] T017 Add deterministic regression tests for core engine pathways.

### Implementation Notes
- Avoid hidden randomness in deterministic path.
- If stochastic mode exists, seed control must be explicit and reproducible.

### Parallel Opportunities
- T012 and T013 can be parallelized after shared data contracts are finalized.

### Dependencies
- Depends on WP02.

### Risks & Mitigations
- Risk: Rules ambiguity causes inconsistent outputs.
- Mitigation: Encode assumptions and source references in every run artifact.

---

## Work Package WP04: Local Persistence, Snapshots, And Session State (Priority: P1) 🎯 MVP

**Goal**: Implement local-first persistence model with canonical state, draft state, and immutable snapshots.
**Independent Test**: User data survives refresh/restart, and pre-merge snapshots can be listed and restored.
**Prompt**: `/tasks/WP04-local-persistence-snapshots-and-session-state.md`
**Requirements Refs**: FR-010, FR-011, FR-015, FR-016, FR-024
**Estimated prompt size**: ~340 lines

### Included Subtasks
- [x] T018 Implement storage adapters (`localStorage` settings + IndexedDB canonical/snapshot stores).
- [x] T019 Implement state repository for household/scenario/draft lifecycle management.
- [x] T020 Implement snapshot creation/retrieval/rollback primitives.
- [x] T021 [P] Implement migration/version-upgrade handlers for persisted schemas.
- [x] T022 Add persistence integration tests for refresh/reload/rollback behavior.

### Implementation Notes
- Keep storage layer abstract to allow optional power-user Git sync later.

### Parallel Opportunities
- T021 can run in parallel with T020 after schema versioning is stable.

### Dependencies
- Depends on WP02.

### Risks & Mitigations
- Risk: Corrupt local records break startup.
- Mitigation: Add startup validator with recovery prompts.

---

## Work Package WP05: Import Preview, Diff, Approval, And Merge (Priority: P1) 🎯 MVP

**Goal**: Deliver safe user-controlled updates for YAML/JSON/CSV with diff preview, explicit approval, and provenance capture.
**Independent Test**: Import never silently overwrites unrelated fields; every apply operation creates snapshot + provenance entries.
**Prompt**: `/tasks/WP05-import-preview-diff-approval-and-merge.md`
**Requirements Refs**: FR-023, FR-024, FR-009, FR-016, FR-018
**Estimated prompt size**: ~470 lines

### Included Subtasks
- [x] T023 Implement YAML/JSON/CSV parsers and normalization pipeline.
- [x] T024 Implement record matching and duplicate detection strategy.
- [x] T025 Implement structured diff generator (human-readable + machine-readable forms).
- [x] T026 Implement approval gate and merge applicator with non-destructive semantics.
- [x] T027 Implement field-level provenance recording and snapshot-before-apply enforcement.
- [x] T028 Add parser/merge regression tests covering conflicting and malformed imports.

### Implementation Notes
- Keep a strict import lifecycle: parse -> validate -> normalize -> match -> preview -> approve -> snapshot -> apply.

### Parallel Opportunities
- T024 and T025 can run in parallel after normalized model contract is finalized.

### Dependencies
- Depends on WP02, WP04.

### Risks & Mitigations
- Risk: Incorrect matching merges wrong accounts.
- Mitigation: Confidence scoring + mandatory user review for ambiguous matches.

---

## Work Package WP06: Onboarding, Household Capture, And Scenario UX (Priority: P1) 🎯 MVP

**Goal**: Build primary UI flows for household setup, account entry, scenario creation, and side-by-side comparison.
**Independent Test**: New user can complete onboarding, define scenarios, run model, and view comparison without manual file edits.
**Prompt**: `/tasks/WP06-onboarding-household-capture-and-scenario-ux.md`
**Requirements Refs**: FR-001, FR-002, FR-003, FR-019, FR-020
**Estimated prompt size**: ~420 lines

### Included Subtasks
- [x] T029 Implement onboarding wizard for household/person/income/account basics.
- [x] T030 Implement account editing flows with required field validation and confidence markers.
- [x] T031 Implement scenario authoring UI for retirement/benefit/withdrawal variants.
- [x] T032 Implement side-by-side scenario comparison views with key outcome deltas.
- [x] T033 [P] Implement empty/error/loading states and assumptions visibility panels.
- [x] T034 Add UI integration tests for main user journeys and failure handling.

### Implementation Notes
- Keep UX concise and transparent; no hidden assumptions.

### Parallel Opportunities
- T033 can proceed in parallel once core view models exist.

### Dependencies
- Depends on WP03, WP04.

### Risks & Mitigations
- Risk: UX hides model caveats.
- Mitigation: mandatory assumption/warning blocks in every scenario result view.

---

## Work Package WP07: Sustainability And Climate Overlay Modules (Priority: P2)

**Goal**: Integrate values-aligned preferences and climate/risk overlays as default scenario context.
**Independent Test**: Scenario outputs include transparent component metrics, data availability states, and evidence references.
**Prompt**: `/tasks/WP07-sustainability-and-climate-overlay-modules.md`
**Requirements Refs**: FR-014, FR-027, FR-028, FR-020
**Estimated prompt size**: ~390 lines

### Included Subtasks
- [ ] T035 Implement sustainability preference model and UI controls.
- [ ] T036 Implement component metric calculators (fossil, carbon, renewable/transition, social/community, controversial sectors).
- [ ] T037 Implement climate overlay scenarios (rapid transition, delayed transition, worsened physical risk).
- [ ] T038 Implement metric provenance and confidence/availability labeling.
- [ ] T039 [P] Implement alternatives panel that shows values-aligned options without recommendation certainty.
- [ ] T040 Add sustainability/climate fixture tests and edge-case validations.

### Implementation Notes
- Never produce a single opaque score; preserve component metric traceability.

### Parallel Opportunities
- T039 can proceed in parallel with T036/T037 after metric output schema is set.

### Dependencies
- Depends on WP03, WP06.

### Risks & Mitigations
- Risk: Greenwashing via misleading labels.
- Mitigation: strict evidence-source display and unavailable-state handling.

---

## Work Package WP08: Report Bundle Generation And Export UX (Priority: P1) 🎯 MVP

**Goal**: Generate portable offline-ready bundle (HTML + YAML + manifest) with assumptions, caveats, and change log.
**Independent Test**: One-click export produces complete bundle with checksum manifest and readable report sections.
**Prompt**: `/tasks/WP08-report-bundle-generation-and-export-ux.md`
**Requirements Refs**: FR-011, FR-025, FR-026, FR-006
**Estimated prompt size**: ~400 lines

### Included Subtasks
- [ ] T041 Implement report assembler for household summary, accounts, scenarios, assumptions, caveats, sustainability/climate.
- [ ] T042 Implement YAML artifact writers (`household.yaml`, `scenario-results.yaml`, `assumptions.yaml`).
- [ ] T043 Implement manifest generator with versions, timestamps, hashes, warnings summary.
- [ ] T044 Implement downloadable bundle packaging and offline-friendly assets.
- [ ] T045 [P] Implement report metadata embedding and non-advisory disclaimers in all relevant sections.
- [ ] T046 Add report generation tests and golden-output fixtures.

### Implementation Notes
- Bundle naming should be deterministic and timestamped.

### Parallel Opportunities
- T045 can proceed in parallel once report section schema is locked.

### Dependencies
- Depends on WP03, WP04, WP06, WP07.

### Risks & Mitigations
- Risk: Incomplete bundle artifacts.
- Mitigation: manifest validation test that fails when required files are missing.

---

## Work Package WP09: LLM Prompt Contracts And Constrained Assistant Flows (Priority: P2)

**Goal**: Provide useful LLM-assisted intake/explanation/prompt-generation while enforcing deterministic-rule boundaries.
**Independent Test**: LLM outputs always include structured payload, missing inputs, assumptions, and confidence notes; rule calculations remain engine-only.
**Prompt**: `/tasks/WP09-llm-prompt-contracts-and-constrained-assistant-flows.md`
**Requirements Refs**: FR-007, FR-029, FR-006
**Estimated prompt size**: ~330 lines

### Included Subtasks
- [ ] T047 Define structured prompt/response contracts for intake, scenario generation, and narrative summary.
- [ ] T048 Implement guardrails that block LLM-authored tax/benefit rule authority.
- [ ] T049 Implement missing-data and confidence-note extraction pipeline.
- [ ] T050 [P] Implement LLM prompt generator UX tied to current scenario outputs.
- [ ] T051 Add contract tests validating required output fields and prohibited claims.

### Implementation Notes
- Treat LLM as assistant layer only; no direct mutation of canonical rules tables.

### Parallel Opportunities
- T050 can run in parallel with contract tests after schema finalization.

### Dependencies
- Depends on WP03, WP06.

### Risks & Mitigations
- Risk: AI outputs imply financial advice certainty.
- Mitigation: mandatory disclaimer injection and response validation filters.

---

## Work Package WP10: GitHub Actions, Public Data Refresh, And Release Hardening (Priority: P2)

**Goal**: Add automation for CI, regression, dataset refresh, preview builds, and release artifact packaging without exposing private user data.
**Independent Test**: Workflows execute on configured triggers, publish expected artifacts, and fail loudly on validation breaks.
**Prompt**: `/tasks/WP10-github-actions-public-data-refresh-and-release-hardening.md`
**Requirements Refs**: FR-030, FR-008, FR-023, FR-025
**Estimated prompt size**: ~360 lines

### Included Subtasks
- [ ] T052 Implement CI workflows for lint/schema/unit/regression checks on PR and main branch.
- [ ] T053 Implement scheduled workflows for public market/climate/rules dataset refresh with checksum and changelog outputs.
- [ ] T054 Implement preview build and Pages deployment workflow.
- [ ] T055 Implement scenario batch-run/report artifact workflow with retention policy and naming rules.
- [ ] T056 [P] Implement workflow failure surfacing, issue annotations, and release packaging automation.
- [ ] T057 Add security/privacy checks for artifact redaction and forbidden private-data paths.

### Implementation Notes
- Keep automation inputs public or synthetic; never default to household private data.

### Parallel Opportunities
- T056 and T057 can proceed in parallel with T052-T055 after workflow skeleton exists.

### Dependencies
- Depends on WP01, WP02, WP08.

### Risks & Mitigations
- Risk: Artifact leakage of sensitive data.
- Mitigation: explicit artifact allowlist + retention caps + redaction checks.

---

## Dependency & Execution Summary

- **Sequence**: WP01 -> WP02 -> WP03/WP04 -> WP05/WP06 -> WP07 -> WP08 -> WP09/WP10.
- **Parallelization**:
  - WP03 and WP04 can proceed in parallel after WP02.
  - WP05 and WP06 can proceed in parallel after dependencies clear.
  - WP09 and WP10 can proceed in parallel near end-state integration.
- **MVP Scope Recommendation**: WP01, WP02, WP03, WP04, WP05, WP06, and WP08.

---

## Subtask Index (Reference)

| Subtask ID | Summary | Work Package | Priority | Parallel? |
|------------|---------|--------------|----------|-----------|
| T001 | Scaffold directories | WP01 | P0 | No |
| T002 | Add scripts/tooling | WP01 | P0 | No |
| T003 | Configure lint/format | WP01 | P0 | Yes |
| T004 | Baseline CI | WP01 | P0 | Yes |
| T005 | Contributor constraints doc | WP01 | P0 | No |
| T006 | Household/person schema | WP02 | P0 | No |
| T007 | Account/liability schema | WP02 | P0 | No |
| T008 | Scenario override schema | WP02 | P0 | No |
| T009 | Sustainability/climate schemas | WP02 | P0 | No |
| T010 | Provenance/snapshot/manifest schemas | WP02 | P0 | No |
| T011 | Schema validator + tests | WP02 | P0 | Yes |
| T012 | Account rule modules | WP03 | P1 | No |
| T013 | CPP/OAS timing logic | WP03 | P1 | No |
| T014 | Cashflow projection pipeline | WP03 | P1 | No |
| T015 | Withdrawal strategy variants | WP03 | P1 | No |
| T016 | Sensitivity + bounded simulation | WP03 | P1 | No |
| T017 | Engine regression tests | WP03 | P1 | No |
| T018 | Storage adapters | WP04 | P1 | No |
| T019 | State repository lifecycle | WP04 | P1 | No |
| T020 | Snapshot/rollback primitives | WP04 | P1 | No |
| T021 | Persistence migrations | WP04 | P1 | Yes |
| T022 | Persistence integration tests | WP04 | P1 | No |
| T023 | Multi-format parsers | WP05 | P1 | No |
| T024 | Matching + duplicate detection | WP05 | P1 | No |
| T025 | Diff generator | WP05 | P1 | No |
| T026 | Approval + merge applicator | WP05 | P1 | No |
| T027 | Provenance + snapshot enforce | WP05 | P1 | No |
| T028 | Import regression tests | WP05 | P1 | No |
| T029 | Onboarding wizard | WP06 | P1 | No |
| T030 | Account editing flows | WP06 | P1 | No |
| T031 | Scenario authoring UI | WP06 | P1 | No |
| T032 | Comparison views | WP06 | P1 | No |
| T033 | Empty/error/loading states | WP06 | P1 | Yes |
| T034 | UI integration tests | WP06 | P1 | No |
| T035 | Sustainability preferences UX | WP07 | P2 | No |
| T036 | Component metric calculators | WP07 | P2 | No |
| T037 | Climate overlay scenarios | WP07 | P2 | No |
| T038 | Provenance/confidence labels | WP07 | P2 | No |
| T039 | Alternatives panel | WP07 | P2 | Yes |
| T040 | Sustainability fixture tests | WP07 | P2 | No |
| T041 | HTML report assembler | WP08 | P1 | No |
| T042 | YAML artifact writers | WP08 | P1 | No |
| T043 | Manifest generator | WP08 | P1 | No |
| T044 | Bundle packaging | WP08 | P1 | No |
| T045 | Metadata + disclaimers | WP08 | P1 | Yes |
| T046 | Report golden tests | WP08 | P1 | No |
| T047 | LLM I/O contracts | WP09 | P2 | No |
| T048 | LLM boundary guardrails | WP09 | P2 | No |
| T049 | Missing-data/confidence extraction | WP09 | P2 | No |
| T050 | Prompt generator UX | WP09 | P2 | Yes |
| T051 | LLM contract tests | WP09 | P2 | No |
| T052 | CI workflows | WP10 | P2 | No |
| T053 | Scheduled public data refresh | WP10 | P2 | No |
| T054 | Preview build + Pages deploy | WP10 | P2 | No |
| T055 | Batch run/report artifacts | WP10 | P2 | No |
| T056 | Failure surfacing + release packaging | WP10 | P2 | Yes |
| T057 | Privacy artifact checks | WP10 | P2 | No |
