# OpenWealth

OpenWealth is an open, Canadian, scenario-based financial planning application.

It is designed to help people understand trade-offs in retirement planning, account strategy, and values-aligned investing without pretending to provide financial advice.

## Status

Feature `001-privacy-first-investment-context-dashboard` has been implemented through WP10:

- deterministic planning engine (CPP/OAS timing, withdrawal strategies, sensitivity, simulation)
- local-first state, snapshots, and migration handling
- import preview, approval, merge, and provenance tracking
- onboarding/scenario/comparison UI flows
- sustainability and climate overlays with component-level disclosure
- portable report bundle generation (HTML + YAML + manifest)
- constrained LLM assistant contracts and guardrails
- GitHub Actions automation for CI, Pages preview/deploy, data refresh, batch scenarios, release packaging, and privacy checks

Live site (GitHub Pages): `https://mgifford.github.io/OpenWealth/`

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
src/
  app/
  ui/
  components/
  engine/
  schemas/
  imports/
  reports/
  llm/

tests/
  unit/
  integration/
  schema/
  regression/
  fixtures/

data/public/
examples/

kitty-specs/
  001-privacy-first-investment-context-dashboard/
    spec.md
    plan.md
    research.md
    data-model.md
    tasks.md
    tasks/
```

  ## Development Commands

  ```bash
  npm install
  npm run dev
  npm run lint
  npm run test:schema
  npm run test:unit
  npm run test:integration
  npm run test:regression
  npm run build
  ```

  ## Automation Commands

  ```bash
  npm run data:refresh
  npm run batch:scenarios
  npm run release:package
  npm run privacy:guard
  ```

  ## Workflow Matrix

  - `ci.yml`: lint + schema + unit + integration + regression + build
  - `pages-deploy.yml`: PR preview artifact and main branch Pages deployment
  - `data-refresh.yml`: scheduled/dispatch public dataset checksum + changelog artifacts
  - `batch-scenarios.yml`: scheduled/dispatch synthetic batch report artifacts
  - `release.yml`: tag/dispatch release package generation + release attachment
  - `privacy-guard.yml`: denylist/path/content checks over generated artifacts

  ## Pre-release Verification

  Before tagging a release:

  1. Run local quality gates:
    - `npm run lint`
    - `npm run test:schema`
    - `npm run test:unit`
    - `npm run test:integration`
    - `npm run test:regression`
    - `npm run build`
  2. Dry-run automation scripts locally:
    - `npm run data:refresh`
    - `npm run batch:scenarios`
    - `npm run release:package`
    - `npm run privacy:guard`
  3. Trigger GitHub workflows via `workflow_dispatch` and verify artifacts/retention in Actions UI.
  4. Confirm Pages deploys from GitHub Actions and renders expected app shell on `main`.

## Next Steps

- Continue UI polish and richer accessibility coverage for end-to-end flows
- Expand report artifact interoperability and import/export tooling
- Add more scenario regression fixtures for release confidence
