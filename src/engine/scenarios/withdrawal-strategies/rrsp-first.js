const STRATEGY_ORDER = ["rrsp", "non_registered", "tfsa", "fhsa", "resp"];

export function planRrspFirstWithdrawals(accounts, amountNeeded) {
  let remaining = amountNeeded;
  const plan = {};

  for (const type of STRATEGY_ORDER) {
    for (const account of accounts.filter((entry) => entry.account_type === type)) {
      if (remaining <= 0) {
        break;
      }
      const amount = Math.min(account.current_balance, remaining);
      if (amount > 0) {
        plan[account.account_id] = { withdrawal: amount };
        remaining -= amount;
      }
    }
  }

  return { plan, unfundedAmount: Math.max(0, remaining) };
}
