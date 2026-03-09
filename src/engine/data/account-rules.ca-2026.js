export const ACCOUNT_RULES_CA_2026 = {
  version: "2026-01",
  jurisdiction: "CA",
  accounts: {
    tfsa: {
      annual_contribution_cap: 7000,
      taxable_withdrawal: false,
      taxable_growth: false
    },
    rrsp: {
      annual_contribution_cap: 31560,
      taxable_withdrawal: true,
      taxable_growth: false
    },
    fhsa: {
      annual_contribution_cap: 8000,
      taxable_withdrawal: true,
      taxable_growth: false
    },
    resp: {
      annual_contribution_cap: 50000,
      taxable_withdrawal: false,
      taxable_growth: false
    },
    non_registered: {
      annual_contribution_cap: null,
      taxable_withdrawal: false,
      taxable_growth: true
    }
  }
};
