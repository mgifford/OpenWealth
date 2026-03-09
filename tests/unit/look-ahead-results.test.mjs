import test from "node:test";
import assert from "node:assert/strict";
import {
  buildLookAheadMilestones,
  buildWhatIfImpact,
  buildSpendingNudges,
  renderWhatIfMessage
} from "../../src/ui/results/look-ahead.js";

test("look ahead milestones prioritize relatable dates and buffers", () => {
  const milestones = buildLookAheadMilestones({
    currentYear: 2026,
    household: {
      accounts: [{ current_balance: 18000 }],
      income_sources: [{ annual_amount: 90000 }]
    },
    scenario: {
      retirement_age: 65,
      annual_spending: 60000
    },
    engineResult: {
      projection: {
        annualProjection: [{ age: 40 }]
      }
    }
  });

  assert.equal(milestones.retirementYear, 2051);
  assert.equal(milestones.emergencyMonths, 3);
  assert.ok(milestones.carFundDate);
});

test("what-if impact converts savings delta into retirement-month equivalent", () => {
  const impact = buildWhatIfImpact({
    monthlyReduction: 50,
    scenario: { annual_spending: 60000 },
    baselineEngineResult: { projection: { summary: { finalNetWorth: 200000 } } },
    variantEngineResult: { projection: { summary: { finalNetWorth: 220000 } } }
  });

  assert.equal(impact.equivalentMonthsEarlier, 4);
  assert.match(renderWhatIfMessage(impact), /retiring about 4 month\(s\) earlier/);
});

test("spending nudges provide specific actions when overspending", () => {
  const nudges = buildSpendingNudges({
    milestones: {
      monthlySurplus: 0,
      emergencyMonths: 1
    },
    projectionSummary: {
      totalUnfunded: 15000
    }
  });

  assert.ok(nudges.length >= 2);
  assert.match(nudges.join(" "), /\$50\/month/);
  assert.match(nudges.join(" "), /\$25\/week/);
});
