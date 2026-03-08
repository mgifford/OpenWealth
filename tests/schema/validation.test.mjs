import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { validateDocument } from "../../src/schemas/validate.js";

function loadFixture(fileName) {
  const filePath = join(process.cwd(), "tests", "fixtures", "schemas", fileName);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

test("household schema accepts valid fixture", () => {
  const result = validateDocument("household", loadFixture("household.valid.json"));
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("household schema rejects invalid account type", () => {
  const result = validateDocument("household", loadFixture("household.invalid.json"));
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.path.includes("/accounts/0/account_type")));
});

test("scenario override enforces known override paths", () => {
  const validResult = validateDocument("scenarioOverride", loadFixture("scenario-override.valid.json"));
  const invalidResult = validateDocument("scenarioOverride", loadFixture("scenario-override.invalid.json"));

  assert.equal(validResult.valid, true);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.some((error) => error.path.includes("/overrides/0/path")));
});

test("climate metric schema enforces measured value requirements", () => {
  const validResult = validateDocument("climateMetrics", loadFixture("climate-metrics.valid.json"));
  const invalidResult = validateDocument("climateMetrics", loadFixture("climate-metrics.invalid.json"));

  assert.equal(validResult.valid, true);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.some((error) => error.path === "/"));
});

test("report manifest enforces non-empty bundle metadata", () => {
  const validResult = validateDocument("reportManifest", loadFixture("report-manifest.valid.json"));
  const invalidResult = validateDocument("reportManifest", loadFixture("report-manifest.invalid.json"));

  assert.equal(validResult.valid, true);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.length >= 2);
});

test("validation error shape remains stable", () => {
  const result = validateDocument("household", loadFixture("household.invalid.json"));
  assert.equal(result.valid, false);
  const firstError = result.errors[0];
  assert.deepEqual(Object.keys(firstError).sort(), ["keyword", "message", "params", "path"]);
});
