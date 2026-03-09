import test from "node:test";
import assert from "node:assert/strict";

import { buildProjectionSeries, renderProjectionChartSvg } from "../../src/ui/charts/projection.js";

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
