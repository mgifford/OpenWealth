import { createIndexedDbStore } from "../storage/indexeddb-store.js";
import { createLocalSettingsAdapter } from "../storage/local-settings.js";
import { createHouseholdRepository, createScenarioRepository } from "../state/index.js";
import {
  createPlanningExperience,
  renderComparisonTable,
  buildMetricDisclosure,
  renderMetricDisclosure,
  buildAlternativesPanel,
  renderAlternativesPanel,
  createPromptPackage,
  pickRandomRetirementPersona,
  applyPersonaToFormValues
} from "../ui/index.js";
import {
  renderAssumptionsPanel,
  createEmptyState,
  renderEmptyState,
  createErrorState,
  renderErrorState,
  createLoadingState,
  renderLoadingState,
  createStaleState,
  renderStaleState
} from "../components/index.js";
import { buildReportBundle, createBundleDownloadPayload } from "../ui/export/index.js";

const store = createIndexedDbStore("openwealth-ui");
const settings = createLocalSettingsAdapter("openwealth-ui");
const householdRepository = createHouseholdRepository({ store });
const scenarioRepository = createScenarioRepository({ store });
const experience = createPlanningExperience({ householdRepository, scenarioRepository });

let lastRun = null;
let activePersona = null;

function el(id) {
  return document.getElementById(id);
}

function setStatus(message, isError = false) {
  const node = el("status");
  node.textContent = message;
  node.dataset.error = isError ? "true" : "false";
  node.setAttribute("role", isError ? "alert" : "status");
}

function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === "auto") {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = theme;
  }
  settings.set("theme", theme);
  el("theme-mode").textContent = theme;
  el("theme-toggle").setAttribute("aria-label", `Color theme mode: ${theme}`);
}

function nextTheme(currentTheme) {
  if (currentTheme === "auto") {
    return "light";
  }
  if (currentTheme === "light") {
    return "dark";
  }
  return "auto";
}

