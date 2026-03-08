import { applyAccountFlows, getAccountRules } from "../accounts/index.js";
import { annualCppAtStartAge, annualOasAtStartAge } from "../benefits/index.js";
import { planWithdrawals } from "./withdrawal-strategies/index.js";

const WITHDRAWAL_TAX_RATE = 0.25;

function mergePlans(basePlan, extraPlan) {
  const merged = { ...basePlan };

  for (const [accountId, flow] of Object.entries(extraPlan)) {
    const existing = merged[accountId] ?? {};
    merged[accountId] = {
      ...existing,
      withdrawal: (existing.withdrawal ?? 0) + (flow.withdrawal ?? 0)
    };
  }

  return merged;
}

function estimateTaxableWithdrawals(accounts, plan) {
  const rules = getAccountRules().accounts;
  let taxable = 0;

  for (const account of accounts) {
    const withdrawal = plan[account.account_id]?.withdrawal ?? 0;
    if (withdrawal <= 0) {
      continue;
    }

    if (rules[account.account_type]?.taxable_withdrawal) {
      taxable += withdrawal;
    }
  }

  return taxable;
}

function inflatedAmount(baseAmount, inflationRate, step) {
  return baseAmount * Math.pow(1 + inflationRate, step);
}

export function projectCashflow(input) {
  const household = input.household;
  const scenario = input.scenario ?? {};

  const primaryPerson = household.people[0];
  const currentAge = input.currentAge ?? new Date().getUTCFullYear() - primaryPerson.birth_year;
  const retirementAge = scenario.retirement_age ?? primaryPerson.retirement_target_age ?? 65;

  if (retirementAge < currentAge || retirementAge > 75) {
    throw new Error("Retirement age must be >= current age and <= 75");
  }

  const inflationRate = scenario.inflation_rate ?? household.assumptions.inflation_rate;
  const expectedReturn = scenario.expected_return ?? household.assumptions.expected_return;
  const years = scenario.projection_years ?? 30;
  const spendingBase = scenario.annual_spending ?? 60000;
  const strategy = scenario.withdrawal_strategy ?? "blended";
  const cppStartAge = scenario.cpp_start_age ?? 65;
  const oasStartAge = scenario.oas_start_age ?? 65;

  let accounts = household.accounts.map((account) => ({ ...account }));
  const annualProjection = [];

  for (let step = 0; step < years; step += 1) {
    const age = currentAge + step;
    const year = new Date().getUTCFullYear() + step;

    const cppIncome = age >= cppStartAge ? annualCppAtStartAge(cppStartAge) : 0;
    const oasIncome = age >= oasStartAge ? annualOasAtStartAge(oasStartAge) : 0;

    const spendingNeed = age >= retirementAge ? inflatedAmount(spendingBase, inflationRate, step) : 0;
    const benefitsIncome = cppIncome + oasIncome;
    const shortfall = Math.max(0, spendingNeed - benefitsIncome);

    const primaryWithdrawal = planWithdrawals(strategy, accounts, shortfall);
    const taxableBase = estimateTaxableWithdrawals(accounts, primaryWithdrawal.plan);
    const taxCost = taxableBase * WITHDRAWAL_TAX_RATE;

    const taxTopUp = taxCost > 0 ? planWithdrawals(strategy, accounts, taxCost) : { plan: {}, unfundedAmount: 0 };

    const mergedPlan = mergePlans(primaryWithdrawal.plan, taxTopUp.plan);
    const updatedAccounts = applyAccountFlows(accounts, mergedPlan, expectedReturn);

    const netWorth = updatedAccounts.reduce((sum, account) => sum + account.current_balance, 0);

    annualProjection.push({
      year,
      age,
      spendingNeed,
      benefitsIncome,
      withdrawalsPlanned: shortfall - primaryWithdrawal.unfundedAmount,
      taxFromWithdrawals: taxCost,
      unfundedAmount: primaryWithdrawal.unfundedAmount + taxTopUp.unfundedAmount,
      netWorth
    });

    accounts = updatedAccounts;
  }

  return {
    summary: {
      strategy,
      finalNetWorth: annualProjection.at(-1)?.netWorth ?? 0,
      totalUnfunded: annualProjection.reduce((sum, row) => sum + row.unfundedAmount, 0)
    },
    assumptions: {
      inflationRate,
      expectedReturn,
      retirementAge,
      cppStartAge,
      oasStartAge,
      strategy
    },
    warnings: [
      "Informational model only; not financial advice.",
      "Deterministic engine output depends on provided assumptions."
    ],
    annualProjection
  };
}
