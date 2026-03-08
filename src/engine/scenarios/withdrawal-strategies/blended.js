const ELIGIBLE_TYPES = ["tfsa", "rrsp", "non_registered", "fhsa", "resp"];

export function planBlendedWithdrawals(accounts, amountNeeded) {
  const eligibleAccounts = accounts.filter((account) => ELIGIBLE_TYPES.includes(account.account_type));
  const totalBalance = eligibleAccounts.reduce((sum, account) => sum + account.current_balance, 0);

  if (totalBalance <= 0 || amountNeeded <= 0) {
    return { plan: {}, unfundedAmount: Math.max(0, amountNeeded) };
  }

  const plan = {};
  let allocated = 0;

  for (const account of eligibleAccounts) {
    const share = account.current_balance / totalBalance;
    const proposed = amountNeeded * share;
    const withdrawal = Math.min(account.current_balance, proposed);
    if (withdrawal > 0) {
      plan[account.account_id] = { withdrawal };
      allocated += withdrawal;
    }
  }

  const unfundedAmount = Math.max(0, amountNeeded - allocated);
  return { plan, unfundedAmount };
}
