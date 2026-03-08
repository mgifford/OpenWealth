import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCHEMA_FILES = {
  person: "person.schema.json",
  income: "income.schema.json",
  goal: "goal.schema.json",
  account: "account.schema.json",
  liability: "liability.schema.json",
  sustainability: "sustainability.schema.json",
  climateMetrics: "climate-metrics.schema.json",
  provenance: "provenance.schema.json",
  snapshot: "snapshot.schema.json",
  reportManifest: "report-manifest.schema.json",
  llmIntakeResponse: "llm-intake-response.schema.json",
  llmScenarioDraft: "llm-scenario-draft.schema.json",
  llmExplanationSummary: "llm-explanation-summary.schema.json",
  scenarioOverride: "scenario-override.schema.json",
  household: "household.schema.json"
};

function loadSchema(fileName) {
  return JSON.parse(readFileSync(join(__dirname, fileName), "utf8"));
}

function toValidationError(error) {
  const path = error.instancePath && error.instancePath.length > 0 ? error.instancePath : "/";
  return {
    path,
    keyword: error.keyword,
    message: error.message ?? "Validation error",
    params: error.params
  };
}

const ajv = new Ajv2020({ allErrors: true, strict: false });
const schemaCatalog = Object.freeze(
  Object.fromEntries(Object.entries(SCHEMA_FILES).map(([key, fileName]) => [key, loadSchema(fileName)]))
);

for (const schema of Object.values(schemaCatalog)) {
  ajv.addSchema(schema);
}

const validators = Object.freeze(
  Object.fromEntries(Object.entries(schemaCatalog).map(([key, schema]) => [key, ajv.getSchema(schema.$id)]))
);

export function validateDocument(schemaKey, data) {
  const validate = validators[schemaKey];

  if (!validate) {
    throw new Error(`Unknown schema key: ${schemaKey}`);
  }

  const valid = validate(data);
  return {
    valid,
    errors: valid ? [] : (validate.errors ?? []).map(toValidationError)
  };
}

export function getSchemaCatalog() {
  return schemaCatalog;
}
