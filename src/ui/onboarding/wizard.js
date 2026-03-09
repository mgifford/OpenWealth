import { createDefaultSustainabilityPreferences } from "../sustainability/preferences/index.js";

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function todayDate(clock = () => new Date()) {
  return clock().toISOString().slice(0, 10);
}

export function createOnboardingDraft() {
  return {
    household: {
      name: "",
      province_or_territory: "ON",
      household_composition: "single"
    },
    people: [],
    starterAccounts: [],
    incomeSources: [],
    liabilities: []
  };
}

export function applyOnboardingStep(draft, step, payload) {
  const next = {
    ...draft,
    household: { ...draft.household },
    people: draft.people.map((person) => ({ ...person })),
    starterAccounts: draft.starterAccounts.map((account) => ({ ...account })),
    incomeSources: draft.incomeSources.map((income) => ({ ...income })),
    liabilities: draft.liabilities.map((liability) => ({ ...liability }))
  };

  if (step === "household") {
    next.household = {
      ...next.household,
      name: payload.name?.trim() ?? next.household.name,
      province_or_territory: payload.province_or_territory ?? next.household.province_or_territory,
      household_composition: payload.household_composition ?? next.household.household_composition
    };
    return next;
  }

  if (step === "people") {
    next.people = (payload.people ?? []).map((person, index) => ({
      person_id: person.person_id ?? createId(`person_${index + 1}`),
      display_name: person.display_name,
      birth_year: Number(person.birth_year),
      retirement_target_age: Number(person.retirement_target_age ?? 65)
    }));
    return next;
  }

  if (step === "accounts") {
    next.starterAccounts = (payload.accounts ?? []).map((account, index) => ({
      account_id: account.account_id ?? createId(`account_${index + 1}`),
      account_type: account.account_type,
      ownership: account.ownership ?? "individual",
      currency: account.currency ?? "CAD",
      current_balance: Number(account.current_balance ?? 0),
      annual_contribution: Number(account.annual_contribution ?? 0),
      confidence: account.confidence ?? "medium",
      user_verified: Boolean(account.user_verified),
      last_updated: account.last_updated ?? todayDate()
    }));
    return next;
  }

  if (step === "financials") {
    const currentIncome = Number(payload.current_income ?? 0);
    const mortgageBalance = Number(payload.mortgage_balance ?? 0);
    const debtPayment = Number(payload.debt_payment ?? 0);
    const mortgageRate = Number(payload.mortgage_interest_rate ?? 0.045);

    next.incomeSources =
      currentIncome > 0
        ? [
            {
              income_id: payload.income_id ?? createId("income_1"),
              source_type: "employment",
              annual_amount: currentIncome,
              taxable: true,
              confidence: payload.income_confidence ?? "medium"
            }
          ]
        : [];

    next.liabilities =
      mortgageBalance > 0
        ? [
            {
              liability_id: payload.liability_id ?? createId("liability_1"),
              kind: "mortgage",
              balance: mortgageBalance,
              interest_rate: mortgageRate,
              payment_amount: Math.max(0, debtPayment)
            }
          ]
        : [];

    return next;
  }

  if (step === "benefits") {
    const workplacePensionIncome = Number(payload.workplace_pension_income ?? 0);
    const preferredCppAge = Number(payload.preferred_cpp_start_age ?? 65);
    const preferredOasAge = Number(payload.preferred_oas_start_age ?? 65);

    const nonPensionIncomes = next.incomeSources.filter((income) => income.source_type !== "pension");
    next.incomeSources =
      workplacePensionIncome > 0
        ? [
            ...nonPensionIncomes,
            {
              income_id: payload.pension_income_id ?? createId("income_pension"),
              source_type: "pension",
              annual_amount: workplacePensionIncome,
              taxable: true,
              confidence: payload.pension_confidence ?? "medium"
            }
          ]
        : nonPensionIncomes;

    next.household = {
      ...next.household,
      preferred_cpp_start_age: preferredCppAge,
      preferred_oas_start_age: preferredOasAge
    };

    return next;
  }

  throw new Error(`Unknown onboarding step: ${step}`);
}

function validateDraft(draft) {
  if (!draft.household.name?.trim()) {
    throw new Error("Onboarding requires household name");
  }

  if (!draft.household.province_or_territory?.trim()) {
    throw new Error("Onboarding requires province or territory");
  }

  if (!draft.people.length) {
    throw new Error("Onboarding requires at least one person");
  }
}

export function finalizeOnboardingDraft(draft, options = {}) {
  const clock = options.clock ?? (() => new Date());
  const schemaVersion = options.schemaVersion ?? "1.0.0";

  validateDraft(draft);

  return {
    schema_version: schemaVersion,
    household_id: options.householdId ?? createId("household"),
    name: draft.household.name.trim(),
    province_or_territory: draft.household.province_or_territory,
    household_composition: draft.household.household_composition,
    people: draft.people,
    accounts: draft.starterAccounts,
    liabilities: draft.liabilities,
    income_sources: draft.incomeSources,
    goals: [],
    assumptions: {
      inflation_rate: 0.02,
      expected_return: 0.05,
      tax_year: clock().getUTCFullYear(),
      cpp_start_age_options: [draft.household.preferred_cpp_start_age ?? 65, 70],
      oas_start_age_options: [draft.household.preferred_oas_start_age ?? 65, 70]
    },
    sustainability_preferences: createDefaultSustainabilityPreferences(),
    updated_at: clock().toISOString()
  };
}
