import { createIndexedDbStore } from "../storage/indexeddb-store.js";
import { deterministicHash } from "./hash.js";

const CANONICAL_KEY = "household:canonical";
const SNAPSHOT_INDEX_KEY = "snapshots:index";

function nowIso() {
  return new Date().toISOString();
}

function createSnapshotId() {
  return `snap_${Date.now()}`;
}

export function createSnapshotService(options = {}) {
  const store = options.store ?? createIndexedDbStore(options.dbName ?? "openwealth-canonical");

  return {
    async createSnapshot(reason, bundleRefs = []) {
      const household = await store.get(CANONICAL_KEY);
      if (!household) {
        throw new Error("No canonical household state to snapshot");
      }

      const snapshotId = createSnapshotId();
      const capturedAt = nowIso();
      const stateHash = deterministicHash(household);
      const snapshotRecord = {
        snapshot_id: snapshotId,
        household_id: household.household_id,
        captured_at: capturedAt,
        reason,
        state_hash: stateHash,
        bundle_refs: bundleRefs,
        payload: household
      };

      await store.put(`snapshot:${snapshotId}`, snapshotRecord);

      const index = (await store.get(SNAPSHOT_INDEX_KEY)) ?? [];
      index.push({ snapshot_id: snapshotId, captured_at: capturedAt, reason, state_hash: stateHash });
      await store.put(SNAPSHOT_INDEX_KEY, index);

      return snapshotRecord;
    },

    async listSnapshots() {
      return (await store.get(SNAPSHOT_INDEX_KEY)) ?? [];
    },

    async loadSnapshot(snapshotId) {
      return (await store.get(`snapshot:${snapshotId}`)) ?? null;
    },

    async rollback(snapshotId) {
      const snapshot = await this.loadSnapshot(snapshotId);
      if (!snapshot) {
        throw new Error(`Snapshot not found: ${snapshotId}`);
      }

      await store.put(CANONICAL_KEY, snapshot.payload);

      return snapshot;
    }
  };
}
