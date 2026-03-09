# Market Context Rollout Plan (2026-03-09)

## Goal

Implement and test market-context features in a deterministic, privacy-first way while shifting most LLM prompting to local Ollama.

## Scope and Sequence

1. Inflation buying-power meter page (ship now)
- Standalone page for non-literate users.
- Deterministic formula and plain-language outputs.
- Conservative defaults and explicit assumptions.

2. Stress-test range band
- Add best/likely/worst scenario band using deterministic ranges.
- Keep assumptions and scenario definitions visible.

3. Liquidity levers view
- Show fast-vs-slow money allocation.
- Add liquidity warnings for house-rich/cash-poor profiles.

4. Divergent-growth race-track explainer
- Optional educational visualization only.
- Driven by rolling assumptions, not intraday prices.

5. What-if rebalancing compare action
- Use "compare scenario" interactions, not imperative recommendations.
- Require user confirmation and show assumptions before apply.

## Test Strategy

1. Unit tests
- Calculation functions for inflation, stress bands, and liquidity splits.
- Edge cases: zero balances, extreme inflation, missing rates.

2. Integration tests
- UI control updates reflect deterministic output changes.
- Compare scenarios preserve canonical records without silent mutation.

3. Regression tests
- Golden fixtures for report output and scenario summaries.
- Add fixtures for inflation spikes and high-volatility periods.

4. Accessibility tests
- Automated `pa11y` scan for app shell, report fixture, and inflation page.
- Manual keyboard and screen-reader checklist in release workflow.

## Ollama-First Delivery Model (Target: >=80% local)

## Query Routing Policy

1. Local Ollama (target 80-90%)
- Prompt drafting and acceptance criteria.
- Test case generation and edge-case brainstorming.
- Refactoring suggestions and commit message drafts.
- Documentation drafting and issue triage summaries.

2. Copilot (target <=20%)
- Final implementation details in repo context.
- Edits requiring precise project-wide symbol usage and conventions.
- Final review against AGENTS guardrails.

## Suggested Ollama Commands

```bash
# Planning / acceptance criteria
cat prompt.txt | ollama run qwen2.5-coder:7b

# Local semantic retrieval support
ollama run nomic-embed-text:latest
```

## Weekly Control Loop

1. Create plan + tests with Ollama first.
2. Implement deterministic logic and UI slices.
3. Run local tests and accessibility scans.
4. Use Copilot for targeted fixes only.
5. Track ratio in PR notes: local-Ollama prompts vs Copilot prompts.

## PR Checklist Additions

- [ ] No financial-advice phrasing in UI output.
- [ ] Assumptions and data source notes are visible.
- [ ] Deterministic logic remains outside LLM layers.
- [ ] Import/merge safety semantics unchanged.
- [ ] Tests cover changed behavior.
- [ ] Ollama/Copilot query ratio recorded.
