import { migrateToV1_0_0 } from "./v1-0-0.js";

const MIGRATIONS = {
  "0.9.0": migrateToV1_0_0,
  "1.0.0": (document) => document
};

export function migrateHouseholdDocument(document) {
  const startVersion = document.schema_version ?? "0.9.0";
  const migration = MIGRATIONS[startVersion];

  if (!migration) {
    throw new Error(`Unsupported schema version: ${startVersion}`);
  }

  const migrated = migration(document);
  return {
    migrated,
    migrationLog: {
      from: startVersion,
      to: migrated.schema_version,
      changed: JSON.stringify(migrated) !== JSON.stringify(document)
    }
  };
}
