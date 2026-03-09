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
  "run-scenario",
  "compare-scenarios",
  "export-bundle",
  "show-market-trends",
  "generate-prompt"
];

test("ui contract: required action buttons are present in index.html", () => {
  for (const buttonId of REQUIRED_BUTTON_IDS) {
    assert.match(indexHtml, new RegExp(`id=["']${buttonId}["']`));
  }
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

test("ui contract: main app wires click handlers for key buttons", () => {
  const expectedWiring = [
    ["theme-toggle", "applyUserThemeToggle"],
    ["run-scenario", "onRunScenario"],
    ["compare-scenarios", "onCompareScenarios"],
    ["export-bundle", "onExportBundle"],
    ["show-market-trends", "onShowMarketTrends"],
    ["generate-prompt", "onGeneratePrompt"],
    ["random-persona", "onRandomPersona"],
    ["apply-persona", "onApplyPersona"],
    ["run-persona-carousel", "onPersonaCarousel"]
  ];

  for (const [buttonId, handler] of expectedWiring) {
    assert.match(appMain, new RegExp(`el\\(["']${buttonId}["']\\)\\.addEventListener\\(["']click["'],\\s*${handler}`));
  }

  assert.match(appMain, /button\.return-preset/);
  assert.match(appMain, /applyReturnPreset/);
  assert.match(appMain, /button\.inflation-preset/);
  assert.match(appMain, /applyInflationPreset/);
});
