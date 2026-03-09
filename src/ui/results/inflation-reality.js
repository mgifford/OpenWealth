import { renderGlossaryTerm } from "../glossary.js";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function realValueAfterYears(principal, nominalRate, inflationRate, years) {
  const growth = Math.pow(1 + nominalRate, years);
  const inflationDrag = Math.pow(1 + inflationRate, years);
  return principal * (growth / inflationDrag);
}

export function buildInflationRealityCheck(input = {}) {
  const principal = Math.max(0, toNumber(input.principal, 50000));
  const checkingRate = Math.max(0, toNumber(input.checkingRate, 0.0001));
  const highYieldRate = Math.max(0, toNumber(input.highYieldRate, 0.045));
  const bondRate = Math.max(0, toNumber(input.bondRate, 0.035));
  const inflationRate = Math.max(0, toNumber(input.inflationRate, 0.04));

  const nextYearCheckingReal = realValueAfterYears(principal, checkingRate, inflationRate, 1);
  const nextYearHighYieldReal = realValueAfterYears(principal, highYieldRate, inflationRate, 1);
  const nextYearBondReal = realValueAfterYears(principal, bondRate, inflationRate, 1);

  const buyingPowerRatio = principal <= 0 ? 0 : nextYearCheckingReal / principal;
  const buyingPowerPercent = Math.max(0, Math.min(100, Math.round(buyingPowerRatio * 100)));

  const millionToday = 1000000;
  const millionFutureBuyingPowerTodayDollars = realValueAfterYears(millionToday, 0, inflationRate, 20);
  const targetFutureDollarsForTodayMillion = millionToday * Math.pow(1 + inflationRate, 20);

  return {
    principal,
    checkingRate,
    highYieldRate,
    bondRate,
    inflationRate,
    nextYearCheckingReal,
    nextYearHighYieldReal,
    nextYearBondReal,
    buyingPowerPercent,
    targetFutureDollarsForTodayMillion,
    millionFutureBuyingPowerTodayDollars
  };
}

function formatCurrency(value) {
  return value.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  });
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2)}%`;
}

export function renderInflationRealityPanel(check) {
  const missing = Math.max(0, check.principal - check.nextYearCheckingReal);
  const protectedByHighYield = Math.max(0, check.nextYearHighYieldReal - check.nextYearCheckingReal);
  const protectedByBond = Math.max(0, check.nextYearBondReal - check.nextYearCheckingReal);

  return `
    <section>
      <h3>Inflation Reality Check</h3>
      <p>Market snapshot: ${renderGlossaryTerm("CPI", "cpi")} ${formatPercent(check.inflationRate)}, checking ${formatPercent(check.checkingRate)}, high-yield savings ${formatPercent(check.highYieldRate)}, bonds ${formatPercent(check.bondRate)}.</p>
      <p><strong>${renderGlossaryTerm("Buying power meter", "buying-power")}</strong></p>
      <div class="buying-power-meter" role="img" aria-label="Buying power meter after one year">
        <div class="buying-power-fill" style="width:${check.buyingPowerPercent}%"></div>
      </div>
      <p class="hint">Remaining buying power next year (checking): <strong>${check.buyingPowerPercent}%</strong></p>
      <p>Your ${formatCurrency(check.principal)} will buy about ${formatCurrency(check.nextYearCheckingReal)} worth of essentials next year.</p>
      <p>That is a hidden loss of about <strong>${formatCurrency(missing)}</strong> in one year.</p>
      <p>Moving to high-yield savings could protect roughly <strong>${formatCurrency(protectedByHighYield)}</strong> of that loss. A bond-focused option could protect around <strong>${formatCurrency(protectedByBond)}</strong>.</p>
      <p><strong>20-year cost-of-living reality:</strong> ${formatCurrency(1000000)} in 20 years may buy only about ${formatCurrency(check.millionFutureBuyingPowerTodayDollars)} in today's dollars. To match today's ${formatCurrency(1000000)} buying power, you may need roughly ${formatCurrency(check.targetFutureDollarsForTodayMillion)} in 20 years.</p>
    </section>
  `;
}
