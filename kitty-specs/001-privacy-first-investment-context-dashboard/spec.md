# Feature Specification: Privacy-First Investment Context Dashboard

**Feature Branch**: `[001-privacy-first-investment-context-dashboard]`  
**Created**: 2026-03-08  
**Status**: Draft  
**Input**: User description: "I want to start a wealth tracking application that is designed to be open source and privacy friendly. It need to be clear that it isn't giving financial advice, simply presenting information. It will be run on GitHub Pages and GitHub actions with a LLM Prompt Generator."

## Clarifications

### Session 2026-03-08

- Q: Where should personal financial data be stored by default for this feature? -> A: Browser-only local storage by default, with an option to save outputs as YAML and HTML reports.
- Q: Should this feature now be scoped explicitly for Canadian planning rules and accounts (TFSA, RRSP, FHSA, RESP, CPP, OAS) in MVP requirements? -> A: Yes, include all in MVP scope.
- Q: For sustainability in MVP, should values-aligned investing be required by default in every scenario comparison, or optional as a toggle? -> A: Required by default in all scenario outputs.
- Q: Should MVP be limited to a single household profile per local workspace, or support multiple household profiles from day one? -> A: Single household only in MVP.
- Q: Should the feature scope include production-quality Canadian planning architecture, import/merge controls, sustainability/climate transparency, GitHub Actions automation, and constrained LLM usage? -> A: Yes; include as explicit implementation-planning scope.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Build Personal Investment Snapshot (Priority: P1)

As a midlife investor, I can enter core details about my financial situation and investment holdings so I can see a clear current snapshot of my net worth and portfolio mix.

**Why this priority**: A trustworthy baseline view is the core value of the product and must exist before any additional context features matter.

**Independent Test**: Can be fully tested by creating a new profile, entering required financial inputs, and confirming a complete snapshot view is produced without any external advisor interaction.

**Acceptance Scenarios**:

1. **Given** a new user with no saved data, **When** they complete the basic financial information prompts and save, **Then** the system displays an updated personal wealth snapshot with totals and category breakdowns.
2. **Given** an existing user profile, **When** the user edits holdings or balances, **Then** the snapshot recalculates and reflects the latest values.

---

### User Story 2 - Get Contextual Progress Toward Goals (Priority: P2)

As a user, I can define investment-related goals and compare my current position against those goals so I can understand progress and gaps.

**Why this priority**: Users need context, not just raw balances, to make informed conversations with advisors and personal planning decisions.

**Independent Test**: Can be fully tested by entering one or more goals and verifying the system reports progress percentages and remaining gaps using existing user data.

**Acceptance Scenarios**:

1. **Given** a user with saved financial data and at least one goal, **When** they open the goals view, **Then** the system shows current progress and remaining distance for each goal in plain language.
2. **Given** a user updates a goal target, **When** they save the change, **Then** progress indicators update to reflect the new target values.

---

### User Story 3 - Use Public-Market Context Without Advice (Priority: P3)

As a user, I can view my portfolio context with automatically refreshed public market reference data and default values-aligned sustainability context, while seeing clear non-advisory disclaimers and generating a structured prompt for external AI discussion.

**Why this priority**: This adds practical insight while preserving product positioning as informational, open-source, and privacy-focused.

**Independent Test**: Can be fully tested by refreshing public market data, confirming portfolio context updates, generating a prompt, and verifying disclaimers appear in relevant views.

**Acceptance Scenarios**:

1. **Given** a user with holdings mapped to publicly traded assets, **When** public market reference data updates, **Then** the contextual performance view reflects the latest available values.
2. **Given** a user opens analysis or prompt-generation views, **When** content is displayed or exported, **Then** a clear statement indicates the product provides information only and not financial advice.

---

### Edge Cases

