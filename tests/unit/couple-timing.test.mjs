import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCoupleTimingOutcomes,
  renderCoupleTimingOutcomes
} from "../../src/ui/results/couple-timing.js";

test("couple outcomes return null for single households", () => {
  const outcomes = buildCoupleTimingOutcomes({
    household: {
      household_composition: "single",
      people: [{ display_name: "Jordan", birth_year: 1988, retirement_target_age: 65 }]
    },
    scenario: { retirement_age: 65 },
    currentYear: 2026
  });

  assert.equal(outcomes, null);
});

test("couple outcomes include combined and per-person retirement timing", () => {
  const outcomes = buildCoupleTimingOutcomes({
    household: {
      household_composition: "couple",
      people: [
        { person_id: "p1", display_name: "Sam", birth_year: 1985, retirement_target_age: 64 },
        { person_id: "p2", display_name: "Riley", birth_year: 1987, retirement_target_age: 66 }
      ]
    },
    scenario: { retirement_age: 65 },
    currentYear: 2026
  });

  assert.ok(outcomes);
  assert.equal(outcomes.perPerson.length, 2);
  assert.equal(outcomes.combined.averageRetirementAge, 65);
  assert.equal(outcomes.combined.earliestRetirementYear, 2050);
  assert.equal(outcomes.combined.latestRetirementYear, 2052);

  const html = renderCoupleTimingOutcomes(outcomes);
  assert.match(html, /Couple retirement timing outcomes/);
  assert.match(html, /Life timeline/);
  assert.match(html, /metric-primary-grid/);
  assert.match(html, /Sam/);
  assert.match(html, /Riley/);
});
