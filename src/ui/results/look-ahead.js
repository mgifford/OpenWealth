import { renderGlossaryTerm } from "../glossary.js";

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatMonthYear(date) {
  return date.toLocaleString("en-CA", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  });
}

export function buildLookAheadMilestones(input) {
  const household = input.household ?? {};
  const scenario = input.scenario ?? {};
  const engineResult = input.engineResult ?? {};
  const projectionRows = engineResult.projection?.annualProjection ?? [];
  const currentYear = input.currentYear ?? new Date().getUTCFullYear();

  const firstRow = projectionRows[0] ?? {};
  const currentAge = toNumber(firstRow.age, 38);
  const retirementAge = toNumber(scenario.retirement_age, 65);
  const retirementYear = currentYear + Math.max(0, retirementAge - currentAge);

  const monthlySpending = Math.max(1, toNumber(scenario.annual_spending, 60000) / 12);
  const currentSavings = (household.accounts ?? []).reduce(
    (sum, account) => sum + toNumber(account.current_balance, 0),
    0
  );
  const emergencyMonths = Math.floor(currentSavings / monthlySpending);

  const annualIncome = (household.income_sources ?? []).reduce(
    (sum, source) => sum + toNumber(source.annual_amount, 0),
    0
  );
  const monthlySurplus = Math.max(0, (annualIncome - toNumber(scenario.annual_spending, 60000)) / 12);
  const carTarget = 20000;
  const houseTarget = 100000;

  const monthsToCar = monthlySurplus > 0 ? Math.ceil(carTarget / monthlySurplus) : null;
  const monthsToHouse = monthlySurplus > 0 ? Math.ceil(houseTarget / monthlySurplus) : null;

  return {
    retirementYear,
    emergencyMonths,
    carFundDate: monthsToCar === null ? null : formatMonthYear(new Date(Date.UTC(currentYear, monthsToCar, 1))),
    houseFundDate: monthsToHouse === null ? null : formatMonthYear(new Date(Date.UTC(currentYear, monthsToHouse, 1))),
    monthlySurplus
  };
}

export function buildWhatIfImpact(input) {
  const baseline = input.baselineEngineResult?.projection?.summary?.finalNetWorth ?? 0;
  const variant = input.variantEngineResult?.projection?.summary?.finalNetWorth ?? baseline;
  const annualSpending = Math.max(1, toNumber(input.scenario?.annual_spending, 60000));
  const delta = variant - baseline;
  const equivalentMonthsEarlier = Math.max(0, Math.round(delta / (annualSpending / 12)));

  return {
    monthlyReduction: Math.max(0, toNumber(input.monthlyReduction, 0)),
    finalNetWorthDelta: delta,
    equivalentMonthsEarlier
  };
}

export function renderLookAheadTldr(milestones) {
  const emergencyMessage = `Your savings cover about ${milestones.emergencyMonths} months of essential spending.`;
  const houseMessage = milestones.houseFundDate
    ? `At your current pace, a house down-payment fund could be ready around ${milestones.houseFundDate}.`
    : "A house down-payment goal likely needs a higher monthly surplus to stay on track.";

  return `
    <section>
      <h3>TL;DR</h3>
      <p>You're building momentum. ${emergencyMessage}</p>
      <p>${houseMessage}</p>
    </section>
  `;
}

export function renderMilestonesPanel(milestones) {
  const timelineEvents = [
    { label: "Now", year: new Date().getUTCFullYear() },
    { label: "Car fund", year: milestones.carFundDate ? Number(String(milestones.carFundDate).slice(-4)) : null },
    { label: "House fund", year: milestones.houseFundDate ? Number(String(milestones.houseFundDate).slice(-4)) : null },
    { label: "Retirement", year: milestones.retirementYear }
  ].filter((entry) => Number.isFinite(entry.year));

  const minYear = Math.min(...timelineEvents.map((entry) => entry.year));
  const maxYear = Math.max(...timelineEvents.map((entry) => entry.year));
  const span = Math.max(1, maxYear - minYear);
  const width = 680;
  const leftPad = 40;
  const rightPad = 20;
  const y = 56;

  const points = timelineEvents
    .map((entry) => {
      const x = leftPad + ((entry.year - minYear) / span) * (width - leftPad - rightPad);
      return `
        <circle cx="${x}" cy="${y}" r="6" fill="currentColor"></circle>
        <text x="${x}" y="34" text-anchor="middle" font-size="11">${entry.label}</text>
        <text x="${x}" y="78" text-anchor="middle" font-size="10">${entry.year}</text>
      `;
    })
    .join("");

  return `
    <section>
      <h3>Look Ahead Milestones</h3>
      <p><strong>${renderGlossaryTerm("Expected retirement date", "retirement-date")}:</strong> ${milestones.retirementYear}</p>
      <p><strong>${renderGlossaryTerm("Emergency buffer", "emergency-buffer")}:</strong> ${milestones.emergencyMonths} months</p>
      <p><strong>Fund for a new car:</strong> ${milestones.carFundDate ?? "Needs a monthly surplus estimate"}</p>
      <p><strong>House down-payment fund:</strong> ${milestones.houseFundDate ?? "Needs a monthly surplus estimate"}</p>
      <figure>
        <figcaption>Life timeline</figcaption>
        <svg viewBox="0 0 ${width} 100" role="img" aria-label="Life timeline milestones">
          <line x1="${leftPad}" y1="${y}" x2="${width - rightPad}" y2="${y}" stroke="currentColor" stroke-opacity="0.35"></line>
          ${points}
        </svg>
      </figure>
    </section>
  `;
}

export function buildSpendingNudges(input) {
  const milestones = input.milestones ?? {};
  const summary = input.projectionSummary ?? {};
  const nudges = [];

  if ((summary.totalUnfunded ?? 0) > 0 || (milestones.monthlySurplus ?? 0) <= 0) {
    nudges.push("Try cutting one recurring expense by $50/month and rerun the What-If slider.");
  }
  if ((milestones.emergencyMonths ?? 0) < 3) {
    nudges.push("Build a starter emergency buffer: move $25/week into safe savings until you reach 3 months.");
  }
  if ((milestones.monthlySurplus ?? 0) > 0 && (milestones.monthlySurplus ?? 0) < 200) {
    nudges.push("Aim to increase monthly surplus by $100 using one automatic transfer after payday.");
  }

  if (!nudges.length) {
    nudges.push("Your plan is on track. Keep one small weekly savings habit to stay consistent.");
  }

  return nudges;
}

export function renderNudgesPanel(nudges) {
  const items = nudges.map((nudge) => `<li>${nudge}</li>`).join("");
  return `
    <section>
      <h3>Smart Nudges</h3>
      <p>Small actions based on your current inputs:</p>
      <ul>${items}</ul>
    </section>
  `;
}

export function renderWhatIfMessage(impact) {
  return `If you spend ${impact.monthlyReduction.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0
  })} less per month, this plan is equivalent to retiring about ${impact.equivalentMonthsEarlier} month(s) earlier.`;
}
