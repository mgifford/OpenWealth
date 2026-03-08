export function buildAccountsSection(household) {
  const accounts = household.accounts ?? [];
  const totalBalance = accounts.reduce((sum, account) => sum + (account.current_balance ?? 0), 0);

  return {
    section_id: "accounts",
    title: "Account summary",
    total_balance: totalBalance,
    accounts
  };
}
