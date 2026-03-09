import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { validateDocument } from "../../../src/schemas/validate.js";
import {
  enforceAssistantGuardrails,
  validateContractPayload,
  extractMissingData,
  extractConfidenceNotes,
  REQUIRED_DISCLAIMER
} from "../../../src/llm/index.js";
import { createPromptPackage } from "../../../src/ui/index.js";
import { runDeterministicEngine } from "../../../src/engine/index.js";

function fixture(name) {
  return JSON.parse(readFileSync(join(process.cwd(), "tests", "fixtures", "llm", name), "utf8"));
}

function engineFixture(name) {
  return JSON.parse(readFileSync(join(process.cwd(), "tests", "fixtures", "engine", name), "utf8"));
}

test("LLM intake and scenario draft schemas validate required fields", () => {
  const intakeValid = validateDocument("llmIntakeResponse", fixture("intake.valid.json"));
  const intakeInvalid = validateDocument("llmIntakeResponse", fixture("intake.invalid.json"));
  const scenarioValid = validateDocument("llmScenarioDraft", fixture("scenario-draft.valid.json"));

  assert.equal(intakeValid.valid, true);
  assert.equal(intakeInvalid.valid, false);
  assert.equal(scenarioValid.valid, true);
});

test("guardrails block prohibited authority claims", () => {
  const payload = fixture("explanation.prohibited.json");
  const result = enforceAssistantGuardrails("explanation", payload);

  assert.equal(result.blocked, true);
  assert.match(result.reason, /prohibited authority claim/i);
});

test("guardrails inject mandatory disclaimer when missing", () => {
  const payload = fixture("scenario-draft.valid.json");
  payload.disclaimer = "";

  const result = enforceAssistantGuardrails("scenarioDraft", payload);
  assert.equal(result.valid, true);
  assert.equal(result.payload.disclaimer, REQUIRED_DISCLAIMER);
});

test("missing-data and confidence extractors normalize outputs", () => {
  const payload = {
    missing_inputs: ["province_or_territory", { field: "annual_spending", reason: "Needed" }],
    confidence_notes: ["Need confirmation", { topic: "cpp_start_age", confidence: "low", note: "Unset" }]
  };

  const missing = extractMissingData(payload);
  const confidence = extractConfidenceNotes(payload);

  assert.equal(missing.length, 2);
  assert.equal(missing[0].severity, "medium");
  assert.equal(confidence.length, 2);
  assert.equal(confidence[0].topic, "general");
});

test("prompt package includes assumptions, caveats, and disclaimer", () => {
  const household = engineFixture("base-household.json");
  const scenario = {
    ...engineFixture("scenario-tfsa-first.json"),
    scenario_id: "scenario_prompt_001",
    name: "Prompt Scenario"
  };
  const engineResult = runDeterministicEngine({
    household,
    scenario,
    currentAge: 38,
    simulationOptions: { seed: 41, runs: 6, returnBound: 0.01 }
  });

  const prompt = createPromptPackage({ household, scenario, engineResult, generatedAt: "2026-03-08T23:10:00Z" });

  assert.match(prompt.prompt_text, /Privacy warning/i);
  assert.match(prompt.prompt_text, /Household name:/i);
  assert.match(prompt.prompt_text, /Deterministic assumptions/i);
  assert.match(prompt.prompt_text, /Warnings/i);
  assert.match(prompt.prompt_text, /source of truth/i);
  assert.match(prompt.privacy_warning, /Remove or anonymize personal identifiers/i);
});

test("contract validation helper maps contract types to schemas", () => {
  const result = validateContractPayload("intake", fixture("intake.valid.json"));
  assert.equal(result.valid, true);
});
