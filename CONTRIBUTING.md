# Contributing

## Development Principles

- Keep financial calculations deterministic and testable.
- Do not use LLM outputs as authoritative tax, benefit, or contribution rules.
- Do not silently overwrite user records during import or merge flows.
- Keep dependencies minimal and explain non-trivial additions in pull requests.
- Use synthetic fixtures only for tests and examples; never commit personal financial data.

## Local Workflow

```bash
npm install
npm run lint
npm run test:schema
npm run test:unit
npm run test:regression
npm run build
```

## Pull Request Expectations

- Describe behavioral changes to financial outputs.
- Add or update tests when behavior changes.
- Keep assumptions and caveats explicit in user-facing outputs.
