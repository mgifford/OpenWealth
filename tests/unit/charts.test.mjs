import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectionSeries,
  buildStressTestRangeSeries,
  buildStressTestAssumptionSummary,
  renderProjectionChartSvg,
  renderStressTestRangeChartSvg,
  renderLikelyNetWorthLineChartSvg
} from "../../src/ui/charts/projection.js";

test("projection series builder maps annual rows", () => {
  const annual = [
    { year: 2030, benefitsIncome: 12000, withdrawalsPlanned: 20000, spendingNeed: 30000 },
    { year: 2031, benefitsIncome: 13000, withdrawalsPlanned: 21000, spendingNeed: 31000 }
  ];

  const series = buildProjectionSeries(annual);
  assert.deepEqual(series.labels, [2030, 2031]);
  assert.deepEqual(series.benefitsIncome, [12000, 13000]);
});

test("projection chart renderer outputs accessible svg with three series", () => {
  const series = {
    labels: [2030, 2031, 2032],
    benefitsIncome: [10000, 11000, 12000],
    withdrawalsPlanned: [20000, 20500, 21000],
    spendingNeed: [30000, 30800, 31600]
  };

  const svg = renderProjectionChartSvg(series);
  assert.match(svg, /<svg/);
  assert.match(svg, /projection-chart-title/);
  assert.match(svg, /polyline/);
});

test("stress test range series builds best/likely/worst envelopes", () => {
  const range = buildStressTestRangeSeries({
    annualProjection: [
      { year: 2030, netWorth: 100000 },
      { year: 2031, netWorth: 110000 },
      { year: 2032, netWorth: 120000 }
    ],
    sensitivityRows: [
      { id: "low_return", finalNetWorth: 90000 },
      { id: "high_return", finalNetWorth: 160000 }
    ],
    simulationOutputs: [{ finalNetWorth: 80000 }, { finalNetWorth: 170000 }]
  });

  assert.deepEqual(range.labels, [2030, 2031, 2032]);
  assert.equal(range.likely.length, 3);
  assert.equal(range.worst.at(-1), 80000);
  assert.equal(range.best.at(-1), 170000);
});

test("stress test chart renderer outputs shaded path and accessible svg", () => {
  const svg = renderStressTestRangeChartSvg({
    labels: [2030, 2031, 2032],
    likely: [100000, 110000, 120000],
    worst: [80000, 88000, 96000],
    best: [120000, 132000, 144000]
  });

  assert.match(svg, /stress-chart-title/);
  assert.match(svg, /<path d=/);
  assert.match(svg, /Shaded area/);
});

test("stress-test assumption summary reports range and source counts", () => {
  const summary = buildStressTestAssumptionSummary({
    likely: [100000, 120000],
    worst: [80000, 90000],
    best: [120000, 170000],
    sensitivityRows: [{ id: "low_return" }, { id: "high_return" }],
    simulationOutputs: [{ finalNetWorth: 95000 }, { finalNetWorth: 165000 }, { finalNetWorth: 172000 }]
  });

  assert.equal(summary.baselineFinal, 120000);
  assert.equal(summary.worstFinal, 90000);
  assert.equal(summary.bestFinal, 170000);
  assert.equal(summary.sensitivityCount, 2);
  assert.equal(summary.simulationCount, 3);
  assert.ok(summary.worstDeltaPercent < 0);
  assert.ok(summary.bestDeltaPercent > 0);
});

test("likely-only chart renderer outputs single-line accessible svg", () => {
  const svg = renderLikelyNetWorthLineChartSvg({
    labels: [2030, 2031, 2032],
    likely: [100000, 110000, 120000]
  });

  assert.match(svg, /likely-chart-title/);
  assert.match(svg, /Likely case only/);
  assert.match(svg, /polyline/);
});
