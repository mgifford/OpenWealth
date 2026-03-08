import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runDeterministicEngine } from "../../../src/engine/index.js";
import { annualCppAtStartAge } from "../../../src/engine/benefits/cpp.js";
import { annualOasAtStartAge } from "../../../src/engine/benefits/oas.js";

function loadFixture(fileName) {
  const filePath = join(process.cwd(), "tests", "fixtures", "engine", fileName);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function buildInput(scenarioFile) {
  return {
    household: loadFixture("base-household.json"),
    scenario: loadFixture(scenarioFile),
    simulationOptions: { seed: 42, runs: 8, returnBound: 0.01 }
  };
}

test("engine is deterministic for fixed inputs and seed", () => {
  const input = buildInput("scenario-tfsa-first.json");
  const resultA = runDeterministicEngine(input);
  const resultB = runDeterministicEngine(input);

  assert.deepEqual(resultA, resultB);
});

test("withdrawal strategies produce distinct outcomes", () => {
  const tfsaFirst = runDeterministicEngine(buildInput("scenario-tfsa-first.json"));
  const rrspFirst = runDeterministicEngine(buildInput("scenario-rrsp-first.json"));

  assert.notEqual(
    tfsaFirst.projection.summary.finalNetWorth,
    rrspFirst.projection.summary.finalNetWorth
  );
});

test("delayed benefits increase annual CPP and OAS amounts", () => {
  assert.ok(annualCppAtStartAge(70) > annualCppAtStartAge(65));
  assert.ok(annualOasAtStartAge(70) > annualOasAtStartAge(65));
});

test("bounded simulation is reproducible with fixed seed", () => {
  const input = buildInput("scenario-tfsa-first.json");
  const first = runDeterministicEngine(input).simulation;
  const second = runDeterministicEngine(input).simulation;

  assert.deepEqual(first.outputs, second.outputs);
});

test("invalid retirement age is blocked", () => {
  const input = buildInput("scenario-tfsa-first.json");
  input.scenario.retirement_age = 20;

  assert.throws(
    () => runDeterministicEngine(input),
    /Retirement age must be >= current age and <= 75/
  );
});

test("scenario output includes explicit assumptions and warnings", () => {
  const result = runDeterministicEngine(buildInput("scenario-delayed-benefits.json"));

  assert.equal(result.assumptions.cppStartAge, 70);
  assert.equal(result.assumptions.oasStartAge, 70);
  assert.ok(result.warnings.length >= 2);
});
