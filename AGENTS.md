# AGENTS.md

## Purpose

This repository contains an open, Canadian, scenario-based financial planning system with values-aligned investing, sustainability reporting, and portable user-owned outputs.

## Current Planning Baseline (Feature 001)

Unless explicitly superseded by a later approved spec, align implementation and reviews with these MVP decisions:

- Default persistence is browser-local storage.
- Users can export portable outputs, including at minimum YAML and HTML reports.
- MVP includes Canadian planning coverage for TFSA, RRSP, FHSA, RESP, non-registered accounts, CPP timing, and OAS timing.
- Sustainability and values-aligned context appears by default in scenario outputs.
- MVP supports a single household profile per local workspace.

Agents working in this repository must preserve four priorities:

1. Deterministic financial logic over free-form AI reasoning.
2. Transparent assumptions over polished but unverifiable outputs.
3. User data portability and privacy over lock-in.
4. Sustainable and ethical investment support as a first-class feature, not a cosmetic add-on.

## Technology Baseline

This project intentionally uses vanilla JavaScript with minimal dependencies.

Agents must respect the following constraints:

- Prefer plain JavaScript (ES modules) over frameworks.
- Avoid React, Angular, Vue, or similar frameworks unless explicitly approved.
- Avoid heavy build systems unless there is a clear technical justification.
- Prefer browser-native capabilities such as:
  - Web Components
  - Fetch API
  - IndexedDB
  - `localStorage`
  - Native HTML templates
- Keep the codebase understandable to developers who know standard JavaScript but not specialized frameworks.

The goal is long-term maintainability, transparency, and portability.

## Product Scope

The product is a planning tool, not a brokerage, not a trading platform, and not a general chatbot.

Core supported domains include:

- Canadian household financial planning
- TFSA, RRSP, FHSA, RESP, taxable accounts, cash, debts
- Retirement scenario planning
- CPP and OAS timing analysis
- Downloadable HTML and YAML reports
- User-imported balance and assumption updates
- Sustainability and climate-impact overlays
- Optional GitHub and GitHub Actions automation for public rules, validation, batch runs, and report generation

Out of scope unless explicitly added:

- Real-time trading
- Brokerage execution
- High-frequency market monitoring
- Hidden or black-box financial recommendations
- Opaque ESG scoring without underlying evidence

## Non-Negotiable Design Rules

### 1. The LLM Is Not The Rules Engine

Use the LLM for:

- Guided intake
- Missing-data prompts
- Scenario generation
- Explanation of model outputs
- Report narration
- Conversion of user intent into structured files

Do not use the LLM as the source of truth for:

- Tax rules
- Contribution limits
- Benefit calculations
- Withdrawal formulas
- Sustainability metrics
- Financial recommendations without deterministic model output

### 2. Never Hide Assumptions

Every meaningful output must expose:

- Assumptions used
- Inferred values
- Estimated values
- Missing data
- Warnings
- Confidence or provenance where relevant

### 3. Do Not Silently Overwrite User Data

Any import or update flow must:

- Validate schema
- Preview changes
- Show a diff
- Require approval before merge
- Preserve a snapshot before applying updates

### 4. Prefer Open, Inspectable Formats

Default data and output formats:

- YAML for canonical records and snapshots
- JSON where machine interchange is more practical
- HTML for human-readable reports
- CSV for import/export compatibility where needed

### 5. Privacy Is A Core Requirement

Treat user financial data as sensitive.

Do not:

- Assume GitHub is the default datastore for household data
- Commit personal financial files to public repositories
- Retain unnecessary personally identifiable information
- Upload private reports to third-party services without explicit user action

## Repository Architecture Expectations

Agents should keep a clean separation between the following layers.

### UI Layer (Vanilla JS)

Responsible for:

- Forms
- Onboarding
- Scenario comparison interface
- Import workflow
- Report viewing and downloads

Implementation guidance:

