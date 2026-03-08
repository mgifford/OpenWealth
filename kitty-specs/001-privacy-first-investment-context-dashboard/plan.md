# Implementation Plan: Privacy-First Investment Context Dashboard

**Branch**: `main` | **Date**: 2026-03-08 | **Spec**: `kitty-specs/001-privacy-first-investment-context-dashboard/spec.md`
**Input**: Feature specification from `kitty-specs/001-privacy-first-investment-context-dashboard/spec.md`

## Summary

Build a production-grade, open Canadian planning application that is planning-first (not trading-first), local-first by default, and transparent about assumptions. MVP includes deterministic scenario modeling for Canadian account pathways (TFSA, RRSP, FHSA, RESP, non-registered), CPP/OAS timing comparisons, values-aligned sustainability context by default, and downloadable YAML/HTML outputs.

Implementation approach: vanilla JavaScript ES modules with a deterministic rules engine, schema-first data contracts, inspectable import-and-merge workflow, offline-readable reports, and optional GitHub Actions for public dataset refresh and validation.

## Technical Context

**Language/Version**: JavaScript (ES2023), JSON Schema Draft 2020-12, YAML 1.2  
**Primary Dependencies**: Minimal runtime dependencies, Ajv for schema validation, Day.js/date-fns equivalent for date handling, lightweight charting library for report visuals  
**Storage**: Browser-local storage default (`localStorage` for settings + IndexedDB for canonical state/snapshots), user-managed YAML/JSON/CSV files, optional private Git sync for power users  
**Testing**: Vitest or Jest for unit/regression, schema validation tests, fixture-based import/report tests, contract checks for deterministic outputs  
**Target Platform**: Static web app on GitHub Pages, optional local dev server, GitHub Actions for CI/data-refresh automation  
**Project Type**: Single web application with layered engine/schema/import/report modules  
**Performance Goals**: Typical scenario run under 2 seconds for one household with <=50 accounts and <=20 scenarios; report generation under 5 seconds for standard bundle  
**Constraints**: Deterministic financial logic, no hidden LLM rules, no silent data overwrite, privacy-first defaults, inspectable assumptions in every meaningful output  
**Scale/Scope**: MVP single-household workspace, 10-20 comparable scenarios per run, broad Canadian planning coverage with modular extension points for additional benefit/account rules

**Engineering Alignment**:
- Local-first default with explicit export/import and optional GitHub-integrated mode for technical users.
- Deterministic rules engine as the sole source of financial calculations.
- LLM usage constrained to intake/explanation/scenario scaffolding with structured payload contracts.
- Sustainability and climate context included by default in scenario outputs with transparent metric provenance.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file status: not found at `/.kittify/memory/constitution.md` (gate marked as skipped by absence).
- Gate 1: Deterministic logic separated from LLM prompts -> PASS.
- Gate 2: Transparent assumptions and uncertainty surfaced -> PASS.
- Gate 3: User data portability and privacy-first defaults -> PASS.
- Gate 4: Sustainable/ethical support as first-class feature -> PASS.
- Gate 5: Import/merge safety (validate, diff, approve, snapshot) -> PASS.

## Project Structure

### Documentation (this feature)

```
kitty-specs/001-privacy-first-investment-context-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md             # Produced later by /spec-kitty.tasks
```

### Source Code (repository root)
```
src/
├── ui/
├── components/
├── engine/
│   ├── accounts/
│   ├── benefits/
│   ├── taxes/
│   ├── scenarios/
│   └── sustainability/
├── schemas/
├── imports/
├── reports/
└── llm/

tests/
├── fixtures/
├── regression/
├── schema/
└── unit/

data/public/
├── tax/
├── benefits/
├── market/
└── climate/

examples/
├── households/
└── scenarios/

.github/workflows/
```

**Structure Decision**: Use a single web project with strict layer separation (`src/ui`, `src/engine`, `src/schemas`, `src/imports`, `src/reports`) to preserve determinism, testability, and low dependency complexity.

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Phase 0 Research Plan

- Produce `research.md` with explicit decisions for:
  - Canadian rules/dataset governance approach and update cadence.
  - Deterministic simulation approach (base projections + bounded Monte Carlo/sensitivity).
  - Local-first storage model and export/snapshot policy.
  - Sustainability/climate metric transparency and evidence quality strategy.
  - GitHub Actions boundaries for public data automation only.

## Phase 1 Design Plan

- Produce `data-model.md` with canonical entities, required/optional fields, merge rules, versioning strategy, and validation constraints.
- Produce `contracts/planning-api.openapi.yaml` describing local-app service contracts for validation, simulation, import preview/apply, and report generation.
- Produce `quickstart.md` for setup, sample data run, scenario comparison, import preview, and report export verification.
- Agent context update script is not available in generated template; manual context alignment was applied via `AGENTS.md` and spec artifacts.