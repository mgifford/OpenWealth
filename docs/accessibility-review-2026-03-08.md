# Accessibility Review - 2026-03-08

## Scope

Reviewed the current browser app shell and key rendered tables on `main`:
- `index.html`
- `src/app/main.js`
- `src/ui/comparison/view.js`
- `src/ui/sustainability/metric-disclosure.js`

## Findings

### High

- None identified in the reviewed shell flows.

### Medium

- Missing skip link for keyboard users to jump to main content.
- Reduced-motion preference was not respected while using section reveal animation.
- Some status/error updates were not programmatically elevated to alert semantics.
- Generated comparison and disclosure tables lacked captions and row/column scope attributes.

### Low

- Forms did not provide concise contextual helper text for first-time users.
- Focus treatment was present but not uniformly explicit across all interactive elements.

## Remediations Applied

- Added skip link targeting `#main-content`.
- Added `prefers-reduced-motion: reduce` handling to disable animation/transition effects.
- Added explicit focus-visible outline treatment for links, inputs, selects, textarea, and buttons.
- Added contextual helper text and `aria-describedby` for onboarding and scenario forms.
- Added status role switching (`status` vs `alert`) for error messaging.
- Added table captions and semantic scope attributes for comparison and sustainability disclosure tables.
- Added live-region attributes for results/comparison output updates.

## Residual Risk

- Automated a11y scanning (axe/pa11y) is not yet part of CI.
- Assistive technology manual checks (NVDA/VoiceOver/TalkBack) still need scheduled regression runs.
- Color contrast verification should be baselined with tooling for both forced light/dark themes.

## Recommended Next Actions

1. Add automated accessibility scan workflow for `index.html` and generated report HTML.
2. Add keyboard-only smoke test checklist to release workflow.
3. Add explicit chart alternatives review once visual chart components are introduced.
