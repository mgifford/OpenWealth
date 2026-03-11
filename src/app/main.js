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
  renderProjectionChartSvg,
  buildStressTestRangeSeries,
  buildStressTestAssumptionSummary,
  renderStressTestRangeChartSvg,
  renderLikelyNetWorthLineChartSvg,
  buildCoupleTimingOutcomes,
  renderCoupleTimingOutcomes,
  parseNaturalLanguageFinancialEstimate,
  computeSafetyBarValue,
  buildLookAheadMilestones,
  buildWhatIfImpact,
  buildSpendingNudges,
  renderLookAheadTldr,
  renderMilestonesPanel,
  renderNudgesPanel,
  renderWhatIfMessage,
  buildInflationRealityCheck,
  renderInflationRealityPanel,
  buildLiquidityBalance,
  renderLiquidityBalancePanel
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
import { stringifyYaml } from "../reports/yaml-stringify.js";
import { parseImportContent } from "../imports/index.js";
import { runDeterministicEngine } from "../engine/index.js";

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
const WIZARD_STEPS = [
  { id: "about-you", label: "About You" },
  { id: "savings", label: "Savings" },
  { id: "income", label: "Income" },
  { id: "benefits", label: "Benefits" },
  { id: "market-assumptions", label: "Market Assumptions" },
  { id: "results", label: "Results" }
];
let wizardStepIndex = 0;
let quickIntakeIndex = 0;
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

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
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
      "starter-balance",
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

const QUICK_INTAKE_QUESTIONS = [
  {
    prompt: "How much did you earn last month?",
    target: "annual-income",
    transform: (value) => Math.round(value * 12)
  },
  {
    prompt: "What is your biggest monthly bill?",
    target: "debt-payment",
    transform: (value) => value
  },
  {
    prompt: "Roughly how much cash do you have in checking/savings?",
    target: "starter-balance",
    transform: (value) => value
  },
  {
    prompt: "About how much do you have in RRSP savings?",
    target: "rrsp-balance",
    transform: (value) => value
  }
];

const GUIDED_TOUR_PROFILES = {
  student: {
    note: "Student focus: keeps essentials and monthly cash pressure visible while hiding advanced retirement details.",
    defaults: {
      "starter-balance": 2000,
      "annual-income": 36000,
      "debt-payment": 650,
      "mortgage-balance": 0,
      "workplace-pension-income": 0
    }
  },
  family: {
    note: "Family focus: keeps debt, income, and emergency planning front-and-center.",
    defaults: {
      "starter-balance": 120000,
      "annual-income": 95000,
      "debt-payment": 2100,
      "mortgage-balance": 350000,
      "workplace-pension-income": 0
    }
  },
  retirement: {
    note: "Retirement focus: highlights long-term savings and benefit timing decisions.",
    defaults: {
      "starter-balance": 200000,
      "annual-income": 110000,
      "debt-payment": 900,
      "mortgage-balance": 80000,
      "workplace-pension-income": 12000
    }
  }
};

function setGuidedFieldVisibility(node, visible) {
  node.hidden = !visible;
  node.querySelectorAll("input, select, textarea, button").forEach((control) => {
    if (!visible) {
      if (control.required) {
        control.dataset.requiredWhenVisible = "true";
        control.required = false;
      }
      control.disabled = true;
      return;
    }

    control.disabled = false;
    if (control.dataset.requiredWhenVisible === "true") {
      control.required = true;
      delete control.dataset.requiredWhenVisible;
    }
  });
}

function applyGuidedTourDefaults(profile) {
  Object.entries(profile.defaults).forEach(([fieldId, value]) => {
    applyEstimateToField(fieldId, value);
  });
}

