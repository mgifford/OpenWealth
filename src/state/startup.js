import { createHouseholdRepository } from "./household-repository.js";
import { createSnapshotService } from "./snapshot-service.js";
import { migrateHouseholdDocument } from "./migrations/index.js";

export async function migratePersistedHouseholdOnStartup(options = {}) {
  const householdRepository = options.householdRepository ?? createHouseholdRepository(options);
  const snapshotService = options.snapshotService ?? createSnapshotService(options);

  const current = await householdRepository.load();
  if (!current) {
    return { migrated: false, migrationLog: null };
  }

  const { migrated, migrationLog } = migrateHouseholdDocument(current);

  if (!migrationLog.changed) {
    return { migrated: false, migrationLog };
  }

  await snapshotService.createSnapshot("pre-startup-migration");
  await householdRepository.save(migrated);

  return { migrated: true, migrationLog };
}
