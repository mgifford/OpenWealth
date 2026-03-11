import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const indexHtml = readFileSync(new URL("../../index.html", import.meta.url), "utf8");
const appMain = readFileSync(new URL("../../src/app/main.js", import.meta.url), "utf8");

const REQUIRED_BUTTON_IDS = [
  "theme-toggle",
  "random-persona",
  "apply-persona",
  "run-persona-carousel",
  "wizard-prev",
  "wizard-next",
  "run-scenario",
  "compare-scenarios",
  "export-bundle",
  "export-household-yaml",
  "import-household-yaml",
  "show-market-trends",
  "generate-prompt",
  "quick-intake-prev",
  "quick-intake-next",
  "apply-natural-language"
];

test("ui contract: required action buttons are present in index.html", () => {
  for (const buttonId of REQUIRED_BUTTON_IDS) {
    assert.match(indexHtml, new RegExp(`id=["']${buttonId}["']`));
  }
});

test("ui contract: guided wizard step buttons are present", () => {
  const wizardStepMatches = indexHtml.match(/class=["']wizard-step["']/g) ?? [];
  assert.equal(wizardStepMatches.length, 6);
  assert.match(indexHtml, /data-step=["']about-you["']/);
  assert.match(indexHtml, /data-step=["']market-assumptions["']/);
  assert.match(indexHtml, /data-step=["']results["']/);
});

test("ui contract: market preset buttons are visible with expected assumptions", () => {
  const presetMatches = indexHtml.match(/class=["']market-preset["']/g) ?? [];
  assert.ok(presetMatches.length >= 3, "expected at least 3 market preset buttons");

  assert.match(indexHtml, /data-name=["']Conservative["']/);
  assert.match(indexHtml, /data-name=["']Balanced["']/);
  assert.match(indexHtml, /data-name=["']Growth["']/);

  assert.match(indexHtml, /data-return=["']0\.04["']/);
  assert.match(indexHtml, /data-return=["']0\.055["']/);
  assert.match(indexHtml, /data-return=["']0\.07["']/);
});

test("ui contract: expected return and inflation preset buttons are present", () => {
  const returnPresetMatches = indexHtml.match(/class=["']return-preset["']/g) ?? [];
  const inflationPresetMatches = indexHtml.match(/class=["']inflation-preset["']/g) ?? [];

  assert.ok(returnPresetMatches.length >= 3, "expected at least 3 expected-return presets");
  assert.ok(inflationPresetMatches.length >= 3, "expected at least 3 inflation presets");

  assert.match(indexHtml, /class=["']return-preset["'][^>]*data-return=["']0\.04["']/);
  assert.match(indexHtml, /class=["']return-preset["'][^>]*data-return=["']0\.055["']/);
  assert.match(indexHtml, /class=["']return-preset["'][^>]*data-return=["']0\.07["']/);

  assert.match(indexHtml, /class=["']inflation-preset["'][^>]*data-inflation=["']0\.02["']/);
  assert.match(indexHtml, /class=["']inflation-preset["'][^>]*data-inflation=["']0\.025["']/);
  assert.match(indexHtml, /class=["']inflation-preset["'][^>]*data-inflation=["']0\.03["']/);
});

test("ui contract: look-ahead what-if slider is present", () => {
  assert.match(indexHtml, /id=["']look-ahead-spending-cut["']/);
  assert.match(indexHtml, /id=["']look-ahead-what-if["']/);
  assert.match(indexHtml, /id=["']inflation-cash-principal["']/);
  assert.match(indexHtml, /id=["']inflation-checking-rate["']/);
  assert.match(indexHtml, /id=["']inflation-high-yield-rate["']/);
  assert.match(indexHtml, /id=["']inflation-bond-rate["']/);
  assert.match(indexHtml, /id=["']stress-visual-mode["']/);
});

test("ui contract: guided tour persona selector and ARIA tooltips are present", () => {
  assert.match(indexHtml, /id=["']guided-tour-persona["']/);
  assert.match(indexHtml, /class=["']info-trigger["']/);
  assert.match(indexHtml, /role=["']tooltip["']/);
});

test("ui contract: save/load profile section appears before the prompt package section", () => {
  const saveLoadPos = indexHtml.indexOf('id="profile-save-load-heading"');
  const promptPackagePos = indexHtml.indexOf('id="prompt-package-heading"');
  assert.ok(saveLoadPos >= 0, "profile-save-load-heading element must exist");
  assert.ok(promptPackagePos >= 0, "prompt-package-heading element must exist");
  assert.ok(
    saveLoadPos < promptPackagePos,
    "Save / Load Profile section must appear before the Prompt Package section"
  );
  assert.match(indexHtml, /id=["']export-household-yaml["']/);
  assert.match(indexHtml, /id=["']import-household-yaml["']/);
  assert.match(indexHtml, /id=["']household-yaml-file["']/);
});

test("ui contract: results wizard step includes save-profile reminder", () => {
  assert.ok(
    indexHtml.includes('data-wizard-section="results"'),
    "results wizard section must exist"
  );
  assert.match(indexHtml, /Save your progress/);
  assert.match(indexHtml, /Save \/ Load Profile/);
});

test("ui contract: wizard bottom navigation buttons are present in each step section", () => {
  const prevMatches = indexHtml.match(/data-wizard-nav=["']prev["']/g) ?? [];
  const nextMatches = indexHtml.match(/data-wizard-nav=["']next["']/g) ?? [];

  assert.ok(prevMatches.length >= 7, `expected at least 7 data-wizard-nav="prev" buttons (top + one per step), found ${prevMatches.length}`);
  assert.ok(nextMatches.length >= 7, `expected at least 7 data-wizard-nav="next" buttons (top + one per step), found ${nextMatches.length}`);

  assert.match(indexHtml, /data-wizard-pane=["']about-you["'][^]*?data-wizard-nav=["']next["']/s);
  assert.match(indexHtml, /data-wizard-pane=["']savings["'][^]*?data-wizard-nav=["']next["']/s);
  assert.match(indexHtml, /data-wizard-pane=["']income["'][^]*?data-wizard-nav=["']next["']/s);
  assert.match(indexHtml, /data-wizard-pane=["']benefits["'][^]*?data-wizard-nav=["']next["']/s);
});

test("ui contract: main app wires click handlers for key buttons", () => {
  const expectedWiring = [
    ["theme-toggle", "applyUserThemeToggle"],
    ["run-scenario", "onRunScenario"],
    ["compare-scenarios", "onCompareScenarios"],
    ["export-bundle", "onExportBundle"],
    ["export-household-yaml", "onExportHouseholdYaml"],
    ["import-household-yaml", "onImportHouseholdYamlClick"],
    ["show-market-trends", "onShowMarketTrends"],
    ["generate-prompt", "onGeneratePrompt"],
    ["random-persona", "onRandomPersona"],
    ["apply-persona", "onApplyPersona"],
    ["run-persona-carousel", "onPersonaCarousel"],
    ["quick-intake-prev", "onQuickIntakePrevious"],
    ["quick-intake-next", "onQuickIntakeNext"],
    ["apply-natural-language", "onApplyNaturalLanguage"]
  ];

  for (const [buttonId, handler] of expectedWiring) {
    assert.match(appMain, new RegExp(`el\\(["']${buttonId}["']\\)\\.addEventListener\\(["']click["'],\\s*${handler}`));
  }

  assert.match(appMain, /button\.return-preset/);
  assert.match(appMain, /applyReturnPreset/);
  assert.match(appMain, /button\.inflation-preset/);
  assert.match(appMain, /applyInflationPreset/);
  assert.match(appMain, /\[data-wizard-nav=['"]prev['"]\].*onWizardPrevious|onWizardPrevious.*\[data-wizard-nav=['"]prev['"]\]/s);
  assert.match(appMain, /\[data-wizard-nav=['"]next['"]\].*onWizardNext|onWizardNext.*\[data-wizard-nav=['"]next['"]\]/s);
  assert.match(appMain, /button\.wizard-step/);
  assert.match(appMain, /goToWizardStep/);
  assert.match(
    appMain,
    /el\(["']data-entry-mode["']\)\.addEventListener\(["']change["'],\s*syncDataEntryModeUi/
  );
  assert.match(
    appMain,
    /el\(["']guided-tour-persona["']\)\.addEventListener\(["']change["'],\s*syncGuidedTourPersonaUi/
  );
  assert.match(
    appMain,
    /el\(["']household-yaml-file["']\)\.addEventListener\(["']change["'],\s*onImportHouseholdYamlFile/
  );
  assert.match(appMain, /look-ahead-spending-cut/);
  assert.match(appMain, /updateLookAheadWhatIf/);
  assert.match(appMain, /updateInflationRealityCheck/);
  assert.match(appMain, /el\(["']stress-visual-mode["']\)\.addEventListener\(["']change["']/);
  assert.match(appMain, /initializeInfoTooltips/);
});
