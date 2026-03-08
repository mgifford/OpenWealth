import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createIndexedDbStore } from "../../../src/storage/indexeddb-store.js";
import { createHouseholdRepository, createScenarioRepository, createSnapshotService } from "../../../src/state/index.js";
import { migratePersistedHouseholdOnStartup } from "../../../src/state/startup.js";
import { deterministicHash } from "../../../src/state/hash.js";

function fixture(name) {
  return JSON.parse(readFileSync(join(process.cwd(), "tests", "fixtures", "persistence", name), "utf8"));
}

function buildHousehold(overrides = {}) {
  return {
    schema_version: "1.0.0",
    household_id: "hh_persist_001",
    name: "Persistence Household",
    province_or_territory: "ON",
    people: [
      { person_id: "p_001", display_name: "Pat", birth_year: 1985 }
    ],
    accounts: [],
    goals: [],
    assumptions: {
      inflation_rate: 0.02,
      expected_return: 0.05,
      tax_year: 2026,
      cpp_start_age_options: [65],
      oas_start_age_options: [65]
    },
    ...overrides,
    updated_at: new Date().toISOString()
  };
}

test("household and scenario state persists across repository instances", async () => {
  const store = createIndexedDbStore("wp04-persist-store");
  const householdRepoA = createHouseholdRepository({ store });
  const scenarioRepoA = createScenarioRepository({ store });

  await householdRepoA.save(buildHousehold());
  await scenarioRepoA.save({
    scenario_id: "scn_001",
    name: "Base scenario",
    base_household_id: "hh_persist_001",
    overrides: []
  });

  const householdRepoB = createHouseholdRepository({ store });
  const scenarioRepoB = createScenarioRepository({ store });

  const household = await householdRepoB.load();
  const scenarios = await scenarioRepoB.list();

  assert.equal(household?.household_id, "hh_persist_001");
  assert.equal(scenarios.length, 1);
  assert.equal(scenarios[0].scenario_id, "scn_001");
});

test("snapshot rollback restores prior canonical hash", async () => {
  const store = createIndexedDbStore("wp04-snapshot-store");
  const householdRepo = createHouseholdRepository({ store });
  const snapshotService = createSnapshotService({ store });

  const original = await householdRepo.save(buildHousehold({ name: "Before change" }));
  const originalHash = deterministicHash(original);

  const snapshot = await snapshotService.createSnapshot("before-import");
  await householdRepo.save(buildHousehold({ name: "After change" }));

  await snapshotService.rollback(snapshot.snapshot_id);
  const rolledBack = await householdRepo.load();
  const rollbackHash = deterministicHash(rolledBack);

  assert.equal(rollbackHash, originalHash);
});

test("startup migration upgrades legacy household and preserves backup snapshot", async () => {
  const store = createIndexedDbStore("wp04-migration-store");
  const householdRepo = createHouseholdRepository({ store });
  const snapshotService = createSnapshotService({ store });

  await householdRepo.save(fixture("household-v0.9.0.json"));
  const result = await migratePersistedHouseholdOnStartup({
    householdRepository: householdRepo,
    snapshotService
  });

  assert.equal(result.migrated, true);
  assert.equal(result.migrationLog?.from, "0.9.0");
  assert.equal(result.migrationLog?.to, "1.0.0");

  const snapshots = await snapshotService.listSnapshots();
  assert.equal(snapshots.length, 1);

  const migrated = await householdRepo.load();
  assert.equal(migrated?.schema_version, "1.0.0");
  assert.ok(!!migrated?.updated_at);
});
