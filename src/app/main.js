import { createIndexedDbStore } from "../storage/indexeddb-store.js";
import { createHouseholdRepository, createScenarioRepository } from "../state/index.js";
import { createPlanningExperience, renderComparisonTable } from "../ui/index.js";
import { renderAssumptionsPanel } from "../components/assumptions-panel.js";
import { buildReportBundle, createBundleDownloadPayload } from "../ui/export/index.js";

const store = createIndexedDbStore("openwealth-ui");
const householdRepository = createHouseholdRepository({ store });
const scenarioRepository = createScenarioRepository({ store });
const experience = createPlanningExperience({ householdRepository, scenarioRepository });

let lastRun = null;

function el(id) {
  return document.getElementById(id);
}

function setStatus(message, isError = false) {
  const node = el("status");
  node.textContent = message;
  node.dataset.error = isError ? "true" : "false";
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

async function refreshOverview() {
  const state = await experience.initialize();
  const household = state.household;
  const scenarios = state.scenarios;

  el("overview").innerHTML = household
    ? `<p><strong>${household.name}</strong> (${household.province_or_territory})</p><p>Accounts: ${household.accounts.length}</p><p>Scenarios: ${scenarios.length}</p>`
    : `<p>No household saved yet. Use onboarding to create one.</p>`;

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
    const result = await experience.runScenario(scenarioId, { currentAge: 38 });

    if (result.state?.kind === "error") {
      throw new Error(result.state.message);
    }

    lastRun = result;
    el("results").innerHTML = `
      <p><strong>${result.scenario.name}</strong></p>
      <p>Final net worth: ${Math.round(result.engineResult.projection.summary.finalNetWorth)}</p>
      <p>Total unfunded: ${Math.round(result.engineResult.projection.summary.totalUnfunded)}</p>
      ${renderAssumptionsPanel(result.assumptionsPanel)}
    `;
    setStatus("Scenario run complete.");
  } catch (error) {
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

async function init() {
  await refreshOverview();
  el("onboarding-form").addEventListener("submit", onOnboard);
  el("scenario-form").addEventListener("submit", onCreateScenario);
  el("run-scenario").addEventListener("click", onRunScenario);
  el("compare-scenarios").addEventListener("click", onCompareScenarios);
  el("export-bundle").addEventListener("click", onExportBundle);
  setStatus("Ready.");
}

init();
