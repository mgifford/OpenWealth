import test from "node:test";
import assert from "node:assert/strict";

import {
  buildInflationRealityCheck,
  renderInflationRealityPanel
} from "../../src/ui/results/inflation-reality.js";

test("inflation reality check quantifies one-year buying power loss", () => {
  const check = buildInflationRealityCheck({
    principal: 50000,
    checkingRate: 0.0001,
    highYieldRate: 0.045,
    bondRate: 0.035,
    inflationRate: 0.04
  });

  assert.ok(check.nextYearCheckingReal < 50000);
  assert.ok(check.nextYearHighYieldReal > check.nextYearCheckingReal);
  assert.ok(check.targetFutureDollarsForTodayMillion > 1000000);
  assert.ok(check.millionFutureBuyingPowerTodayDollars < 1000000);
});

test("inflation panel includes buying-power plain language", () => {
  const check = buildInflationRealityCheck({
    principal: 50000,
    checkingRate: 0.0001,
    highYieldRate: 0.045,
    bondRate: 0.035,
    inflationRate: 0.04
  });

  const html = renderInflationRealityPanel(check);
  assert.match(html, /Inflation Reality Check/);
  assert.match(html, /Buying power meter/);
  assert.match(html, /20-year cost-of-living reality/);
});