- A user submits incomplete or contradictory financial inputs (for example, negative account balances where not allowed); the system prevents saving and explains what must be corrected.
- Public market data is temporarily unavailable; the system shows the last successful update time and keeps prior values visible with a stale-data notice.
- A user has only non-market assets entered; the system still provides wealth and goal context without market comparison metrics.
- A user has no goals defined; the system prompts them to add a goal while still showing the baseline wealth snapshot.
- Imported records conflict with existing accounts (same institution and account label but different balance date); the system must present merge options and preserve pre-merge snapshot.
- A CSV upload has unmatched headers; the system maps known fields, flags unknown fields, and blocks apply until required fields are satisfied.
- Sustainability dataset coverage is missing for some holdings; output must explicitly mark metrics as unavailable rather than inferring values.
- Scenario override introduces impossible values (for example, retirement age less than current age); validation blocks scenario execution and explains the failed rule.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow users to create and maintain a personal financial profile containing essential wealth-tracking inputs (at minimum: cash balances, investment account balances, liabilities, and user-defined investment goals).
- **FR-002**: The system MUST calculate and display a consolidated wealth snapshot from user-provided data, including total assets, total liabilities, and net worth.
- **FR-003**: The system MUST allow users to define, edit, and remove investment-related goals and view progress toward each goal.
- **FR-004**: The system MUST support automatic ingestion of public market reference data for assets that have public pricing, without requiring users to upload private brokerage files.
- **FR-005**: The system MUST merge user-entered data with available public market reference data to present contextual portfolio information.
- **FR-006**: The system MUST clearly display an informational-use disclaimer in onboarding, dashboard, and prompt-generation experiences stating that no financial advice is provided.
- **FR-007**: The system MUST provide a prompt generator that produces user-readable context summaries and question prompts intended for optional use with external AI tools.
- **FR-008**: The system MUST support an open-source operating model where source materials required to run and inspect the product are publicly accessible.
- **FR-009**: The system MUST apply privacy-friendly defaults by minimizing required personal data collection to only what is needed for wealth tracking and goal context.
- **FR-010**: The system MUST preserve user-entered and computed portfolio context between sessions using browser-local storage as the default persistence mode, until the user updates or removes their data.
- **FR-011**: The system MUST allow users to save portable outputs that include at minimum a household YAML file and a human-readable HTML report.
- **FR-012**: The system MUST support Canadian account and planning coverage in MVP, including TFSA, RRSP, FHSA, RESP, non-registered accounts, CPP timing scenarios, and OAS timing scenarios.
- **FR-013**: The system MUST keep Canadian tax-advantaged account logic and public-benefit timing assumptions explicit and inspectable in user-facing assumptions output.
- **FR-014**: The system MUST include values-aligned and sustainability context in scenario comparisons by default, with explicit assumptions and disclosed data limitations.
- **FR-015**: MVP scope MUST support one household profile per local workspace, with multi-household management explicitly deferred beyond MVP.
- **FR-016**: The system MUST support a canonical household profile including people, province/territory, household composition, incomes, assets, liabilities, goals, and values preferences.
- **FR-017**: The system MUST support account schemas for TFSA, RRSP, FHSA, RESP, non-registered accounts, chequing/savings, defined contribution pension, defined benefit pension placeholder, mortgage, and other debt.
- **FR-018**: Account records MUST support current balance, contribution room (if known), annual contributions, annual withdrawals, adjusted cost base (when relevant), institution, ownership, currency, notes, import source, last-updated date, confidence level, and user-verified status.
- **FR-019**: The system MUST support standalone scenario files that override baseline household data without mutating canonical records.
- **FR-020**: Scenario comparisons MUST support retirement age variants, CPP/OAS start age variants, withdrawal-order variants, housing strategy variants, inflation variants, values-aligned portfolio variants, and spending-level variants.
- **FR-021**: The rules engine MUST implement deterministic, testable logic for contributions, withdrawals, cashflow projections, tax-aware comparisons, benefit timing, inflation assumptions, and estimated growth assumptions.
- **FR-022**: The rules engine MUST support sensitivity analysis and bounded scenario-distribution simulation with all assumptions disclosed.
- **FR-023**: The import system MUST support YAML, JSON, and CSV formats with parse, schema validate, normalize, match, diff preview, explicit user approval, snapshot, and approved merge steps.
- **FR-024**: The import system MUST record field-level provenance for changed values, including source file, timestamp, and confidence flag.
- **FR-025**: The report generator MUST produce a downloadable bundle containing at minimum HTML report, household YAML, scenario-results YAML, assumptions YAML, and a manifest with versioning metadata and hashes.
- **FR-026**: The HTML report MUST include household summary, account overview, scenario comparison, assumptions, missing-data caveats, sustainability/climate section, recommended next questions, and change log since prior snapshot.
- **FR-027**: Sustainability outputs MUST report transparent component metrics (for example fossil exposure, carbon intensity, renewable/transition exposure, social/community exposure, controversial-sector exposure) and MUST NOT collapse to one opaque score.
- **FR-028**: Climate overlays MUST distinguish measured values, modeled estimates, and unavailable values, and support at least rapid-transition, delayed-transition, and worsened-physical-risk scenarios when data exists.
- **FR-029**: LLM-assisted workflows MUST emit structured payloads with inferred assumptions, missing inputs, and confidence notes, and MUST NOT be used as the authoritative source for tax, benefits, or contribution-limit rules.
- **FR-030**: The system MUST support optional GitHub-integrated workflows for public dataset refresh, validation, and batch scenario runs without treating GitHub as default private user-data storage.

