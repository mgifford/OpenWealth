function parseAmount(raw) {
  const normalized = String(raw).replace(/,/g, "").trim().toLowerCase();
  const match = normalized.match(/^(-?\d+(?:\.\d+)?)(k|m)?$/);
  if (!match) {
    return null;
  }

  const base = Number(match[1]);
  if (!Number.isFinite(base)) {
    return null;
  }

  const suffix = match[2];
  if (suffix === "k") {
    return base * 1000;
  }
  if (suffix === "m") {
    return base * 1000000;
  }

  return base;
}

function extractAmountAfterKeyword(text, pattern) {
  const match = text.match(pattern);
  if (!match) {
    return null;
  }

  return parseAmount(match[1]);
}

export function parseNaturalLanguageFinancialEstimate(input) {
  const text = String(input ?? "").toLowerCase();

  const monthlyIncome =
    extractAmountAfterKeyword(
      text,
      /(?:earn|income|salary|make)\s+(?:about\s+)?\$?([\d,.]+\s*[km]?)(?:\s+per\s+month|\s+monthly|\/mo|\/month)?/
    ) ??
    extractAmountAfterKeyword(text, /\$?([\d,.]+\s*[km]?)\s+(?:per\s+month|monthly)\s+(?:income|salary|earnings)/);

  const monthlySpending =
    extractAmountAfterKeyword(
      text,
      /(?:spend|spending|expenses|bill|rent)\s+(?:about\s+)?\$?([\d,.]+\s*[km]?)(?:\s+per\s+month|\s+monthly|\/mo|\/month)?/
    ) ??
    extractAmountAfterKeyword(text, /\$?([\d,.]+\s*[km]?)\s+(?:per\s+month|monthly)\s+(?:spending|expenses|rent|bill)/);

  const checkingBalance =
    extractAmountAfterKeyword(
      text,
      /(?:checking|chequing|cash|bank\s+account|savings\s+account)\s+(?:account\s+)?(?:has|with|at|about)?\s*\$?([\d,.]+\s*[km]?)/
    ) ?? extractAmountAfterKeyword(text, /i\s+have\s+\$?([\d,.]+\s*[km]?)\s+in\s+(?:my\s+)?(?:checking|chequing|cash|bank)/);

  return {
    monthlyIncome,
    monthlySpending,
    checkingBalance
  };
}

export function computeSafetyBarValue(monthlyIncome, monthlyBill) {
  const income = Number(monthlyIncome ?? 0);
  const bill = Number(monthlyBill ?? 0);

  if (!Number.isFinite(income) || income <= 0) {
    return 0;
  }

  const remaining = Math.max(0, income - Math.max(0, bill));
  const ratio = remaining / income;
  return Math.round(Math.min(1, Math.max(0, ratio)) * 100);
}
