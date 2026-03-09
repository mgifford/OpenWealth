import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { runDeterministicEngine } from "../../../src/engine/index.js";
import {
  assembleReport,
  exportYamlArtifacts,
  buildManifest,
  packageReportBundle,
  serializeBundle
} from "../../../src/reports/index.js";

function readJson(relativePath) {
  const filePath = join(process.cwd(), relativePath);
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readText(relativePath) {
  const filePath = join(process.cwd(), relativePath);
  return readFileSync(filePath, "utf8");
}

function createInput() {
  const household = readJson("tests/fixtures/engine/base-household.json");
  const scenario = {
    ...readJson("tests/fixtures/engine/scenario-tfsa-first.json"),
    scenario_id: "scenario_report_001",
    name: "Report Baseline"
  };

  const engineResult = runDeterministicEngine({
    household,
    scenario,
    currentAge: 38,
    simulationOptions: { seed: 42, runs: 8, returnBound: 0.01 }
  });

  return { household, scenario, engineResult };
}

function deterministicOptions() {
  return {
    generatedAt: "2026-03-08T23:00:00Z",
    schemaVersion: "1.0.0",
    feature: "privacy-first-investment-context-dashboard",
    version: "v1"
  };
}

function sha256(content) {
  return createHash("sha256").update(content, "utf8").digest("hex");
}

test("report assembler outputs expected HTML golden file", () => {
  const output = assembleReport(createInput(), deterministicOptions());
  const expected = readText("tests/fixtures/reports/report.expected.html");

  assert.equal(output.html, expected);
  assert.match(output.html, /not financial advice/i);
  assert.match(output.html, /openwealth-report-metadata/);
});

test("YAML exporters match golden fixtures", () => {
  const artifacts = exportYamlArtifacts(createInput(), deterministicOptions());

  assert.equal(artifacts["household.yaml"], readText("tests/fixtures/reports/household.expected.yaml"));
  assert.equal(artifacts["assumptions.yaml"], readText("tests/fixtures/reports/assumptions.expected.yaml"));
  assert.equal(
    artifacts["scenario-results.yaml"],
    readText("tests/fixtures/reports/scenario-results.expected.yaml")
  );
});

test("bundle includes required artifacts and valid manifest checksums", () => {
  const input = createInput();
  const report = assembleReport(input, deterministicOptions());
  const yamlArtifacts = exportYamlArtifacts(input, deterministicOptions());

  const artifacts = {
    "report.html": report.html,
    ...yamlArtifacts
  };

  const manifest = buildManifest(input, artifacts, {
    generatedAt: deterministicOptions().generatedAt,
    schemaVersion: deterministicOptions().schemaVersion,
    bundleName: "openwealth-privacy-first-investment-context-dashboard-20260308-v1"
  });

  assert.equal(manifest.artifacts.length, 4);
  for (const artifact of manifest.artifacts) {
    assert.equal(artifact.sha256, sha256(artifacts[artifact.name]));
  }

  const bundle = packageReportBundle(input, artifacts, deterministicOptions());
  assert.equal(bundle.bundle_name, "openwealth-privacy-first-investment-context-dashboard-20260308-v1");
  assert.ok(bundle.files["manifest.json"]);

  const expectedManifest = readText("tests/fixtures/reports/manifest.expected.json");
  assert.equal(bundle.files["manifest.json"], expectedManifest);

  const serialized = serializeBundle(bundle);
  const externalBundle = JSON.parse(serialized);
  assert.equal(externalBundle.format, "application/vnd.openwealth.bundle+json");
  assert.equal(externalBundle.format_version, "1.1.0");
  assert.ok(externalBundle.bundle_sha256);
  assert.ok(externalBundle.manifest_sha256);
  assert.ok(Array.isArray(externalBundle.artifacts));
  assert.equal(externalBundle.artifacts.length, 5);
  assert.ok(externalBundle.artifacts.every((artifact) => artifact.content_base64.length > 0));
});
