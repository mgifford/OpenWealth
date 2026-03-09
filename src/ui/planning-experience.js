import { runDeterministicEngine } from "../engine/index.js";
import { buildAssumptionsPanel } from "../components/assumptions-panel.js";
import { createEmptyState, createErrorState, createLoadingState } from "../components/state-panels/index.js";
import { createOnboardingDraft, applyOnboardingStep, finalizeOnboardingDraft } from "./onboarding/index.js";
import { applyAccountEdit } from "./accounts/index.js";
import { buildScenarioDraft } from "./scenarios/index.js";
import { buildScenarioComparison } from "./comparison/index.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createPlanningExperience(dependencies) {
  const householdRepository = dependencies.householdRepository;
  const scenarioRepository = dependencies.scenarioRepository;
  const engineRunner = dependencies.engineRunner ?? runDeterministicEngine;

  return {
    async initialize() {
      const household = await householdRepository.load();
      const scenarios = await scenarioRepository.list();

      if (!household) {
        return {
          household: null,
          scenarios,
          state: createEmptyState()
        };
      }

      return {
        household,
        scenarios,
        state: null
      };
    },

    createOnboardingDraft,
    applyOnboardingStep,

    async completeOnboarding(draft, options = {}) {
      const household = finalizeOnboardingDraft(draft, options);
      const saved = await householdRepository.save(household);

      return {
        household: saved,
        state: null
      };
    },

    async saveAccount(accountInput, options = {}) {
      const household = await householdRepository.load();
      if (!household) {
        throw new Error("Cannot save account before onboarding");
      }

      const updated = applyAccountEdit(household, accountInput, options);
      const saved = await householdRepository.save(updated);
      return saved;
    },

    async createScenario(input, options = {}) {
      const household = await householdRepository.load();
      if (!household) {
        throw new Error("Cannot create scenario without a household");
      }

      const scenario = buildScenarioDraft(
        {
          ...input,
          base_household_id: household.household_id
        },
        options
      );
      return scenarioRepository.save(scenario);
    },

    async runScenario(scenarioId, options = {}) {
      const household = await householdRepository.load();
      if (!household) {
        return {
          scenario: null,
          engineResult: null,
          state: createErrorState(new Error("Missing household data"))
        };
      }

      const scenarios = await scenarioRepository.list();
      const scenario = scenarios.find((entry) => entry.scenario_id === scenarioId);
      if (!scenario) {
        return {
          scenario: null,
          engineResult: null,
          state: createErrorState(new Error(`Scenario not found: ${scenarioId}`))
        };
      }

      const loading = createLoadingState();
      const engineInput = {
        household: clone(household),
        scenario,
        currentAge: options.currentAge
      };
      const engineResult = engineRunner(engineInput);

      return {
        scenario,
        engineResult,
        assumptionsPanel: buildAssumptionsPanel(engineResult, scenario),
        state: loading
      };
    },

    async compareScenarios(scenarioIds, options = {}) {
      const runs = [];

      for (const scenarioId of scenarioIds) {
        const result = await this.runScenario(scenarioId, options);
        if (result.engineResult) {
          runs.push(result);
        }
      }

      if (!runs.length) {
        return {
          comparison: null,
          state: createErrorState(new Error("No valid scenarios to compare"))
        };
      }

      return {
        comparison: buildScenarioComparison(runs),
        state: null
      };
    }
  };
}
