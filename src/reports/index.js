import { assembleReport } from "./assemble-report.js";
import { exportYamlArtifacts } from "./export-yaml.js";
import { buildManifest } from "./manifest.js";
import { packageReportBundle, serializeBundle } from "./package-bundle.js";

import { buildProfileSection } from "./sections/profile.js";
import { buildAccountsSection } from "./sections/accounts.js";
import { buildScenariosSection } from "./sections/scenarios.js";
import { buildAssumptionsSection } from "./sections/assumptions.js";
import { buildCaveatsSection } from "./sections/caveats.js";
import { buildSustainabilitySection } from "./sections/sustainability.js";
import { buildNextQuestionsSection } from "./sections/next-questions.js";
import { buildChangeLogSection } from "./sections/change-log.js";
import { buildDisclaimerSection } from "./sections/disclaimer.js";

export function reportModuleStatus() {
  return "ready";
}

export function buildReportSections(engineResult, input = {}) {
  const scenarioSection = buildScenariosSection(input.scenario ?? {}, engineResult);
  const caveatsSection = buildCaveatsSection(engineResult);

  return {
    disclaimer: buildDisclaimerSection(),
    profile: buildProfileSection(input.household ?? { household_id: "n/a", name: "Unknown", province_or_territory: "NA", people: [] }),
    accounts: buildAccountsSection(input.household ?? { accounts: [] }),
    scenarios: scenarioSection,
    assumptions: buildAssumptionsSection(engineResult, input.scenario ?? {}),
    caveats: caveatsSection,
    sustainability: buildSustainabilitySection(engineResult.sustainability ?? {})
    ,
    next_questions: buildNextQuestionsSection(scenarioSection, caveatsSection),
    change_log: buildChangeLogSection({
      generatedAt: input.generatedAt ?? new Date().toISOString(),
      schemaVersion: input.schemaVersion ?? "1.0.0"
    })
  };
}

export {
  assembleReport,
  exportYamlArtifacts,
  buildManifest,
  packageReportBundle,
  serializeBundle,
  buildProfileSection,
  buildAccountsSection,
  buildScenariosSection,
  buildAssumptionsSection,
  buildCaveatsSection,
  buildSustainabilitySection,
  buildNextQuestionsSection,
  buildChangeLogSection,
  buildDisclaimerSection
};
