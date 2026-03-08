import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const accountRules = JSON.parse(
  readFileSync(join(__dirname, "../../../data/public/tax/account-rules.ca-2026.json"), "utf8")
);

function clampContribution(accountType, contribution) {
  const cap = accountRules.accounts[accountType]?.annual_contribution_cap;
  if (cap === null || cap === undefined) {
    return Math.max(0, contribution);
  }
  return Math.max(0, Math.min(contribution, cap));
}

export function applyAnnualAccountFlow(account, flow) {
  const annualReturnRate = flow.annualReturnRate ?? 0;
  const requestedContribution = flow.contribution ?? account.annual_contribution ?? 0;
  const requestedWithdrawal = flow.withdrawal ?? account.annual_withdrawal ?? 0;

  const contribution = clampContribution(account.account_type, requestedContribution);
  const withdrawal = Math.max(0, requestedWithdrawal);

  const balanceAfterFlow = account.current_balance + contribution - withdrawal;
  const growth = balanceAfterFlow * annualReturnRate;
  const endingBalance = balanceAfterFlow + growth;

  return {
    ...account,
    contribution,
    withdrawal,
    growth,
    current_balance: endingBalance
  };
}

export function applyAccountFlows(accounts, flowByAccountId, annualReturnRate) {
  return accounts.map((account) =>
    applyAnnualAccountFlow(account, {
      annualReturnRate,
      ...(flowByAccountId[account.account_id] ?? {})
    })
  );
}

export function getAccountRules() {
  return accountRules;
}
