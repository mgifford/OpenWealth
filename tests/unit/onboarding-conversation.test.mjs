import test from "node:test";
import assert from "node:assert/strict";
import {
  parseNaturalLanguageFinancialEstimate,
  computeSafetyBarValue
} from "../../src/ui/onboarding/conversation.js";

test("natural language parser extracts monthly income, spending, and checking balance", () => {
  const parsed = parseNaturalLanguageFinancialEstimate(
    "I have $2,000 in my checking account and I spend about $1,500 a month. I earn 4200 per month."
  );

  assert.equal(parsed.checkingBalance, 2000);
  assert.equal(parsed.monthlySpending, 1500);
  assert.equal(parsed.monthlyIncome, 4200);
});

test("safety bar value shrinks as bills rise", () => {
  assert.equal(computeSafetyBarValue(5000, 1000), 80);
  assert.equal(computeSafetyBarValue(5000, 4500), 10);
  assert.equal(computeSafetyBarValue(5000, 6000), 0);
});
