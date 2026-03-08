import { normalizeAccountInput } from "../../components/account-form.js";

function upsertAccount(accounts, normalized) {
  const index = accounts.findIndex((account) => account.account_id === normalized.account_id);
  if (index === -1) {
    return [...accounts, normalized];
  }

  const next = accounts.map((account) => ({ ...account }));
  next[index] = {
    ...next[index],
    ...normalized
  };
  return next;
}

export function applyAccountEdit(household, accountInput, options = {}) {
  const normalized = normalizeAccountInput(accountInput, options);

  return {
    ...household,
    accounts: upsertAccount(household.accounts ?? [], normalized)
  };
}
