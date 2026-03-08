export const REQUIRED_DISCLAIMER =
  "Assistant output is informational only. Deterministic engine rules remain the source of truth.";

export const PROHIBITED_PATTERNS = [
  /guaranteed return/i,
  /guaranteed outcome/i,
  /official tax rule/i,
  /cra contribution limit is/i,
  /oas must start/i,
  /cpp must start/i,
  /you should buy/i,
  /this is financial advice/i
];

export function containsProhibitedAuthorityClaim(text = "") {
  return PROHIBITED_PATTERNS.some((pattern) => pattern.test(text));
}