- Use semantic HTML.
- Use modular ES modules.
- Prefer small reusable functions instead of large component frameworks.
- Where reusable UI elements are needed, prefer Web Components.

### Schema Layer

Responsible for:

- Canonical household schema
- Account schema
- Scenario schema
- Sustainability preference schema
- Report manifest schema

All schemas must be versioned and validated.

### Rules Engine Layer

Responsible for deterministic calculations such as:

- Cashflow projections
- Account contribution and withdrawal handling
- Retirement scenario modeling
- Tax-aware comparisons
- CPP and OAS timing logic
- Inflation and return assumptions
- Sustainability metric aggregation

Rules must be implemented in pure JavaScript functions that are easily testable.

### Import And Merge Layer

Responsible for:

- File parsing
- Field mapping
- Validation
- Duplicate detection
- Diff generation
- Snapshot creation
- Merge audit trail

### Report Generation Layer

Responsible for:

- HTML report bundles
- YAML exports
- Charts
- Manifest generation

Reports must be readable offline.

### Automation Layer

Responsible for:

- Schema validation
- Regression tests
- Dataset refresh
- Batch scenario runs

## File And Folder Conventions

Agents should preserve or move toward a structure like this:

```text
/src
  ui/
  components/
  engine/
  schemas/
  imports/
  reports/
  sustainability/

/data
  public/
    tax/
    benefits/
    market/
    climate/

/examples
  households/
  scenarios/

/tests
  unit/
  fixtures/
  regression/

/.github/workflows
/docs
```

Avoid introducing large framework-specific directory patterns.

## Coding Standards

### JavaScript Rules

- Use modern ES modules.
- Avoid global variables.
- Prefer pure functions.
- Avoid deeply nested logic.
- Use explicit variable names.
- Do not introduce unnecessary dependencies.
- Avoid "clever" abstractions.

### Financial Logic

Financial rules must:

- Be deterministic
- Be testable
- Be documented
- Not rely on LLM reasoning

### Sustainability Data

- Do not introduce opaque ESG scores.
- Prefer explicit metrics:
  - Fossil fuel exposure
  - Carbon intensity
  - Renewable energy exposure
  - Community investment exposure

Every metric should include a data source where possible.

## Import Rules

Supported formats:

- YAML
- JSON
- CSV

Import workflow must always follow:

1. Parse
2. Validate
3. Normalize
4. Match existing records
5. Generate proposed changes
6. Show diff
7. Snapshot existing data
8. Apply approved merge

Never overwrite canonical data silently.

## GitHub Actions Rules

GitHub Actions are used for:

- Automated tests
- Schema validation
- Dataset refresh
- Report generation
- Batch scenario runs

They are not used as a datastore for private financial data.

Artifacts must avoid exposing personal information in public logs.

## Testing Expectations

Changes must include tests where applicable.

Required categories:

- Schema validation tests
- Unit tests for financial logic
- Scenario regression tests
- Import parser tests
- Report generation tests

If a change alters financial outputs, the pull request must state:

- What changed
- Why it changed
- Whether the change is expected

## UX And Content Rules

The interface must be:

- Clear
- Transparent
- Honest about uncertainty

Avoid:

- Fake precision
- Buried assumptions
- Forced long questionnaires

## Safe Agent Behavior

When uncertain:

- Preserve existing behavior
- Add tests before refactoring
- Document open questions

Prefer clarity over cleverness.

## Pull Request Checklist

Before submitting changes verify:

- Deterministic logic is separate from LLM prompts
- Schemas remain valid
- Imports do not overwrite data silently
- Reports still render
- Sustainability metrics remain transparent
- Tests cover changed behavior

## Documentation Expectations

Update documentation when changing:

- Schemas
- Import behavior
- Output formats
- Sustainability metrics
- Scenario behavior

## Default Decision Policy

When unclear, choose the option that is:

1. More transparent
2. Easier to audit
3. Safer for user data
4. Simpler JavaScript
5. Less dependent on external tools