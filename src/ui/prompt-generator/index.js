import { REQUIRED_DISCLAIMER } from "../../llm/policies.js";

export function createPromptPackage(context) {
  const scenario = context.scenario;
  const engineResult = context.engineResult;

  const promptText = [
    `Scenario name: ${scenario.name}`,
    `Retirement age: ${scenario.retirement_age}`,
    `CPP start age: ${scenario.cpp_start_age}`,
    `OAS start age: ${scenario.oas_start_age}`,
    `Withdrawal strategy: ${scenario.withdrawal_strategy}`,
    "",
    "Deterministic assumptions:",
    JSON.stringify(engineResult.assumptions ?? {}, null, 2),
    "",
    "Warnings:",
    JSON.stringify(engineResult.warnings ?? [], null, 2),
    "",
    "Please provide:",
    "1) Missing data fields",
    "2) Confidence notes",
    "3) A plain-language explanation aligned to these deterministic outputs",
    "",
    REQUIRED_DISCLAIMER
  ].join("\n");

  return {
    title: `OpenWealth Prompt Package - ${scenario.name}`,
    generated_at: context.generatedAt ?? new Date().toISOString(),
    contract: {
      required_fields: ["summary", "missing_inputs", "assumptions", "confidence_notes", "disclaimer"],
      prohibited_claims: ["tax rule authority", "benefit rule authority", "guaranteed outcomes"]
    },
    prompt_text: promptText
  };
}
