import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runDeterministicEngine } from "../../../src/engine/index.js";
import { buildMetricDisclosure } from "../../../src/ui/sustainability/metric-disclosure.js";
import { buildAlternativesPanel } from "../../../src/ui/sustainability/alternatives-panel.js";
import { buildReportSections } from "../../../src/reports/index.js";

function fixture(fileName) {
  const filePath = join(process.cwd(), "tests", "fixtures", "sustainability", fileName);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

test("engine output includes sustainability context by default", () => {
  const result = runDeterministicEngine({
    household: fixture("household-with-preferences.json"),
    scenario: fixture("scenario.json"),
    currentAge: 38,
    simulationOptions: { seed: 11, runs: 4, returnBound: 0.01 }
  });

  assert.ok(result.sustainability);
  assert.equal(Array.isArray(result.sustainability.metrics), true);
  assert.equal(result.sustainability.metrics.length, 5);
  assert.equal(Array.isArray(result.sustainability.climate_overlays), true);
  assert.equal(result.sustainability.climate_overlays.length, 3);
  assert.equal(result.sustainability.has_opaque_score, false);
});

test("unavailable data paths produce explicit unavailable labels", () => {
  const result = runDeterministicEngine({
    household: fixture("household-empty-accounts.json"),
    scenario: fixture("scenario.json"),
    currentAge: 36,
    simulationOptions: { seed: 9, runs: 3, returnBound: 0.01 }
  });

  const disclosure = buildMetricDisclosure(result.sustainability.metrics);
  assert.ok(disclosure.every((entry) => entry.availability === "Unavailable"));
});

test("no single opaque score is emitted in engine or report sections", () => {
  const result = runDeterministicEngine({
    household: fixture("household-with-preferences.json"),
    scenario: fixture("scenario.json"),
    currentAge: 38,
    simulationOptions: { seed: 11, runs: 4, returnBound: 0.01 }
  });

  const reportSections = buildReportSections(result);
  const sustainabilitySection = reportSections.sustainability;

  assert.equal(result.sustainability.has_opaque_score, false);
  assert.ok(!("esg_score" in result.sustainability));
  assert.ok(
    sustainabilitySection.metrics.every((metric) => metric.metric_key !== "esg_score")
  );
});

test("alternatives panel includes uncertainty notice and disclaimer text", () => {
  const result = runDeterministicEngine({
    household: fixture("household-with-preferences.json"),
    scenario: fixture("scenario.json"),
    currentAge: 38,
    simulationOptions: { seed: 5, runs: 3, returnBound: 0.01 }
  });

  const panel = buildAlternativesPanel(
    result.sustainability.metrics,
    result.sustainability.preferences
  );

  assert.match(panel.disclaimer, /not a recommendation/i);
  assert.ok(panel.entries.every((entry) => entry.uncertainty_notice.length > 0));
});
