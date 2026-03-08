# Data Model: Privacy-First Investment Context Dashboard

## Modeling Rules
- Version every top-level document (`schema_version`, `model_version`).
- Preserve immutable IDs and append-only snapshot history.
- Store provenance metadata for imported/estimated fields.
- Keep scenario overrides separate from canonical household record.

## Entities

### 1. Household
- Primary key: `household_id` (ULID/string)
- Required: `schema_version`, `household_id`, `name`, `province_or_territory`, `people`, `accounts`, `goals`, `assumptions`, `updated_at`
- Optional: `household_composition`, `notes`, `sustainability_preferences`
- Relationships: one-to-many with `people`, `accounts`, `liabilities`, `income_sources`, `scenarios`, `snapshots`

### 2. Person
- Primary key: `person_id`
- Required: `display_name`, `birth_year`
- Optional: `employment_status`, `annual_income`, `retirement_target_age`

### 3. Account
- Primary key: `account_id`
- Required: `account_type`, `ownership`, `currency`, `current_balance`, `last_updated`
- Optional: `contribution_room`, `annual_contribution`, `annual_withdrawal`, `adjusted_cost_base`, `institution`, `notes`, `import_source`, `confidence`, `user_verified`
- Enumerated `account_type`: `tfsa`, `rrsp`, `fhsa`, `resp`, `non_registered`, `chequing_savings`, `dc_pension`, `db_pension_placeholder`, `mortgage`, `other_debt`

### 4. Liability
- Primary key: `liability_id`
- Required: `kind`, `balance`, `interest_rate`, `payment_amount`
- Optional: `amortization_months`, `secured_by`, `notes`

### 5. IncomeSource
- Primary key: `income_id`
- Required: `source_type`, `annual_amount`, `taxable`
- Optional: `start_date`, `end_date`, `confidence`

### 6. Goal
- Primary key: `goal_id`
- Required: `goal_type`, `target_amount`, `target_date`
- Optional: `priority`, `notes`

### 7. ScenarioOverride
- Primary key: `scenario_id`
- Required: `name`, `base_household_id`, `overrides`, `created_at`
- Optional: `description`, `tags`
- Override behavior: patch-only override by path; unspecified fields inherit from canonical household.

### 8. Assumptions
- Required: `inflation_rate`, `expected_return`, `tax_year`, `cpp_start_age_options`, `oas_start_age_options`
- Optional: `market_regime`, `confidence`, `source_refs`

### 9. SustainabilityPreference
- Required: `exclusions`, `priorities`, `tradeoff_tolerance`
- Optional: `local_investment_preference`, `indigenous_rights_consideration`

### 10. ImportProvenance
- Required: `field_path`, `old_value`, `new_value`, `source_file`, `imported_at`, `confidence`, `approved_by_user`

### 11. Snapshot
- Required: `snapshot_id`, `household_id`, `captured_at`, `reason`, `state_hash`, `bundle_refs`

### 12. ReportManifest
- Required: `report_id`, `generated_at`, `feature_slug`, `schema_versions`, `artifacts`, `checksums`, `warnings`

## Validation Rules
- All money fields must be numeric and finite.
- Currency default `CAD`; non-CAD allowed only with explicit currency code.
- Retirement age must be >= current age and <= 75.
- Benefit start ages must match allowed range constraints.
- Unknown CSV columns are preserved in import diagnostics, not dropped silently.

## Merge Semantics
- Canonical object merge: deep-merge by ID where IDs match.
- List merge (`accounts`, `goals`, `income_sources`): keyed by stable IDs; collisions require explicit user resolution.
- Scenario file merge: never mutates canonical record; materialized runtime view only.
- Import apply always creates a pre-apply snapshot.
