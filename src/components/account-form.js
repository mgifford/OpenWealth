const ACCOUNT_TYPES = new Set([
  "tfsa",
  "rrsp",
  "fhsa",
  "resp",
  "non_registered",
  "chequing_savings",
  "dc_pension",
  "db_pension_placeholder",
  "mortgage",
  "other_debt"
]);

function normalizeNumber(value, field) {
  const normalized = Number(value ?? 0);
  if (Number.isNaN(normalized)) {
    throw new Error(`Account field ${field} must be numeric`);
  }
  return normalized;
}

export function validateAccountInput(input) {
  if (!input.account_type || !ACCOUNT_TYPES.has(input.account_type)) {
    throw new Error("Account type is required and must be supported");
  }

  if (!input.account_id?.trim()) {
    throw new Error("Account id is required");
  }
}

export function normalizeAccountInput(input, options = {}) {
  validateAccountInput(input);

  const date = options.date ?? new Date().toISOString().slice(0, 10);

  return {
    account_id: input.account_id.trim(),
    account_type: input.account_type,
    ownership: input.ownership ?? "individual",
    currency: input.currency ?? "CAD",
    current_balance: normalizeNumber(input.current_balance, "current_balance"),
    annual_contribution: normalizeNumber(input.annual_contribution, "annual_contribution"),
    contribution_room:
      input.contribution_room === undefined ? undefined : normalizeNumber(input.contribution_room, "contribution_room"),
    institution: input.institution?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    confidence: input.confidence ?? "high",
    user_verified: input.user_verified !== false,
    last_updated: input.last_updated ?? date
  };
}

export function getRequiredAccountFields(accountType) {
  const base = ["account_id", "account_type", "current_balance"];
  if (accountType === "tfsa" || accountType === "rrsp" || accountType === "fhsa") {
    return [...base, "annual_contribution", "contribution_room"];
  }
  if (accountType === "non_registered") {
    return [...base, "annual_contribution", "institution"];
  }
  return base;
}
