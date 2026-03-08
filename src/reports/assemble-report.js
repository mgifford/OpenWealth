import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildDisclaimerSection } from "./sections/disclaimer.js";
import { buildProfileSection } from "./sections/profile.js";
import { buildAccountsSection } from "./sections/accounts.js";
import { buildScenariosSection } from "./sections/scenarios.js";
import { buildAssumptionsSection } from "./sections/assumptions.js";
import { buildCaveatsSection } from "./sections/caveats.js";
import { buildSustainabilitySection } from "./sections/sustainability.js";
import { buildNextQuestionsSection } from "./sections/next-questions.js";
import { buildChangeLogSection } from "./sections/change-log.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE = readFileSync(join(__dirname, "templates", "report.html"), "utf8");

function replaceTokens(template, replacements) {
  return Object.entries(replacements).reduce(
    (output, [key, value]) => output.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}

export function assembleReport(input, options = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const schemaVersion = options.schemaVersion ?? "1.0.0";

  const { household, scenario, engineResult } = input;

  const disclaimer = buildDisclaimerSection();
  const profile = buildProfileSection(household);
  const accounts = buildAccountsSection(household);
  const scenarios = buildScenariosSection(scenario, engineResult);
  const assumptions = buildAssumptionsSection(engineResult);
  const caveats = buildCaveatsSection(engineResult);
  const sustainability = buildSustainabilitySection(engineResult.sustainability ?? {});
  const nextQuestions = buildNextQuestionsSection(scenarios, caveats);
  const changeLog = buildChangeLogSection({ generatedAt, schemaVersion });

  const sections = {
    disclaimer,
    profile,
    accounts,
    scenarios,
    assumptions,
    caveats,
    sustainability,
    next_questions: nextQuestions,
    change_log: changeLog
  };

  const metadata = {
    generated_at: generatedAt,
    schema_version: schemaVersion,
    household_id: household.household_id,
    scenario_name: scenario.name,
    disclaimer: disclaimer.content
  };

  const html = replaceTokens(TEMPLATE, {
    reportTitle: `OpenWealth Report - ${household.name}`,
    reportSubtitle: `Scenario: ${scenario.name} | Generated: ${generatedAt}`,
    disclaimer: disclaimer.content,
    profileLine: `${profile.name} (${profile.province_or_territory}) - ${profile.people.length} person(s)`,
    totalBalance: accounts.total_balance,
    finalNetWorth: scenarios.summary.finalNetWorth ?? "n/a",
    totalUnfunded: scenarios.summary.totalUnfunded ?? "n/a",
    assumptionsJson: JSON.stringify(assumptions.values, null, 2),
    warningsJson: JSON.stringify(caveats.warnings, null, 2),
    sustainabilityJson: JSON.stringify(sustainability, null, 2),
    nextQuestionsJson: JSON.stringify(nextQuestions.questions, null, 2),
    changeLogJson: JSON.stringify(changeLog.entries, null, 2),
    metadataJson: JSON.stringify(metadata)
  });

  return {
    metadata,
    sections,
    html
  };
}
