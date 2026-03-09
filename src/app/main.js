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
  applyPersonaToFormValues,
  listRetirementPersonas,
  buildProjectionSeries,
  renderProjectionChartSvg
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
const assumptionProvenance = {
  expected_return: "manual_slider",
  inflation_rate: "manual_slider",
  source: "user"
};
const prefersDarkScheme =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function el(id) {
  return document.getElementById(id);
}

function setStatus(message, isError = false) {
  const node = el("status");
  node.textContent = message;
  node.dataset.error = isError ? "true" : "false";
  node.setAttribute("role", isError ? "alert" : "status");
}

function updateThemeControls(theme, source) {
  const nextAction = theme === "dark" ? "light" : "dark";
  el("theme-mode").textContent = source === "system" ? `${theme} (system)` : theme;
  el("theme-toggle").setAttribute("aria-label", `Switch to ${nextAction} mode`);
  el("theme-toggle").setAttribute("title", `Switch to ${nextAction} mode`);
  el("theme-toggle").setAttribute("aria-pressed", String(theme === "dark"));
}

function applyTheme(theme, source = "user") {
  const root = document.documentElement;
  root.dataset.theme = theme;
  updateThemeControls(theme, source);
}

function resolveInitialTheme() {
  const savedTheme = settings.get("theme", null);
  if (savedTheme === "light" || savedTheme === "dark") {
    return { theme: savedTheme, source: "user" };
  }

  const systemTheme = prefersDarkScheme?.matches ? "dark" : "light";
  return { theme: systemTheme, source: "system" };
}

function applyUserThemeToggle() {
  const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";
  settings.set("theme", nextTheme);
  applyTheme(nextTheme, "user");
}

function onSystemThemeChange(event) {
  const savedTheme = settings.get("theme", null);
  if (savedTheme === "light" || savedTheme === "dark") {
    return;
  }

  applyTheme(event.matches ? "dark" : "light", "system");
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
  el("household-mode").value = "single";
  syncHouseholdModeUi();
  syncAllRangeOutputs();
}

function formatPercent(value) {
  return `${(Number(value) * 100).toFixed(1)}%`;
}

function formatCurrency(value) {
  return `$${Math.round(Number(value)).toLocaleString()}`;
}

function formatRangeOutput(input) {
  const outputId = input.dataset.output;
  if (!outputId) {
    return;
  }

  let displayValue = input.value;
  if (
    [
      "annual-spending",
      "rrsp-balance",
      "nonreg-balance",
      "annual-income",
      "mortgage-balance",
      "debt-payment",
      "workplace-pension-income"
    ].includes(input.id)
  ) {
    displayValue = formatCurrency(input.value);
  } else if (
    ["expected-return", "inflation-rate", "mortgage-interest-rate"].includes(input.id)
  ) {
    displayValue = formatPercent(input.value);
  }

  el(outputId).textContent = displayValue;
}

function syncAllRangeOutputs() {
  document.querySelectorAll("input[type='range'][data-output]").forEach((input) => {
    formatRangeOutput(input);
  });
}

function syncHouseholdModeUi() {
  const isCouple = el("household-mode").value === "couple";
  el("partner-fields").hidden = !isCouple;
  el("partner-name").required = isCouple;
  el("partner-birth-year").required = isCouple;
  el("partner-retirement-target").required = isCouple;
}