function syncGuidedTourPersonaUi() {
  const persona = el("guided-tour-persona").value;
  const profile = GUIDED_TOUR_PROFILES[persona] ?? GUIDED_TOUR_PROFILES.family;
  el("guided-tour-note").textContent = profile.note;

  document.querySelectorAll("[data-guided-tags]").forEach((node) => {
    const tags = (node.dataset.guidedTags ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
    setGuidedFieldVisibility(node, tags.includes(persona));
  });

  applyGuidedTourDefaults(profile);
  syncAllRangeOutputs();
  updateSafetyBar();
}

function initializeInfoTooltips() {
  document.querySelectorAll(".info-trigger, .glossary-trigger").forEach((button) => {
    const tooltipId = button.getAttribute("aria-describedby");
    const tooltip = tooltipId ? document.getElementById(tooltipId) : null;
    if (!tooltip) {
      return;
    }

    const show = () => {
      tooltip.hidden = false;
      button.setAttribute("aria-expanded", "true");
    };
    const hide = () => {
      tooltip.hidden = true;
      button.setAttribute("aria-expanded", "false");
    };

    button.addEventListener("focus", show);
    button.addEventListener("blur", hide);
    button.addEventListener("mouseenter", show);
    button.addEventListener("mouseleave", hide);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        hide();
      }
    });
    button.addEventListener("click", () => {
      if (tooltip.hidden) {
        show();
      } else {
        hide();
      }
    });
  });
}

function renderPrimaryMetrics(totalSavings, monthlySurplus) {
  return `
    <section class="metric-primary-grid" aria-label="Primary plan metrics">
      <article class="metric-primary">
        <p class="label">Total savings now</p>
        <p class="value">${formatCurrency(totalSavings)}</p>
      </article>
      <article class="metric-primary">
        <p class="label">Monthly surplus</p>
        <p class="value">${formatCurrency(monthlySurplus)}</p>
      </article>
    </section>
  `;
}

function updateInflationRateOutputs() {
  el("inflation-checking-rate-output").textContent = formatPercent(el("inflation-checking-rate").value);
  el("inflation-high-yield-rate-output").textContent = formatPercent(el("inflation-high-yield-rate").value);
  el("inflation-bond-rate-output").textContent = formatPercent(el("inflation-bond-rate").value);
}

function buildInflationRealityHtml(scenario, household) {
  const inflationRate = Number(
    scenario?.inflation_rate ?? household?.assumptions?.inflation_rate ?? el("inflation-rate").value
  );
  const panel = buildInflationRealityCheck({
    principal: Number(el("inflation-cash-principal").value),
    checkingRate: Number(el("inflation-checking-rate").value),
    highYieldRate: Number(el("inflation-high-yield-rate").value),
    bondRate: Number(el("inflation-bond-rate").value),
    inflationRate
  });
  return renderInflationRealityPanel(panel);
}

async function updateInflationRealityCheck() {
  updateInflationRateOutputs();

  if (!lastRun?.scenario) {
    return;
  }

  const household = await householdRepository.load();
  const panelHtml = buildInflationRealityHtml(lastRun.scenario, household);
  const container = el("inflation-reality-container");
  if (container) {
    container.innerHTML = panelHtml;
    initializeInfoTooltips();
  }
}

function updateSafetyBar() {
  const monthlyIncome = Number(el("annual-income").value) / 12;
  const monthlyBill = Number(el("debt-payment").value);
  const safety = computeSafetyBarValue(monthlyIncome, monthlyBill);
  el("safety-bar-fill").style.width = `${safety}%`;
  el("safety-bar-label").textContent = `${safety}%`;
}

function applyEstimateToField(fieldId, value) {
  const node = el(fieldId);
  if (!node || !Number.isFinite(value) || value < 0) {
    return;
  }

  node.value = String(Math.round(value));
  formatRangeOutput(node);
}

function syncDataEntryModeUi() {
  const mode = el("data-entry-mode").value;
  const isEstimate = mode === "estimate";
  el("quick-intake-panel").hidden = !isEstimate;
  el("data-entry-mode-note").textContent = isEstimate
    ? "Start with rough numbers now. You can refine exact values later."
    : "Exact mode: enter precise values in the fields below.";
}

function syncQuickIntakeQuestion() {
  const question = QUICK_INTAKE_QUESTIONS[quickIntakeIndex];
  el("quick-intake-progress").textContent = `Question ${quickIntakeIndex + 1} of ${QUICK_INTAKE_QUESTIONS.length}`;
  el("quick-intake-question").textContent = question.prompt;

  const target = el(question.target);
  const currentValue = Number(target?.value ?? 0);
  const editableValue =
    question.target === "annual-income" ? Math.round(currentValue / 12) : Math.round(currentValue);
  el("quick-intake-answer").value = Number.isFinite(editableValue) ? String(editableValue) : "";
  el("quick-intake-prev").disabled = quickIntakeIndex === 0;
  el("quick-intake-next").textContent =
    quickIntakeIndex >= QUICK_INTAKE_QUESTIONS.length - 1 ? "Finish check-in" : "Next question";
}

