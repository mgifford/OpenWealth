import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { runDeterministicEngine } from "../../src/engine/index.js";
import { buildReportBundle } from "../../src/ui/export/index.js";

const OUTPUT_ROOT = join(process.cwd(), "dist", "batch");
const HOUSEHOLD_FIXTURE = join(process.cwd(), "tests", "fixtures", "engine", "base-household.json");
const SCENARIOS = [
  "scenario-tfsa-first.json",
  "scenario-rrsp-first.json",
  "scenario-delayed-benefits.json"
];

async function loadJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeScenarioArtifacts(scenarioName, bundleOutput) {
  const scenarioDir = join(OUTPUT_ROOT, scenarioName);
  await mkdir(scenarioDir, { recursive: true });

  for (const [fileName, content] of Object.entries(bundleOutput.bundle.files)) {
    await writeFile(join(scenarioDir, fileName), content, "utf8");
  }
}

async function main() {
  await mkdir(OUTPUT_ROOT, { recursive: true });

  const household = await loadJson(HOUSEHOLD_FIXTURE);
  const summary = [];

  for (const scenarioFileName of SCENARIOS) {
    const fixture = await loadJson(join(process.cwd(), "tests", "fixtures", "engine", scenarioFileName));
    const scenario = {
      ...fixture,
      scenario_id: scenarioFileName.replace(".json", ""),
      name: scenarioFileName.replace(".json", "").replaceAll("-", " ")
    };

    const engineResult = runDeterministicEngine({
      household,
      scenario,
      currentAge: 38,
      simulationOptions: { seed: 42, runs: 8, returnBound: 0.01 }
    });

    const bundleOutput = buildReportBundle({ household, scenario, engineResult }, {
      generatedAt: new Date().toISOString(),
      schemaVersion: "1.0.0",
      feature: "batch-scenarios",
      version: "v1"
    });

    await writeScenarioArtifacts(scenario.scenario_id, bundleOutput);

    summary.push({
      scenario_id: scenario.scenario_id,
      final_net_worth: engineResult.projection.summary.finalNetWorth,
      total_unfunded: engineResult.projection.summary.totalUnfunded,
      bundle_name: bundleOutput.bundle.bundle_name
    });
  }

  await writeFile(join(OUTPUT_ROOT, "summary.json"), `${JSON.stringify({ generated_at: new Date().toISOString(), summary }, null, 2)}\n`, "utf8");
  console.log(`Batch scenarios complete: ${summary.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
