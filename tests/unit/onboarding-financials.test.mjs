import test from "node:test";
import assert from "node:assert/strict";

import {
  createOnboardingDraft,
  applyOnboardingStep,
  finalizeOnboardingDraft
} from "../../src/ui/onboarding/wizard.js";

test("onboarding financial step stores income and mortgage liabilities", () => {
  let draft = createOnboardingDraft();
  draft = applyOnboardingStep(draft, "household", {
    name: "Financial Intake Household",
    province_or_territory: "ON"
  });
  draft = applyOnboardingStep(draft, "people", {
    people: [
      {
        display_name: "Jordan",
        birth_year: 1988,
        retirement_target_age: 65
      }
    ]
  });
  draft = applyOnboardingStep(draft, "accounts", {
    accounts: [
      {
        account_type: "tfsa",
        current_balance: 100000,
        annual_contribution: 7000,
        confidence: "high",
        user_verified: true
      }
    ]
  });
  draft = applyOnboardingStep(draft, "financials", {
    current_income: 95000,
    mortgage_balance: 350000,
    debt_payment: 2100,
    mortgage_interest_rate: 0.045
  });

  const household = finalizeOnboardingDraft(draft, {
    householdId: "hh_financial_1",
    clock: () => new Date("2026-03-09T12:00:00Z")
  });

  assert.equal(household.income_sources.length, 1);
  assert.equal(household.income_sources[0].source_type, "employment");
  assert.equal(household.income_sources[0].annual_amount, 95000);

  assert.equal(household.liabilities.length, 1);
  assert.equal(household.liabilities[0].kind, "mortgage");
  assert.equal(household.liabilities[0].balance, 350000);
  assert.equal(household.liabilities[0].payment_amount, 2100);
});

test("onboarding supports couple mode and captures a second person", () => {
  let draft = createOnboardingDraft();
  draft = applyOnboardingStep(draft, "household", {
    name: "Couple Household",
    province_or_territory: "BC",
    household_composition: "couple"
  });
  draft = applyOnboardingStep(draft, "people", {
    people: [
      {
        display_name: "Sam",
        birth_year: 1985,
        retirement_target_age: 64
      },
      {
        display_name: "Riley",
        birth_year: 1987,
        retirement_target_age: 65
      }
    ]
  });

  const household = finalizeOnboardingDraft(draft, {
    householdId: "hh_couple_1",
    clock: () => new Date("2026-03-09T12:05:00Z")
  });

  assert.equal(household.household_composition, "couple");
  assert.equal(household.people.length, 2);
  assert.equal(household.people[0].display_name, "Sam");
  assert.equal(household.people[1].display_name, "Riley");
});

test("onboarding benefits step captures pension and preferred benefit ages", () => {
  let draft = createOnboardingDraft();
  draft = applyOnboardingStep(draft, "household", {
    name: "Benefits Household",
    province_or_territory: "ON"
  });
  draft = applyOnboardingStep(draft, "people", {
    people: [
      {
        display_name: "Jamie",
        birth_year: 1984,
        retirement_target_age: 65
      }
    ]
  });
  draft = applyOnboardingStep(draft, "financials", {
    current_income: 110000,
    mortgage_balance: 0,
    debt_payment: 0,
    mortgage_interest_rate: 0.04
  });
  draft = applyOnboardingStep(draft, "benefits", {
    workplace_pension_income: 22000,
    preferred_cpp_start_age: 67,
    preferred_oas_start_age: 68
  });

  const household = finalizeOnboardingDraft(draft, {
    householdId: "hh_benefits_1",
    clock: () => new Date("2026-03-09T12:10:00Z")
  });

  const pensionIncome = household.income_sources.find((income) => income.source_type === "pension");
  assert.ok(pensionIncome);
  assert.equal(pensionIncome.annual_amount, 22000);
  assert.deepEqual(household.assumptions.cpp_start_age_options, [67, 70]);
  assert.deepEqual(household.assumptions.oas_start_age_options, [68, 70]);
});
