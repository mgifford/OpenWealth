import { planTfsaFirstWithdrawals } from "./tfsa-first.js";
import { planRrspFirstWithdrawals } from "./rrsp-first.js";
import { planBlendedWithdrawals } from "./blended.js";

export function planWithdrawals(strategy, accounts, amountNeeded) {
  if (strategy === "tfsa_first") {
    return planTfsaFirstWithdrawals(accounts, amountNeeded);
  }

  if (strategy === "rrsp_first") {
    return planRrspFirstWithdrawals(accounts, amountNeeded);
  }

  return planBlendedWithdrawals(accounts, amountNeeded);
}
