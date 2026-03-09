import { REQUIRED_DISCLAIMER } from "../../llm/policies.js";

const LLM_PRIVACY_WARNING =
  "Privacy warning: Remove or anonymize personal identifiers before sharing this prompt with external LLM tools.";

export function createPromptPackage(context) {
  const household = context.household ?? {};
  const scenario = context.scenario;
  const engineResult = context.engineResult;

  const promptText = [
    LLM_PRIVACY_WARNING,
    "",
    `Household name: ${household.name ?? "Unknown"}`,
    `Province: ${household.province_or_territory ?? "Unknown"}`,
    `Household composition: ${household.household_composition ?? "single"}`,
    `People captured: ${Array.isArray(household.people) ? household.people.length : 0}`,
    "",
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
    privacy_warning: LLM_PRIVACY_WARNING,
    prompt_text: promptText
  };
}
