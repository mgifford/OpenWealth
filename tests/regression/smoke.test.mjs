import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runDeterministicEngine } from "../../src/engine/index.js";

function loadFixture(fileName) {
  const filePath = join(process.cwd(), "tests", "fixtures", "engine", fileName);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

test("regression smoke: deterministic engine contract is stable", () => {
  const household = loadFixture("base-household.json");
  const scenario = {
    ...loadFixture("scenario-tfsa-first.json"),
    scenario_id: "smoke_scenario",
    name: "Smoke Scenario"
  };

  const result = runDeterministicEngine({
    household,
    scenario,
    currentAge: 38,
    simulationOptions: { seed: 42, runs: 8, returnBound: 0.01 }
  });

  assert.ok(result.projection);
  assert.ok(result.sensitivity);
  assert.ok(result.simulation);
  assert.ok(result.sustainability);
  assert.ok(Array.isArray(result.warnings));
});
