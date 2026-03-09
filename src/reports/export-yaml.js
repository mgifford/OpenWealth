import { stringifyYaml } from "./yaml-stringify.js";

export function exportYamlArtifacts(input, options = {}) {
  const schemaVersion = options.schemaVersion ?? "1.0.0";

  const householdDocument = {
    schema_version: schemaVersion,
    household: input.household
  };
  const scenarioResultsDocument = {
    schema_version: schemaVersion,
    scenario: input.scenario,
    results: input.engineResult
  };
  const assumptionsDocument = {
    schema_version: schemaVersion,
    assumptions: input.engineResult.assumptions ?? {},
    warnings: input.engineResult.warnings ?? []
  };

  return {
    "household.yaml": stringifyYaml(householdDocument),
    "scenario-results.yaml": stringifyYaml(scenarioResultsDocument),
    "assumptions.yaml": stringifyYaml(assumptionsDocument)
  };
}