function downloadTextFile(payload) {
  const blob = new Blob([payload.data], { type: payload.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = payload.fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function updatePersonaPanel(persona) {
  el("persona-card").innerHTML = `
    <p><strong>${persona.title}</strong> (${persona.lifestyle})</p>
    <p>${persona.summary}</p>
    <p>Retirement goal range: ${persona.retirement_goal_range}</p>
    <p>Life expectancy range: ${persona.life_expectancy_range.min}-${persona.life_expectancy_range.max}</p>
  `;
}

function applyPersonaToUi(persona) {
  const values = applyPersonaToFormValues(persona);
  el("household-name").value = values.householdName;
  el("person-name").value = values.personName;
  el("starter-balance").value = values.starterBalance;
  el("retirement-target").value = values.retirementTargetAge;
  el("scenario-name").value = values.scenarioName;
  el("scenario-retirement").value = values.scenarioRetirementAge;
  el("annual-spending").value = values.annualSpending;
  el("projection-years").value = values.projectionYears;
  el("cpp-age").value = values.cppAge;
  el("oas-age").value = values.oasAge;
  el("strategy").value = values.strategy;
  el("retirement-goal-range").textContent = values.retirementGoalRange;
  el("life-expectancy-range").textContent = values.lifeExpectancyRange;
}

async function refreshOverview() {
  const state = await experience.initialize();
  const household = state.household;
  const scenarios = state.scenarios;

  el("overview").innerHTML = household
    ? `<p><strong>${household.name}</strong> (${household.province_or_territory})</p><p>Accounts: ${household.accounts.length}</p><p>Scenarios: ${scenarios.length}</p>`
    : renderEmptyState(createEmptyState());

  if (household?.updated_at) {
    el("stale-state").innerHTML = renderStaleState(createStaleState(household.updated_at));
  } else {
    el("stale-state").innerHTML = "";
  }

  const selector = el("scenario-select");
  selector.innerHTML = scenarios
    .map((scenario) => `<option value="${scenario.scenario_id}">${scenario.name}</option>`)
    .join("");

  return { household, scenarios };
}

async function onOnboard(event) {
  event.preventDefault();
  try {
    let draft = experience.createOnboardingDraft();
    draft = experience.applyOnboardingStep(draft, "household", {
      name: el("household-name").value,
      province_or_territory: el("province").value
    });
    draft = experience.applyOnboardingStep(draft, "people", {
      people: [
        {
          display_name: el("person-name").value,
          birth_year: Number(el("birth-year").value),
          retirement_target_age: Number(el("retirement-target").value)
        }
      ]
    });
    draft = experience.applyOnboardingStep(draft, "accounts", {
      accounts: [
        {
          account_type: "tfsa",
          current_balance: Number(el("starter-balance").value),
          annual_contribution: 7000,
          confidence: "high",
          user_verified: true
        }
      ]
    });

    await experience.completeOnboarding(draft);
    await refreshOverview();
    setStatus("Onboarding saved.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function onCreateScenario(event) {
  event.preventDefault();
  try {
    await experience.createScenario({
      name: el("scenario-name").value,
      retirement_age: Number(el("scenario-retirement").value),
      cpp_start_age: Number(el("cpp-age").value),
      oas_start_age: Number(el("oas-age").value),
      withdrawal_strategy: el("strategy").value,
      annual_spending: Number(el("annual-spending").value),
      projection_years: Number(el("projection-years").value)
    });

    await refreshOverview();
    setStatus("Scenario created.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function onRunScenario() {
  try {
    const scenarioId = el("scenario-select").value;
    el("results").innerHTML = renderLoadingState(createLoadingState());

    const result = await experience.runScenario(scenarioId, { currentAge: 38 });

    if (result.state?.kind === "error") {
      throw new Error(result.state.message);
    }

    lastRun = result;
    const sustainabilityDisclosure = renderMetricDisclosure(
      buildMetricDisclosure(result.engineResult.sustainability.metrics)
    );
    const alternativesPanel = renderAlternativesPanel(
      buildAlternativesPanel(
        result.engineResult.sustainability.metrics,
        result.engineResult.sustainability.preferences
      )
    );

    el("results").innerHTML = `
      <p><strong>${result.scenario.name}</strong></p>
      <p>Final net worth: ${Math.round(result.engineResult.projection.summary.finalNetWorth)}</p>
      <p>Total unfunded: ${Math.round(result.engineResult.projection.summary.totalUnfunded)}</p>
      ${renderAssumptionsPanel(result.assumptionsPanel)}
      <h3>Sustainability disclosure</h3>
      ${sustainabilityDisclosure}
      ${alternativesPanel}
    `;
    setStatus("Scenario run complete.");
  } catch (error) {
    el("results").innerHTML = renderErrorState(createErrorState(error));
    setStatus(error.message, true);
  }
}

async function onCompareScenarios() {
  try {
    const { scenarios } = await refreshOverview();
    const comparisonResult = await experience.compareScenarios(
      scenarios.map((scenario) => scenario.scenario_id),
      { currentAge: 38 }
    );

    if (comparisonResult.state?.kind === "error") {
      throw new Error(comparisonResult.state.message);
    }

    el("comparison").innerHTML = renderComparisonTable(comparisonResult.comparison);
    setStatus("Scenario comparison updated.");
  } catch (error) {
    el("comparison").innerHTML = renderErrorState(createErrorState(error));
    setStatus(error.message, true);
  }
}

async function onExportBundle() {
  try {
    if (!lastRun) {
      throw new Error("Run a scenario before exporting a report bundle.");
    }

    const household = await householdRepository.load();
    const bundleOutput = buildReportBundle({
      household,
      scenario: lastRun.scenario,
      engineResult: lastRun.engineResult
    });

    const payload = createBundleDownloadPayload(
      bundleOutput.serializedBundle,
      bundleOutput.bundle.bundle_name
    );

    downloadTextFile(payload);
    setStatus("Bundle generated and downloaded.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function onGeneratePrompt() {
  try {
    if (!lastRun) {
      throw new Error("Run a scenario before generating a prompt package.");
    }

    const promptPackage = createPromptPackage({
      scenario: lastRun.scenario,
      engineResult: lastRun.engineResult,
      generatedAt: new Date().toISOString()
    });

    el("prompt-output").value = promptPackage.prompt_text;
    setStatus("Prompt package generated.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function onRandomPersona() {
  activePersona = pickRandomRetirementPersona();
  updatePersonaPanel(activePersona);
  setStatus(`Loaded persona: ${activePersona.title}`);
}

function onApplyPersona() {
  try {
    if (!activePersona) {
      throw new Error("Pick a random persona first.");
    }

    applyPersonaToUi(activePersona);
    setStatus(`Applied persona assumptions: ${activePersona.title}`);
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function init() {
  applyTheme(settings.get("theme", "auto"));
  await refreshOverview();

  el("theme-toggle").addEventListener("click", () => {
    const current = settings.get("theme", "auto");
    applyTheme(nextTheme(current));
  });

  el("onboarding-form").addEventListener("submit", onOnboard);
  el("scenario-form").addEventListener("submit", onCreateScenario);
  el("run-scenario").addEventListener("click", onRunScenario);
  el("compare-scenarios").addEventListener("click", onCompareScenarios);
  el("export-bundle").addEventListener("click", onExportBundle);
  el("generate-prompt").addEventListener("click", onGeneratePrompt);
  el("random-persona").addEventListener("click", onRandomPersona);
  el("apply-persona").addEventListener("click", onApplyPersona);

  onRandomPersona();
  setStatus("Ready.");
}

init();
