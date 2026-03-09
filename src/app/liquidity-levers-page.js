import {
  buildLiquidityBalance,
  renderLiquidityBalancePanel
} from "../ui/results/liquidity-balance.js";

function el(id) {
  return document.getElementById(id);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildHouseholdFromInputs() {
  const fastCash = toNumber(el("liquidity-fast-cash").value);
  const fastTaxable = toNumber(el("liquidity-fast-taxable").value);
  const slowRrsp = toNumber(el("liquidity-slow-rrsp").value);
  const slowHomeEquity = toNumber(el("liquidity-slow-home-equity").value);
  const mortgageDebt = toNumber(el("liquidity-mortgage-debt").value);
  const pensionIncome = toNumber(el("liquidity-pension-income").value);

  return {
    accounts: [
      { account_type: "cash", current_balance: fastCash },
      { account_type: "non_registered", current_balance: fastTaxable },
      { account_type: "rrsp", current_balance: slowRrsp },
      { account_type: "home_equity", current_balance: slowHomeEquity }
    ],
    liabilities: [{ kind: "mortgage", balance: mortgageDebt }],
    income_sources: pensionIncome > 0 ? [{ source_type: "pension", annual_amount: pensionIncome }] : []
  };
}

function renderPanel() {
  const household = buildHouseholdFromInputs();
  const balance = buildLiquidityBalance({ household });
  el("liquidity-levers-container").innerHTML = renderLiquidityBalancePanel(balance);
}

function initialize() {
  [
    "liquidity-fast-cash",
    "liquidity-fast-taxable",
    "liquidity-slow-rrsp",
    "liquidity-slow-home-equity",
    "liquidity-mortgage-debt",
    "liquidity-pension-income"
  ].forEach((id) => {
    el(id).addEventListener("input", renderPanel);
  });

  el("liquidity-balanced-preset").addEventListener("click", () => {
    el("liquidity-fast-cash").value = "20000";
    el("liquidity-fast-taxable").value = "30000";
    el("liquidity-slow-rrsp").value = "120000";
    el("liquidity-slow-home-equity").value = "140000";
    el("liquidity-mortgage-debt").value = "250000";
    el("liquidity-pension-income").value = "0";
    renderPanel();
  });

  el("liquidity-house-rich-preset").addEventListener("click", () => {
    el("liquidity-fast-cash").value = "4000";
    el("liquidity-fast-taxable").value = "3000";
    el("liquidity-slow-rrsp").value = "90000";
    el("liquidity-slow-home-equity").value = "500000";
    el("liquidity-mortgage-debt").value = "320000";
    el("liquidity-pension-income").value = "14000";
    renderPanel();
  });

  renderPanel();
}

initialize();
