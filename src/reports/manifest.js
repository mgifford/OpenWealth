import { sha256Hex, utf8Size } from "./crypto-utils.js";

const REQUIRED_ARTIFACTS = [
  "report.html",
  "household.yaml",
  "scenario-results.yaml",
  "assumptions.yaml"
];

export function validateRequiredArtifacts(artifacts) {
  for (const fileName of REQUIRED_ARTIFACTS) {
    if (!Object.hasOwn(artifacts, fileName)) {
      throw new Error(`Missing required artifact: ${fileName}`);
    }
  }
}

export function buildManifest(input, artifacts, options = {}) {
  validateRequiredArtifacts(artifacts);

  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const schemaVersion = options.schemaVersion ?? "1.0.0";

  return {
    manifest_version: "1.0.0",
    generated_at: generatedAt,
    bundle_name: options.bundleName,
    schema_version: schemaVersion,
    household_id: input.household.household_id,
    scenario_name: input.scenario.name,
    warnings_summary: input.engineResult.warnings ?? [],
    artifacts: Object.entries(artifacts).map(([name, content]) => ({
      name,
      sha256: sha256Hex(content),
      size_bytes: utf8Size(content)
    }))
  };
}
