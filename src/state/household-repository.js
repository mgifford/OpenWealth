import { createIndexedDbStore } from "../storage/indexeddb-store.js";

const HOUSEHOLD_KEY = "household:canonical";

function nowIso() {
  return new Date().toISOString();
}

export function createHouseholdRepository(options = {}) {
  const store = options.store ?? createIndexedDbStore(options.dbName ?? "openwealth-canonical");

  return {
    async load() {
      return (await store.get(HOUSEHOLD_KEY)) ?? null;
    },

    async save(household) {
      const existing = await store.get(HOUSEHOLD_KEY);
      if (existing && existing.household_id !== household.household_id) {
        throw new Error("household_id is immutable for canonical state");
      }

      const toSave = {
        ...household,
        updated_at: nowIso()
      };

      await store.put(HOUSEHOLD_KEY, toSave);
      return toSave;
    },

    async update(mutator) {
      const current = (await store.get(HOUSEHOLD_KEY)) ?? null;
      const next = mutator(current);
      return this.save(next);
    }
  };
}
