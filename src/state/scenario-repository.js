import { createIndexedDbStore } from "../storage/indexeddb-store.js";

const SCENARIOS_KEY = "scenarios:list";

function nowIso() {
  return new Date().toISOString();
}

export function createScenarioRepository(options = {}) {
  const store = options.store ?? createIndexedDbStore(options.dbName ?? "openwealth-canonical");

  return {
    async list() {
      return (await store.get(SCENARIOS_KEY)) ?? [];
    },

    async save(scenario) {
      const scenarios = (await store.get(SCENARIOS_KEY)) ?? [];
      const existingIndex = scenarios.findIndex((entry) => entry.scenario_id === scenario.scenario_id);

      const normalized = {
        ...scenario,
        updated_at: nowIso()
      };

      if (existingIndex >= 0) {
        scenarios[existingIndex] = normalized;
      } else {
        scenarios.push(normalized);
      }

      await store.put(SCENARIOS_KEY, scenarios);
      return normalized;
    },

    async remove(scenarioId) {
      const scenarios = (await store.get(SCENARIOS_KEY)) ?? [];
      const filtered = scenarios.filter((entry) => entry.scenario_id !== scenarioId);
      await store.put(SCENARIOS_KEY, filtered);
      return filtered;
    }
  };
}
