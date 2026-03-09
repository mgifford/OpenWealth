import { renderGlossaryTerm } from "../glossary.js";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function classifyLiquidity(accountType) {
  if (["tfsa", "non_registered", "cash", "savings"].includes(accountType)) {
    return "fast";
  }
  if (["rrsp", "fhsa", "resp", "pension", "home_equity"].includes(accountType)) {
    return "slow";
  }
  return "slow";
}

function formatCurrency(value) {
  return value.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  });
}

export function buildLiquidityBalance(input = {}) {
  const household = input.household ?? {};
  const accounts = household.accounts ?? [];
  const liabilities = household.liabilities ?? [];
  const pensionIncome = (household.income_sources ?? [])
    .filter((income) => income.source_type === "pension")
    .reduce((sum, income) => sum + toNumber(income.annual_amount, 0), 0);

  const buckets = {
    fast: 0,
    slow: 0
  };

  for (const account of accounts) {
    const bucket = classifyLiquidity(account.account_type);
    buckets[bucket] += Math.max(0, toNumber(account.current_balance, 0));
  }

  const total = buckets.fast + buckets.slow;
  const fastShare = total > 0 ? buckets.fast / total : 0;
  const slowShare = total > 0 ? buckets.slow / total : 0;

  const mortgageLikeDebt = liabilities.reduce((sum, item) => {
    if (item.kind === "mortgage" || item.kind === "home_loan") {
      return sum + toNumber(item.balance, 0);
    }
    return sum;
  }, 0);

  let message = "Your portfolio has a workable mix of fast and slow money.";
  if (slowShare >= 0.85) {
    message =
      "Most of your wealth is in slow money. You may feel house rich or retirement-account rich but cash poor during emergencies.";
  } else if (fastShare < 0.2) {
    message = "Fast money is low. Consider building a larger emergency-access bucket for sudden bills.";
  }

  return {
    buckets,
    total,
    fastShare,
    slowShare,
    mortgageLikeDebt,
    pensionIncome,
    message
  };
}

export function renderLiquidityBalancePanel(balance) {
  if (!balance || balance.total <= 0) {
    return `
      <section>
        <h3>Portfolio Balance by Access Speed</h3>
        <p>Add account balances to see your fast-money vs slow-money mix.</p>
      </section>
    `;
  }

  const r = 54;
  const c = 2 * Math.PI * r;
  const fastLen = c * balance.fastShare;
  const slowLen = c - fastLen;

  return `
    <section>
      <h3>Portfolio Balance (Levers Model)</h3>
      <p>${renderGlossaryTerm("Fast money", "fast-money")}: assets accessible in days. ${renderGlossaryTerm("Slow money", "slow-money")}: assets unlocked over years or specific ages.</p>
      <div class="portfolio-balance-panel">
        <svg viewBox="0 0 140 140" role="img" aria-label="Donut chart showing fast versus slow money">
          <circle cx="70" cy="70" r="${r}" fill="none" stroke="#d4d8df" stroke-width="22"></circle>
          <circle cx="70" cy="70" r="${r}" fill="none" stroke="#1b9e77" stroke-width="22" stroke-dasharray="${fastLen} ${c - fastLen}" transform="rotate(-90 70 70)"></circle>
          <circle cx="70" cy="70" r="${r}" fill="none" stroke="#7a5195" stroke-width="22" stroke-dasharray="${slowLen} ${c - slowLen}" stroke-dashoffset="-${fastLen}" transform="rotate(-90 70 70)"></circle>
          <text x="70" y="68" text-anchor="middle" font-size="11">Net wealth</text>
          <text x="70" y="84" text-anchor="middle" font-size="12">${formatCurrency(balance.total)}</text>
        </svg>
        <div class="donut-legend">
          <p><span class="swatch fast"></span> Fast money: <strong>${formatCurrency(balance.buckets.fast)}</strong> (${(balance.fastShare * 100).toFixed(0)}%)</p>
          <p><span class="swatch slow"></span> Slow money: <strong>${formatCurrency(balance.buckets.slow)}</strong> (${(balance.slowShare * 100).toFixed(0)}%)</p>
        </div>
      </div>
      <p><strong>Balance insight:</strong> ${balance.message}</p>
      ${balance.mortgageLikeDebt > 0 ? `<p>Home-loan balance detected: ${formatCurrency(balance.mortgageLikeDebt)}. High debt can increase cash-flow pressure when fast money is small.</p>` : ""}
      ${balance.pensionIncome > 0 ? `<p>Pension income rights detected (${formatCurrency(balance.pensionIncome)}/year). This donut focuses on liquid account balances and excludes future pension stream valuation.</p>` : ""}
    </section>
  `;
}
