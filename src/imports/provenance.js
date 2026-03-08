import { createIndexedDbStore } from "../storage/indexeddb-store.js";

const PROVENANCE_KEY = "provenance:log";

function nowIso() {
  return new Date().toISOString();
}

export function createProvenanceRecorder(options = {}) {
  const store = options.store ?? createIndexedDbStore(options.dbName ?? "openwealth-canonical");

  return {
    async append(changes, sourceFile, approvedByUser = true) {
      const existing = (await store.get(PROVENANCE_KEY)) ?? [];

      const nextEntries = changes.map((change) => ({
        field_path: change.path,
        old_value: change.old_value,
        new_value: change.new_value,
        source_file: sourceFile,
        imported_at: nowIso(),
        confidence: change.confidence >= 0.8 ? "high" : "medium",
        approved_by_user: approvedByUser
      }));

      const merged = existing.concat(nextEntries);
      await store.put(PROVENANCE_KEY, merged);
      return nextEntries;
    },

    async list() {
      return (await store.get(PROVENANCE_KEY)) ?? [];
    }
  };
}
