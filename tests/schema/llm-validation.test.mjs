import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { validateDocument } from "../../src/schemas/validate.js";

function fixture(name) {
  return JSON.parse(readFileSync(join(process.cwd(), "tests", "fixtures", "llm", name), "utf8"));
}

test("llm explanation schema rejects missing disclaimer", () => {
  const invalid = {
    schema_version: "1.0.0",
    summary: "Plain-language explanation",
    assumptions: [],
    missing_inputs: [],
    confidence_notes: []
  };

  const result = validateDocument("llmExplanationSummary", invalid);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((entry) => entry.message.includes("disclaimer")));
});

test("llm intake schema accepts valid fixture", () => {
  const result = validateDocument("llmIntakeResponse", fixture("intake.valid.json"));
  assert.equal(result.valid, true);
});
