import test from "node:test";
import assert from "node:assert/strict";

import { buildAssumptionsPanel, renderAssumptionsPanel } from "../../src/components/assumptions-panel.js";

test("assumptions panel includes provenance labels for key assumptions", () => {
  const panel = buildAssumptionsPanel(
    {
      assumptions: {
        expectedReturn: 0.055,
        inflationRate: 0.025,
        retirementAge: 65
      },
      warnings: []
    },
    {
      assumptions_provenance: {
        expected_return: "preset:balanced",
        inflation_rate: "manual_slider"
      }
    }
  );

  const html = renderAssumptionsPanel(panel);
  assert.match(html, /source: preset:balanced/i);
  assert.match(html, /source: manual_slider/i);
  assert.match(html, /source: user/i);
});