function applyQuickIntakeAnswer() {
  const question = QUICK_INTAKE_QUESTIONS[quickIntakeIndex];
  const answer = Number(el("quick-intake-answer").value);

  if (!Number.isFinite(answer) || answer < 0) {
    throw new Error("Enter a non-negative estimate before continuing.");
  }

  applyEstimateToField(question.target, question.transform(answer));
  updateSafetyBar();
}

function onQuickIntakeNext() {
  try {
    applyQuickIntakeAnswer();

    if (quickIntakeIndex < QUICK_INTAKE_QUESTIONS.length - 1) {
      quickIntakeIndex += 1;
      syncQuickIntakeQuestion();
      return;
    }

    setStatus("Quick estimate check-in complete. You can run a first projection now.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function onQuickIntakePrevious() {
  if (quickIntakeIndex > 0) {
    quickIntakeIndex -= 1;
    syncQuickIntakeQuestion();
  }
}

function onApplyNaturalLanguage() {
  try {
    const text = el("quick-intake-text").value;
    const parsed = parseNaturalLanguageFinancialEstimate(text);

    if (!parsed.monthlyIncome && !parsed.monthlySpending && !parsed.checkingBalance) {
      throw new Error("Could not find amounts in that text. Try including monthly income and spending.");
    }

    if (parsed.monthlyIncome) {
      applyEstimateToField("annual-income", parsed.monthlyIncome * 12);
    }
    if (parsed.monthlySpending) {
      applyEstimateToField("debt-payment", parsed.monthlySpending);
    }
    if (parsed.checkingBalance) {
      applyEstimateToField("starter-balance", parsed.checkingBalance);
    }

    updateSafetyBar();
    el("quick-intake-mapped").textContent = `Applied: income ${parsed.monthlyIncome ? formatCurrency(parsed.monthlyIncome) + "/mo" : "n/a"}, bill ${parsed.monthlySpending ? formatCurrency(parsed.monthlySpending) + "/mo" : "n/a"}, cash ${parsed.checkingBalance ? formatCurrency(parsed.checkingBalance) : "n/a"}.`;
    setStatus("Natural language estimates applied.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function currentWizardStep() {
  return WIZARD_STEPS[wizardStepIndex] ?? WIZARD_STEPS[0];
}

function syncWizardUi() {
  const step = currentWizardStep();
  el("wizard-current-step").textContent = step.label;

  document.querySelectorAll("button.wizard-step").forEach((button) => {
    const isActive = button.dataset.step === step.id;
    button.setAttribute("aria-selected", String(isActive));
    button.dataset.active = isActive ? "true" : "false";
  });

  document.querySelectorAll("[data-wizard-pane]").forEach((pane) => {
    pane.hidden = pane.dataset.wizardPane !== step.id;
  });

  document.querySelectorAll("[data-wizard-section]").forEach((section) => {
    const visibleSteps = (section.dataset.wizardSection ?? "").split(",");
    section.hidden = !visibleSteps.includes(step.id);
  });

  document.querySelectorAll("[data-wizard-nav='prev']").forEach((btn) => {
    btn.disabled = wizardStepIndex === 0;
  });
  document.querySelectorAll("[data-wizard-nav='next']").forEach((btn) => {
    btn.textContent = step.id === "results" ? "Finish" : "Next";
  });
}

function goToWizardStep(index) {
  wizardStepIndex = Math.max(0, Math.min(index, WIZARD_STEPS.length - 1));
  syncWizardUi();
}

async function onWizardNext() {
  const step = currentWizardStep();

  if (step.id === "benefits") {
    const saved = await onOnboard({ preventDefault() {} });
    if (!saved) {
      return;
    }
  }

  if (step.id === "market-assumptions") {
    const created = await onCreateScenario({ preventDefault() {} });
    if (!created) {
      return;
    }
    await refreshOverview();
    await onRunScenario();
    await onShowMarketTrends();
  }

  if (wizardStepIndex < WIZARD_STEPS.length - 1) {
    goToWizardStep(wizardStepIndex + 1);
  }
}

function onWizardPrevious() {
  if (wizardStepIndex > 0) {
    goToWizardStep(wizardStepIndex - 1);
  }
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

function renderStressTestChart(result, milestones) {
  const annualProjection = result.engineResult.projection.annualProjection ?? [];
  const stressSeries = buildStressTestRangeSeries({
    annualProjection,
    sensitivityRows: result.engineResult.sensitivity ?? [],
    simulationOutputs: result.engineResult.simulation?.outputs ?? []
  });

  if (!stressSeries.labels.length) {
    return "";
  }

  const mode = el("stress-visual-mode")?.value ?? "likely";

  if (mode === "likely") {
    const likelyChart = renderLikelyNetWorthLineChartSvg(stressSeries, {
      title: "Likely case net-worth path",
      description: "Simplified view showing only the likely path for projected net worth."
    });

    return `${likelyChart}<p><strong>Simple view:</strong> This is one likely path. Switch to stress range to see best/worst volatility bounds.</p>`;
  }

  const summary = buildStressTestAssumptionSummary({
    likely: stressSeries.likely,
    worst: stressSeries.worst,
    best: stressSeries.best,
    sensitivityRows: result.engineResult.sensitivity ?? [],
    simulationOutputs: result.engineResult.simulation?.outputs ?? []
  });

  const chart = renderStressTestRangeChartSvg(stressSeries, {
    title: "Stress test: market volatility range",
    description:
      "Shaded area shows best, likely, and worst market paths using deterministic sensitivity scenarios and bounded simulation."
  });

  const lowReturn = (result.engineResult.sensitivity ?? []).find((row) => row.id === "low_return");
  const goalYear = milestones.retirementYear ?? stressSeries.labels.at(-1);
  const reassurance =
    lowReturn && Number(lowReturn.totalUnfunded ?? 0) <= 0
      ? `Even if the market has a bad year like 2008, this plan still stays on track for your ${goalYear} goal.`
      : `A bad market year can delay your goal. Use the What-If slider to add a small buffer and improve your ${goalYear} outlook.`;

  const stressAssumptionsHtml = `
    <details>
      <summary><strong>Stress-test assumptions</strong></summary>
      <ul>
        <li>Likely path final net worth: ${formatCurrency(Math.round(summary.baselineFinal))}.</li>
        <li>Worst-case path final net worth: ${formatCurrency(Math.round(summary.worstFinal))} (${summary.worstDeltaPercent.toFixed(1)}% vs likely).</li>
        <li>Best-case path final net worth: ${formatCurrency(Math.round(summary.bestFinal))} (${summary.bestDeltaPercent.toFixed(1)}% vs likely).</li>
        <li>Range source inputs: ${summary.sensitivityCount} deterministic sensitivity variants and ${summary.simulationCount} bounded simulation runs.</li>
      </ul>
    </details>
  `;

  return `${chart}${stressAssumptionsHtml}<p><strong>Stress test takeaway:</strong> ${reassurance}</p>`;
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
    return true;
  } catch (error) {
    setStatus(error.message, true);
    return false;
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
    return true;
  } catch (error) {
    setStatus(error.message, true);
    return false;
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
    const household = await householdRepository.load();
    const coupleOutcomes = buildCoupleTimingOutcomes({
      household,
      scenario: result.scenario,
      currentYear: new Date().getUTCFullYear()
    });
    const coupleOutcomesHtml = renderCoupleTimingOutcomes(coupleOutcomes);

    const sustainabilityDisclosure = renderMetricDisclosure(
      buildMetricDisclosure(result.engineResult.sustainability.metrics)
    );
    const alternativesPanel = renderAlternativesPanel(
      buildAlternativesPanel(
        result.engineResult.sustainability.metrics,
        result.engineResult.sustainability.preferences
      )
    );
    const milestones = buildLookAheadMilestones({
      household,
      scenario: result.scenario,
      engineResult: result.engineResult,
      currentYear: new Date().getUTCFullYear()
    });
    const totalSavings = (household.accounts ?? []).reduce(
      (sum, account) => sum + Number(account.current_balance ?? 0),
      0
    );
    const primaryMetricsHtml = renderPrimaryMetrics(totalSavings, milestones.monthlySurplus);
    const milestonesHtml = renderMilestonesPanel(milestones);
    const tldrHtml = renderLookAheadTldr(milestones);
    const stressTestHtml = renderStressTestChart(result, milestones);
    const nudges = buildSpendingNudges({
      milestones,
      projectionSummary: result.engineResult.projection.summary
    });
    const nudgesHtml = renderNudgesPanel(nudges);
    const liquidityBalance = buildLiquidityBalance({ household });
    const liquidityBalanceHtml = renderLiquidityBalancePanel(liquidityBalance);
    const inflationRealityHtml = buildInflationRealityHtml(result.scenario, household);

    el("results").innerHTML = `
      <p><strong>${result.scenario.name}</strong></p>
      ${primaryMetricsHtml}
      <p>Projected long-term savings: ${formatCurrency(Math.round(result.engineResult.projection.summary.finalNetWorth))}</p>
      <p>Potential funding gap: ${formatCurrency(Math.round(result.engineResult.projection.summary.totalUnfunded))}</p>
      ${milestonesHtml}
      ${stressTestHtml}
      ${nudgesHtml}
      ${liquidityBalanceHtml}
      <div id="inflation-reality-container">${inflationRealityHtml}</div>
      ${coupleOutcomesHtml}
      ${renderProjectionChart(result)}
      ${tldrHtml}
      ${renderAssumptionsPanel(result.assumptionsPanel)}
      <h3>Sustainability disclosure</h3>
      ${sustainabilityDisclosure}
      ${alternativesPanel}
    `;
    initializeInfoTooltips();
    await updateLookAheadWhatIf();
    setStatus("Scenario run complete.");
  } catch (error) {
    el("results").innerHTML = renderErrorState(createErrorState(error));
    setStatus(error.message, true);
  }
}

async function updateLookAheadWhatIf() {
  const monthlyReduction = Number(el("look-ahead-spending-cut").value);
  el("look-ahead-spending-cut-output").textContent = formatCurrency(monthlyReduction);

  if (!lastRun?.scenario || !lastRun?.engineResult) {
    el("look-ahead-what-if").textContent = "Run a scenario to see what-if insights.";
    return;
  }

  const household = await householdRepository.load();
  if (!household) {
    el("look-ahead-what-if").textContent = "Missing household data for what-if analysis.";
    return;
  }

  const adjustedSpending = Math.max(0, Number(lastRun.scenario.annual_spending ?? 60000) - monthlyReduction * 12);
  const whatIfScenario = {
    ...cloneValue(lastRun.scenario),
    annual_spending: adjustedSpending
  };

  const variantEngineResult = runDeterministicEngine({
    household: cloneValue(household),
    scenario: whatIfScenario,
    currentAge: 38
  });

  const impact = buildWhatIfImpact({
    monthlyReduction,
    scenario: lastRun.scenario,
    baselineEngineResult: lastRun.engineResult,
    variantEngineResult
  });

  el("look-ahead-what-if").textContent = renderWhatIfMessage(impact);
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

async function onExportHouseholdYaml() {
  try {
    const household = await householdRepository.load();
    if (!household) {
      throw new Error("Save onboarding data before exporting household YAML.");
    }

    const payload = {
      schema_version: "1.0.0",
      household
    };

    downloadTextFile({
      fileName: `openwealth-household-${household.household_id}.yaml`,
      mimeType: "application/x-yaml",
      data: stringifyYaml(payload)
    });

    setStatus("Household YAML exported.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

async function onImportHouseholdYamlFile(event) {
  try {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const parsed = parseImportContent("yaml", text);
    const household = parsed?.household ?? parsed;

    if (!household || typeof household !== "object") {
      throw new Error("YAML file must include a household object.");
    }
    if (typeof household.household_id !== "string" || household.household_id.length === 0) {
      throw new Error("Imported household is missing household_id.");
    }
    if (!Array.isArray(household.people) || !Array.isArray(household.accounts)) {
      throw new Error("Imported household must include people and accounts arrays.");
    }

    await householdRepository.save(household);
    await refreshOverview();
    setStatus(`Household YAML imported from ${file.name}.`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    event.target.value = "";
  }
}

function onImportHouseholdYamlClick() {
  el("household-yaml-file").click();
}

function onGeneratePrompt() {
  (async () => {
    try {
      if (!lastRun) {
        const scenarioId = el("scenario-select").value;
        if (!scenarioId) {
          throw new Error("Create and select a scenario before generating a prompt package.");
        }

        const result = await experience.runScenario(scenarioId, { currentAge: 38 });
        if (!result.engineResult) {
          throw new Error("Could not run selected scenario for prompt generation.");
        }

        lastRun = result;
      }

      const household = await householdRepository.load();
      const promptPackage = createPromptPackage({
        household,
        scenario: lastRun.scenario,
        engineResult: lastRun.engineResult,
        generatedAt: new Date().toISOString()
      });

      el("prompt-output").value = promptPackage.prompt_text;
      setStatus("Prompt package generated. Review privacy warning before sharing with external LLMs.");
    } catch (error) {
      setStatus(error.message, true);
    }
  })();
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
  el("export-household-yaml").addEventListener("click", onExportHouseholdYaml);
  el("import-household-yaml").addEventListener("click", onImportHouseholdYamlClick);
  el("household-yaml-file").addEventListener("change", onImportHouseholdYamlFile);
  el("show-market-trends").addEventListener("click", onShowMarketTrends);
  el("generate-prompt").addEventListener("click", onGeneratePrompt);
  el("random-persona").addEventListener("click", onRandomPersona);
  el("apply-persona").addEventListener("click", onApplyPersona);
  el("run-persona-carousel").addEventListener("click", onPersonaCarousel);
  el("household-mode").addEventListener("change", syncHouseholdModeUi);
  el("guided-tour-persona").addEventListener("change", syncGuidedTourPersonaUi);
  el("data-entry-mode").addEventListener("change", syncDataEntryModeUi);
  el("quick-intake-next").addEventListener("click", onQuickIntakeNext);
  el("quick-intake-prev").addEventListener("click", onQuickIntakePrevious);
  el("apply-natural-language").addEventListener("click", onApplyNaturalLanguage);
  el("look-ahead-spending-cut").addEventListener("input", () => {
    updateLookAheadWhatIf().catch((error) => setStatus(error.message, true));
  });
  el("stress-visual-mode").addEventListener("change", () => {
    if (!lastRun) {
      return;
    }
    onRunScenario().catch((error) => setStatus(error.message, true));
  });
  [
    "inflation-cash-principal",
    "inflation-checking-rate",
    "inflation-high-yield-rate",
    "inflation-bond-rate"
  ].forEach((id) => {
    const eventName = id === "inflation-cash-principal" ? "input" : "input";
    el(id).addEventListener(eventName, () => {
      updateInflationRealityCheck().catch((error) => setStatus(error.message, true));
    });
  });
  document.querySelectorAll("[data-wizard-nav='prev']").forEach((btn) => {
    btn.addEventListener("click", onWizardPrevious);
  });
  document.querySelectorAll("[data-wizard-nav='next']").forEach((btn) => {
    btn.addEventListener("click", onWizardNext);
  });

  document.querySelectorAll("button.wizard-step").forEach((button) => {
    button.addEventListener("click", () => {
      const index = WIZARD_STEPS.findIndex((step) => step.id === button.dataset.step);
      if (index >= 0) {
        goToWizardStep(index);
      }
    });
  });

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
      if (["annual-income", "debt-payment"].includes(input.id)) {
        updateSafetyBar();
      }
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
  syncGuidedTourPersonaUi();
  syncDataEntryModeUi();
  syncQuickIntakeQuestion();
  updateSafetyBar();
  updateInflationRateOutputs();
  initializeInfoTooltips();
  await updateLookAheadWhatIf();
  goToWizardStep(0);

  onRandomPersona();
  setStatus("Ready.");
}

init();