### Key Entities *(include if feature involves data)*

- **User Financial Profile**: A user's core financial situation, including balances, liabilities, and profile-level preferences required for wealth tracking.
- **Holding**: A user-owned investment position with identifying details and quantity/value inputs used for aggregation and context.
- **Goal**: A user-defined target outcome with target amount and target timeframe for progress measurement.
- **Market Reference Record**: Publicly sourced pricing and related market reference attributes used to contextualize eligible holdings.
- **Portfolio Snapshot**: A generated view of current assets, liabilities, net worth, and portfolio composition at a point in time.
- **Disclaimer Statement**: Standardized language shown in key flows to communicate informational-only usage and no-advice boundaries.
- **Prompt Package**: A generated, structured text output summarizing user context and suggested discussion prompts for external AI tools.
- **Canadian Benefit Timing Profile**: User-selected start-age scenarios and assumptions for CPP and OAS used in deterministic comparisons.
- **Scenario Override File**: Structured, versioned scenario document that selectively overrides baseline household assumptions and strategy inputs.
- **Imported Field Provenance Record**: Audit metadata for each imported/updated field including source, timestamp, parser confidence, and user confirmation.
- **Snapshot Record**: Immutable timestamped state capture created before approved merges and major model runs.
- **Sustainability Preference Profile**: User-defined priorities and exclusions for values-aligned investing and acceptable trade-offs.
- **Climate Metric Record**: Holding-level or portfolio-level climate metrics with availability state (measured, modeled, unavailable) and source references.
- **Report Manifest**: Bundle index containing artifact names, checksums, schema versions, generation timestamp, and warnings summary.

## Assumptions & Dependencies

- Users are willing to enter baseline financial information manually during onboarding.
- Automatically refreshed external data is limited to publicly available market reference information.
- Users understand this product is informational and use professional advisors for advice.
- Reliable access to public market data sources is required for market-context features.
- Open-source transparency is a core product requirement and remains part of scope.
- Default deployment target is static hosting compatible with GitHub Pages for front-end delivery.
- Automation is allowed for public data/rules updates and testing, but private household data must remain user-controlled.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 90% of first-time users who start onboarding can complete the basic financial information flow and reach a populated snapshot in under 10 minutes.
- **SC-002**: At least 95% of successful market-data refresh attempts update contextual portfolio metrics and become visible to users within 5 minutes of data availability.
- **SC-003**: In usability testing, at least 90% of users can correctly identify that the product is informational and does not provide financial advice.
- **SC-004**: At least 80% of users who create one or more goals can view goal progress and remaining gap information without assistance.
- **SC-005**: At least 85% of users who open the prompt generator can produce and copy a context prompt on their first attempt.
- **SC-006**: 100% of generated reports include an assumptions section, missing-data section, and non-advisory disclaimer.
- **SC-007**: 100% of import operations present a user-visible diff and require explicit approval before merge.
- **SC-008**: At least 90% of tested scenario runs complete without schema-validation or rules-engine errors when using valid inputs.
