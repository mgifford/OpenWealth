# Development Constraints

OpenWealth is local-first and privacy-first.

## Non-Negotiable Constraints

- Deterministic engine logic is the source of truth for financial calculations.
- LLM assistance is limited to guided intake, scenario scaffolding, and explanation.
- Import flow must stay explicit: parse, validate, normalize, match, diff preview, user approval, snapshot, apply.
- Never commit real household financial data.

## Data Handling

- Default persistence is browser-local state.
- Exports must remain open and inspectable (YAML/HTML minimum).
- Private data is user-controlled and must not be routed to third-party storage by default.
