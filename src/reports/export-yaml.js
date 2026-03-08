import YAML from "yaml";

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
    "household.yaml": YAML.stringify(householdDocument),
    "scenario-results.yaml": YAML.stringify(scenarioResultsDocument),
    "assumptions.yaml": YAML.stringify(assumptionsDocument)
  };
}
