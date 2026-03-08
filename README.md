# OpenWealth

OpenWealth is an open, Canadian, scenario-based financial planning application.

It is designed to help people understand trade-offs in retirement planning, account strategy, and values-aligned investing without pretending to provide financial advice.

## Status

This repository currently contains planning artifacts for Feature `001-privacy-first-investment-context-dashboard`:

- Product specification
- Clarifications
- Implementation plan
- Data model
- Research decisions
- Work packages

## Product Direction

OpenWealth is built around these principles:

- Deterministic financial logic over free-form AI reasoning
- Transparency of assumptions, inferred values, and warnings
- Privacy-first, local-first defaults with portable outputs
- Canadian planning specificity (TFSA, RRSP, FHSA, RESP, CPP, OAS)
- Values-aligned and sustainability context by default

## MVP Scope

- Single household profile per local workspace
- Browser-local persistence by default
- Public market data context ingestion
- Scenario comparisons for retirement and benefit timing
- Import/update workflow with schema validation, diff preview, approval, snapshot, and merge
- Portable report bundle output (minimum HTML + YAML)

## What OpenWealth Is Not

- Not a brokerage
- Not a trading platform
- Not a source of personalized financial advice

## Repository Layout

```text
kitty-specs/
  001-privacy-first-investment-context-dashboard/
    spec.md
    plan.md
    research.md
    data-model.md
    tasks.md
    tasks/
```

## Next Steps

- Implement work packages in order (or in approved dependency-parallel lanes)
- Keep rules deterministic and testable
- Keep reports explicit about assumptions and uncertainty
