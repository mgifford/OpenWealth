## Summary

- What changed:
- Why it changed:
- Expected impact on outputs:

## Validation

- [ ] `npm run build`
- [ ] Relevant tests passed (list commands run)
- [ ] Accessibility checks considered for affected pages/components

Commands run:

```bash
# Example
npm run build
```

## Deterministic Guardrails

- [ ] Deterministic financial logic remains separate from LLM prompt/output handling
- [ ] No tax/benefit/contribution rules delegated to LLM logic
- [ ] Assumptions, inferred values, and warnings remain visible in affected outputs
- [ ] Import/merge safety behavior is unchanged (validate -> diff -> approval -> snapshot -> apply)

## LLM Query Mix (Weekly)

Run:

```bash
npm run llm:ratio
```

Paste output summary:

- Week starting:
- Local Ollama queries:
- Copilot queries:
- Local share (%):
- Status (>=80% local target):

PR snippet:

- LLM query mix (week of YYYY-MM-DD): local-ollama X, copilot Y, share Z% local.

## Data and Privacy

- [ ] No private household data added to repository or artifacts
- [ ] Any new data sources are public/inspectable and documented

## Notes for Reviewers

- Risks:
- Follow-ups:
