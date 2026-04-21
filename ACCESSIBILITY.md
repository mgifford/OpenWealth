# Accessibility Commitment (ACCESSIBILITY.md)

## 1. Our Commitment

Accessibility is a core quality requirement for OpenWealth. We target **WCAG 2.2 AA** for the product UI, exported reports, and documentation.

Because this project handles financial planning, accessibility requirements apply to all core user tasks, including:
- onboarding forms
- account and scenario editing
- scenario comparison views
- sustainability and climate context
- exported HTML reports

## 2. Scope and Principles

OpenWealth follows these principles:
- **Perceivable:** Content and data visualizations must be available in more than one format.
- **Operable:** Core tasks must be fully keyboard accessible.
- **Understandable:** Labels, helper text, and validation messages must be clear and specific.
- **Robust:** Markup should work with assistive technologies across major browsers.

Additional project-specific priorities:
- deterministic outputs over opaque presentation
- assumptions and warnings always visible
- no accessibility tradeoff for visual polish

## 3. Conformance Target

- Baseline target: **WCAG 2.2 AA**
- New features should not introduce known WCAG A/AA regressions
- If a temporary exception is required, it must be documented in the pull request with a follow-up issue

## 4. Feature-Specific Requirements

### Forms (Onboarding, Accounts, Scenarios)

All forms must include:
- semantic labels associated to inputs
- clear required/optional indicators
- field-level errors with actionable messages
- programmatic error association (`aria-describedby`, `aria-invalid` where applicable)
- logical focus order and visible focus state
- keyboard-only completion for full workflows

Validation and guidance requirements:
- do not rely on color alone for status
- include plain-language examples for complex inputs (dates, percentages, amounts)
- preserve user input on validation errors

### Graphs and Data Visualizations

Charts and visual summaries must provide non-visual equivalents:
- text summary of key findings
- tabular representation for plotted values where practical
- meaningful axis labels, units, and legends
- explicit notes for uncertainty/modeling assumptions

For SVG/canvas/chart content:
- provide accessible name and description
- ensure color palettes meet contrast and non-color distinction needs
- avoid animation that cannot be paused or disabled

### Dark Mode Support

Dark mode is required and must maintain readability:
- maintain WCAG AA contrast in both light and dark themes
- do not invert data colors without checking contrast and meaning
- preserve focus indicators and error states in both themes
- respect user preference (`prefers-color-scheme`) while allowing manual override when implemented

## 5. Testing and Quality Gates

Minimum testing expectations for UI changes:
- keyboard navigation smoke test for changed flows
- automated accessibility scan for key pages/views (where tooling is available)
- manual review of forms, tables, and chart alternatives
- light and dark mode visual/contrast checks

Recommended assistive technology checks:
- NVDA or VoiceOver for major flow sanity checks
- browser zoom at 200%
- reduced motion preference where motion is introduced

### CI Accessibility Scanning

Automated scanning runs via `pa11y-ci` in GitHub Actions on every push to `main` and on pull requests that touch UI or report files.

The `.pa11yci.json` config at the repo root passes `--no-sandbox` and `--disable-setuid-sandbox` to Chromium. This is required on Ubuntu 24.04+ GitHub Actions runners where AppArmor restricts unprivileged user namespaces. These flags are only used in the CI environment; they have no effect on manual or production accessibility testing.

## 6. Severity and Prioritization

Accessibility issues are prioritized as:
- **Critical:** Blocks completion of core planning tasks (e.g., cannot submit onboarding form)
- **High:** Significant barrier or misleading output in core flows
- **Medium:** Usability or clarity gap with workaround
- **Low:** Minor polish/documentation improvements

## 7. Reporting and Triage

When reporting an accessibility issue, include:
- affected page/flow
- expected behavior vs actual behavior
- browser and assistive technology used
- reproduction steps
- screenshots/video if helpful

If possible, add WCAG criterion references in issue notes.

## 8. Contributor Guardrails

Contributors should:
- use semantic HTML first
- avoid interaction patterns that require pointer-only behavior
- provide text alternatives for non-text content
- keep assumptions/warnings readable and discoverable
- verify dark mode and keyboard support before merge

## 9. Known Current Limitations

Current implementation is evolving. While WP06 and WP07 introduced accessibility-aware structure, full end-to-end audits and expanded assistive technology regression coverage are still in progress.

## 10. Continuous Improvement

This file will be updated as:
- new UI surfaces are added (reports, exports, dashboards)
- accessibility tooling expands in CI
- feedback from users and assistive technology testing is incorporated

Last updated: 2026-03-08
