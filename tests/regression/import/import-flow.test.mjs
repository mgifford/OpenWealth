import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createIndexedDbStore } from "../../../src/storage/indexeddb-store.js";
import { createHouseholdRepository, createSnapshotService } from "../../../src/state/index.js";
import { createProvenanceRecorder, previewImport, applyImport, parseImportContent } from "../../../src/imports/index.js";
import { approveAll } from "../../../src/ui/import-approval.js";

function fixture(name) {
  return readFileSync(join(process.cwd(), "tests", "fixtures", "import", name), "utf8");
}

function fixtureJson(name) {
  return JSON.parse(fixture(name));
}

test("parsers handle JSON, YAML, and CSV formats", () => {
  const parsedJson = parseImportContent("json", fixture("import-update.json"));
  const parsedYaml = parseImportContent("yaml", fixture("import-update.yaml"));
  const parsedCsv = parseImportContent("csv", fixture("import-update.csv"));

  assert.equal(Array.isArray(parsedJson.accounts), true);
  assert.equal(Array.isArray(parsedYaml.accounts), true);
  assert.equal(Array.isArray(parsedCsv.records), true);
});

test("malformed CSV is rejected", () => {
  assert.throws(
    () => parseImportContent("csv", fixture("import-malformed.csv")),
    /CSV import requires a header and at least one data row/
  );
});

test("preview exposes diff and unknown CSV headers", () => {
  const canonical = fixtureJson("canonical-household.json");
  const preview = previewImport({
    format: "csv",
    content: fixture("import-update.csv"),
    canonicalHousehold: canonical
  });

  assert.ok(preview.diff.proposedChanges.length >= 1);
  assert.ok(preview.diagnostics.unknownHeaders.includes("unexpected_column"));
});

test("apply only approved changes and leaves unrelated fields untouched", async () => {
  const store = createIndexedDbStore("wp05-apply-store");
  const householdRepo = createHouseholdRepository({ store });
  const snapshotService = createSnapshotService({ store });
  const provenanceRecorder = createProvenanceRecorder({ store });

  const canonical = fixtureJson("canonical-household.json");
  await householdRepo.save(canonical);

  const preview = previewImport({
    format: "json",
    content: fixture("import-update.json"),
    canonicalHousehold: canonical
  });

  const targetChange = preview.diff.proposedChanges.find(
    (change) => change.path === "/accounts/acc_tfsa/current_balance"
  );

  const result = await applyImport({
    preview,
    approvedChangeIds: targetChange ? [targetChange.change_id] : [],
    sourceFile: "import-update.json",
    repositories: {
      householdRepository: householdRepo,
      snapshotService,
      provenanceRecorder
    }
  });

  assert.equal(result.applied, 1);

  const saved = await householdRepo.load();
  const tfsa = saved.accounts.find((account) => account.account_id === "acc_tfsa");
  const rrsp = saved.accounts.find((account) => account.account_id === "acc_rrsp");

  assert.equal(tfsa.current_balance, 12000);
  assert.equal(rrsp.current_balance, 25000);
});

test("approved merge always creates snapshot and provenance entries", async () => {
  const store = createIndexedDbStore("wp05-snapshot-provenance-store");
  const householdRepo = createHouseholdRepository({ store });
  const snapshotService = createSnapshotService({ store });
  const provenanceRecorder = createProvenanceRecorder({ store });

  const canonical = fixtureJson("canonical-household.json");
  await householdRepo.save(canonical);

  const preview = previewImport({
    format: "yaml",
    content: fixture("import-update.yaml"),
    canonicalHousehold: canonical
  });

  const approved = approveAll(preview.diff);
  const applyResult = await applyImport({
    preview,
    approvedChangeIds: approved,
    sourceFile: "import-update.yaml",
    repositories: {
      householdRepository: householdRepo,
      snapshotService,
      provenanceRecorder
    }
  });

  const snapshots = await snapshotService.listSnapshots();
  const provenance = await provenanceRecorder.list();

  assert.ok(applyResult.applied >= 1);
  assert.equal(snapshots.length, 1);
  assert.ok(provenance.length >= 1);
});

test("heuristic matches are flagged for manual review", () => {
  const canonical = fixtureJson("canonical-household.json");
  const payload = {
    accounts: [
      {
        account_type: "tfsa",
        ownership: "individual",
        currency: "CAD",
        current_balance: 14000,
        institution: "Maple Bank",
        last_updated: "2026-03-12"
      }
    ]
  };

  const preview = previewImport({
    format: "json",
    content: JSON.stringify(payload),
    canonicalHousehold: canonical
  });

  assert.ok(preview.diff.proposedChanges.some((change) => change.requires_manual_review));
});