function renderSensitivityChart(sensitivityRows) {
  const rows = sensitivityRows
    .map((row) => ({
      id: row.id,
      expectedReturn: Number(row.assumptions.expectedReturn ?? 0),
      finalNetWorth: Number(row.finalNetWorth ?? 0),
      totalUnfunded: Number(row.totalUnfunded ?? 0)
    }))
    .sort((left, right) => left.expectedReturn - right.expectedReturn);

  if (!rows.length) {
    return "<p>No market trend scenarios available.</p>";
  }

  const width = 760;
  const height = 260;
  const padding = 26;
  const minReturn = rows[0].expectedReturn;
  const maxReturn = rows[rows.length - 1].expectedReturn;
  const maxNetWorth = Math.max(1, ...rows.map((row) => row.finalNetWorth));

  const xFor = (value) => {
    if (maxReturn === minReturn) {
      return padding;
    }
    return padding + ((value - minReturn) / (maxReturn - minReturn)) * (width - padding * 2);
  };

  const yFor = (value) => height - padding - (value / maxNetWorth) * (height - padding * 2);
  const linePoints = rows.map((row) => `${xFor(row.expectedReturn)},${yFor(row.finalNetWorth)}`).join(" ");
  const pointMarkers = rows
    .map(
      (row) =>
        `<circle cx="${xFor(row.expectedReturn)}" cy="${yFor(row.finalNetWorth)}" r="2.5" fill="#0d7a63" />`
    )
    .join("");
  const finalLabel = rows.at(-1);
  const labelMarkup = finalLabel
    ? `<text x="${xFor(finalLabel.expectedReturn) + 8}" y="${yFor(finalLabel.finalNetWorth) - 4}" fill="#0d7a63" font-size="10">${formatCurrency(finalLabel.finalNetWorth)}</text>`
    : "";

  const tableRows = rows
    .map(
      (row) =>
        `<tr><th scope="row">${row.id}</th><td>${formatPercent(row.expectedReturn)}</td><td>${formatCurrency(row.finalNetWorth)}</td><td>${formatCurrency(row.totalUnfunded)}</td></tr>`
    )
    .join("");

  return `
    <figure>
      <figcaption>Growth-rate trend: expected return vs final net worth</figcaption>
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="market-trend-title market-trend-desc">
        <title id="market-trend-title">Market trend sensitivity chart</title>
        <desc id="market-trend-desc">Line chart showing how final net worth changes as expected return assumptions increase.</desc>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="currentColor" stroke-opacity="0.4" />
        <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="currentColor" stroke-opacity="0.4" />
        <polyline fill="none" stroke="#0d7a63" stroke-width="2" points="${linePoints}" />
        ${pointMarkers}
        ${labelMarkup}
      </svg>
    </figure>
    <table>
      <caption>Market trend scenarios</caption>
      <thead><tr><th scope="col">Variant</th><th scope="col">Expected return</th><th scope="col">Final net worth</th><th scope="col">Total unfunded</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;
}

async function onShowMarketTrends() {
  try {
    const scenarioId = el("scenario-select").value;
    if (!scenarioId) {
      throw new Error("Create and select a scenario first.");
    }

    const result = await experience.runScenario(scenarioId, { currentAge: 38 });
    if (!result.engineResult) {
      throw new Error("Unable to generate market trends for this scenario.");
    }

    const sensitivityRows = result.engineResult.sensitivity ?? [];
    el("market-trends").innerHTML = renderSensitivityChart(sensitivityRows);
    setStatus("Market trend scenarios updated.");
  } catch (error) {
    el("market-trends").innerHTML = renderErrorState(createErrorState(error));
    setStatus(error.message, true);
  }
}

function renderProjectionChart(result) {
  const projection = result.engineResult.projection.annualProjection ?? [];
  const series = buildProjectionSeries(projection);
  return renderProjectionChartSvg(series, {
    title: `Income projection - ${result.scenario.name}`,
    description:
      "Shows benefits income, planned withdrawals, and spending need over the scenario projection horizon."
  });
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
    const householdMode = el("household-mode").value;

    let draft = experience.createOnboardingDraft();
    draft = experience.applyOnboardingStep(draft, "household", {
      name: el("household-name").value,
      province_or_territory: el("province").value,
      household_composition: householdMode
    });

    const people = [
      {
        display_name: el("person-name").value,
        birth_year: Number(el("birth-year").value),
        retirement_target_age: Number(el("retirement-target").value)
      }
    ];

    if (householdMode === "couple") {
      people.push({
        display_name: el("partner-name").value,
        birth_year: Number(el("partner-birth-year").value),
        retirement_target_age: Number(el("partner-retirement-target").value)
      });
    }

    draft = experience.applyOnboardingStep(draft, "people", {
      people
    });
    draft = experience.applyOnboardingStep(draft, "accounts", {
      accounts: [
        {
          account_type: "tfsa",
          current_balance: Number(el("starter-balance").value),
          annual_contribution: 7000,
          confidence: "high",
          user_verified: true
        },
        {
          account_type: "rrsp",
          current_balance: Number(el("rrsp-balance").value),
          annual_contribution: 12000,
          confidence: "medium",
          user_verified: true
        },
        {
          account_type: "non_registered",
          current_balance: Number(el("nonreg-balance").value),
          annual_contribution: 6000,
          confidence: "medium",
          user_verified: true
        }
      ]
    });
    draft = experience.applyOnboardingStep(draft, "financials", {
      current_income: Number(el("annual-income").value),
      mortgage_balance: Number(el("mortgage-balance").value),
      debt_payment: Number(el("debt-payment").value),
      mortgage_interest_rate: Number(el("mortgage-interest-rate").value)
    });
    draft = experience.applyOnboardingStep(draft, "benefits", {
      workplace_pension_income: Number(el("workplace-pension-income").value),
      preferred_cpp_start_age: Number(el("preferred-cpp-age").value),
      preferred_oas_start_age: Number(el("preferred-oas-age").value)
    });

    await experience.completeOnboarding(draft);
    await refreshOverview();
    setStatus("Onboarding saved.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function applyMarketPreset(button) {
  const presetName = button.dataset.name ?? "Preset";
  const presetReturn = Number(button.dataset.return ?? 0.05);
  const presetInflation = Number(button.dataset.inflation ?? 0.025);

  el("expected-return").value = String(presetReturn);
  el("inflation-rate").value = String(presetInflation);
  el("scenario-name").value = `${presetName} Scenario`;
  assumptionProvenance.expected_return = `preset:${presetName.toLowerCase()}`;
  assumptionProvenance.inflation_rate = `preset:${presetName.toLowerCase()}`;
  assumptionProvenance.source = "preset";
  syncAllRangeOutputs();
  setStatus(`${presetName} market preset applied.`);
}

function applyReturnPreset(button) {
  const presetReturn = Number(button.dataset.return ?? el("expected-return").value);
  el("expected-return").value = String(presetReturn);
  assumptionProvenance.expected_return = `return_preset:${formatPercent(presetReturn)}`;
  assumptionProvenance.source = "mixed";
  syncAllRangeOutputs();
  setStatus(`Expected return preset applied: ${formatPercent(presetReturn)}`);
}

function applyInflationPreset(button) {
  const presetInflation = Number(button.dataset.inflation ?? el("inflation-rate").value);
  el("inflation-rate").value = String(presetInflation);
  assumptionProvenance.inflation_rate = `inflation_preset:${formatPercent(presetInflation)}`;
  assumptionProvenance.source = "mixed";
  syncAllRangeOutputs();
  setStatus(`Inflation preset applied: ${formatPercent(presetInflation)}`);
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
      projection_years: Number(el("projection-years").value),
      expected_return: Number(el("expected-return").value),
      inflation_rate: Number(el("inflation-rate").value),
      assumptions_provenance: {
        ...assumptionProvenance
      }
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
      ${renderProjectionChart(result)}
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

async function ensurePersonaBaseline(persona) {
  const existing = await householdRepository.load();
  if (existing) {
    return existing;
  }

  let draft = experience.createOnboardingDraft();
  draft = experience.applyOnboardingStep(draft, "household", {
    name: `${persona.title} Household`,
    province_or_territory: "ON"
  });
  draft = experience.applyOnboardingStep(draft, "people", {
    people: [
      {
        display_name: persona.title,
        birth_year: 1988,
        retirement_target_age: persona.assumptions.retirement_target_age
      }
    ]
  });
  draft = experience.applyOnboardingStep(draft, "accounts", {
    accounts: [
      {
        account_type: "tfsa",
        current_balance: persona.assumptions.starter_balance,
        annual_contribution: 7000,
        confidence: "high",
        user_verified: true
      }
    ]
  });

  const onboarded = await experience.completeOnboarding(draft);
  return onboarded.household;
}

async function onPersonaCarousel() {
  try {
    const personas = listRetirementPersonas();
    await ensurePersonaBaseline(personas[0]);

    const scenarioIds = [];
    const cards = [];

    for (const persona of personas) {
      const scenario = await experience.createScenario({
        name: `${persona.title} Persona`,
        retirement_age: persona.assumptions.retirement_age,
        cpp_start_age: persona.assumptions.cpp_start_age,
        oas_start_age: persona.assumptions.oas_start_age,
        withdrawal_strategy: persona.assumptions.withdrawal_strategy,
        annual_spending: persona.assumptions.annual_spending,
        projection_years: persona.assumptions.projection_years
      });

      const runResult = await experience.runScenario(scenario.scenario_id, { currentAge: 38 });
      if (runResult.engineResult) {
        scenarioIds.push(scenario.scenario_id);
        cards.push(`
          <article>
            <h4>${persona.title}</h4>
            <p>Lifestyle: ${persona.lifestyle}</p>
            <p>Retirement goal: ${persona.retirement_goal_range}</p>
            <p>Life expectancy: ${persona.life_expectancy_range.min}-${persona.life_expectancy_range.max}</p>
            <p>Final net worth: ${Math.round(runResult.engineResult.projection.summary.finalNetWorth)}</p>
            <p>Total unfunded: ${Math.round(runResult.engineResult.projection.summary.totalUnfunded)}</p>
          </article>
        `);
      }
    }

    await refreshOverview();
    const comparisonResult = await experience.compareScenarios(scenarioIds, { currentAge: 38 });
    const comparisonTable = comparisonResult.comparison
      ? renderComparisonTable(comparisonResult.comparison)
      : "<p>No comparison available.</p>";

    el("persona-carousel-results").innerHTML = `
      <div class="grid">${cards.join("")}</div>
      <h3>Persona scenario comparison</h3>
      ${comparisonTable}
    `;

    setStatus("Persona carousel completed.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function init() {
  const initial = resolveInitialTheme();
  applyTheme(initial.theme, initial.source);
  await refreshOverview();

  el("theme-toggle").addEventListener("click", applyUserThemeToggle);

  if (prefersDarkScheme) {
    if (typeof prefersDarkScheme.addEventListener === "function") {
      prefersDarkScheme.addEventListener("change", onSystemThemeChange);
    } else if (typeof prefersDarkScheme.addListener === "function") {
      prefersDarkScheme.addListener(onSystemThemeChange);
    }
  }

  el("onboarding-form").addEventListener("submit", onOnboard);
  el("scenario-form").addEventListener("submit", onCreateScenario);
  el("run-scenario").addEventListener("click", onRunScenario);
  el("compare-scenarios").addEventListener("click", onCompareScenarios);
  el("export-bundle").addEventListener("click", onExportBundle);
  el("show-market-trends").addEventListener("click", onShowMarketTrends);
  el("generate-prompt").addEventListener("click", onGeneratePrompt);
  el("random-persona").addEventListener("click", onRandomPersona);
  el("apply-persona").addEventListener("click", onApplyPersona);
  el("run-persona-carousel").addEventListener("click", onPersonaCarousel);
  el("household-mode").addEventListener("change", syncHouseholdModeUi);

  document.querySelectorAll("input[type='range'][data-output]").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.id === "expected-return") {
        assumptionProvenance.expected_return = "manual_slider";
        assumptionProvenance.source = "user";
      }
      if (input.id === "inflation-rate") {
        assumptionProvenance.inflation_rate = "manual_slider";
        assumptionProvenance.source = "user";
      }
      formatRangeOutput(input);
    });
  });
  document.querySelectorAll("button.market-preset").forEach((button) => {
    button.addEventListener("click", () => applyMarketPreset(button));
  });
  document.querySelectorAll("button.return-preset").forEach((button) => {
    button.addEventListener("click", () => applyReturnPreset(button));
  });
  document.querySelectorAll("button.inflation-preset").forEach((button) => {
    button.addEventListener("click", () => applyInflationPreset(button));
  });
  syncAllRangeOutputs();
  syncHouseholdModeUi();

  onRandomPersona();
  setStatus("Ready.");
}

init();
