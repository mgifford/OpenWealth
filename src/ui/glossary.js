let glossaryCounter = 0;

const DEFINITIONS = {
  "monthly-surplus": "Monthly surplus is what is left after regular monthly spending is paid.",
  "emergency-buffer": "Emergency buffer is how many months you can cover essentials without new income.",
  "retirement-date": "Expected retirement date is the year this plan reaches your retirement age target.",
  "funding-gap": "Funding gap is money your plan still needs when projected income and withdrawals are not enough.",
  "long-term-savings": "Projected long-term savings is an estimate of what your savings could be worth later under this scenario.",
  inflation: "Inflation is how fast prices rise over time.",
  "spending-order": "Spending order is which account is used first when covering retirement costs.",
  cpi: "CPI is a common inflation measure showing how average living costs change over time.",
  "buying-power": "Buying power is how much real-world stuff your money can buy after inflation.",
  "fast-money": "Fast money means savings you can usually access within days for urgent costs.",
  "slow-money": "Slow money means wealth that is harder to access quickly, like retirement accounts or home-linked wealth.",
  liquidity: "Liquidity means how quickly you can turn an asset into spendable cash."
};

export function renderGlossaryTerm(label, key) {
  const definition = DEFINITIONS[key] ?? label;
  glossaryCounter += 1;
  const tooltipId = `glossary-tip-${key}-${glossaryCounter}`;

  return `${label} <button class="glossary-trigger" type="button" aria-describedby="${tooltipId}" aria-expanded="false">?</button><span id="${tooltipId}" role="tooltip" class="tooltip" hidden>${definition}</span>`;
}
