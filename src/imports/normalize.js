const CSV_FIELD_MAP = {
  account_id: "account_id",
  account_type: "account_type",
  ownership: "ownership",
  currency: "currency",
  current_balance: "current_balance",
  contribution_room: "contribution_room",
  annual_contribution: "annual_contribution",
  annual_withdrawal: "annual_withdrawal",
  adjusted_cost_base: "adjusted_cost_base",
  institution: "institution",
  notes: "notes",
  import_source: "import_source",
  last_updated: "last_updated",
  confidence: "confidence",
  user_verified: "user_verified"
};

const NUMERIC_FIELDS = new Set([
  "current_balance",
  "contribution_room",
  "annual_contribution",
  "annual_withdrawal",
  "adjusted_cost_base"
]);

const BOOLEAN_FIELDS = new Set(["user_verified"]);

function normalizePrimitive(key, value) {
  if (NUMERIC_FIELDS.has(key)) {
    if (value === "" || value === null || value === undefined) {
      return 0;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      throw new Error(`Invalid numeric value for ${key}`);
    }
    return numeric;
  }

  if (BOOLEAN_FIELDS.has(key)) {
    if (typeof value === "boolean") {
      return value;
    }

    if (String(value).toLowerCase() === "true") {
      return true;
    }

    if (String(value).toLowerCase() === "false") {
      return false;
    }

    return false;
  }

  return value;
}

function normalizeAccountsArray(accounts) {
  return (accounts ?? []).map((account) => ({
    ...account,
    current_balance: Number(account.current_balance ?? 0),
    contribution_room: Number(account.contribution_room ?? 0),
    annual_contribution: Number(account.annual_contribution ?? 0),
    annual_withdrawal: Number(account.annual_withdrawal ?? 0),
    adjusted_cost_base: Number(account.adjusted_cost_base ?? 0),
    user_verified: Boolean(account.user_verified)
  }));
}

function normalizeCsv(parsedCsv) {
  const unknownHeaders = parsedCsv.headers.filter((header) => !CSV_FIELD_MAP[header]);

  const accounts = parsedCsv.records.map((row) => {
    const normalized = {};

    for (const [rawKey, rawValue] of Object.entries(row)) {
      const mapped = CSV_FIELD_MAP[rawKey];
      if (!mapped) {
        continue;
      }
      normalized[mapped] = normalizePrimitive(mapped, rawValue);
    }

    return normalized;
  });

  return {
    normalized: { accounts },
    diagnostics: {
      unknownHeaders
    }
  };
}

function normalizeObjectPayload(payload) {
  if (Array.isArray(payload.accounts)) {
    return {
      normalized: {
        accounts: normalizeAccountsArray(payload.accounts)
      },
      diagnostics: {
        unknownHeaders: []
      }
    };
  }

  if (payload.household && Array.isArray(payload.household.accounts)) {
    return {
      normalized: {
        household: {
          ...payload.household,
          accounts: normalizeAccountsArray(payload.household.accounts)
        }
      },
      diagnostics: {
        unknownHeaders: []
      }
    };
  }

  throw new Error("Unsupported import payload shape");
}

export function normalizeImportPayload(format, parsedPayload) {
  if (format === "csv") {
    return normalizeCsv(parsedPayload);
  }

  return normalizeObjectPayload(parsedPayload);
}
