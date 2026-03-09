const DISCLAIMER = "Informational planning output only. This is not financial advice.";

function formatAssumptionValue(value) {
  if (typeof value !== "number") {
    return String(value);
  }

  if (value > -1 && value < 1) {
    return `${(value * 100).toFixed(1)}%`;
  }

  return `${Math.round(value).toLocaleString()}`;
}

function toProvenanceMap(scenario = {}) {
  return {
    expectedReturn: scenario.assumptions_provenance?.expected_return ?? "derived",
    inflationRate: scenario.assumptions_provenance?.inflation_rate ?? "derived",
    retirementAge: "user",
    cppStartAge: "user",
    oasStartAge: "user",
    strategy: "user"
  };
}

export function buildAssumptionsPanel(engineResult, scenario = {}) {
  return {
    disclaimer: DISCLAIMER,
    assumptions: engineResult.assumptions ?? {},
    provenance: toProvenanceMap(scenario),
    warnings: engineResult.warnings ?? []
  };
}

export function renderAssumptionsPanel(panel) {
  const assumptionItems = Object.entries(panel.assumptions)
    .map(([key, value]) => {
      const provenance = panel.provenance?.[key] ?? "derived";
      return `<li><strong>${key}</strong>: ${formatAssumptionValue(value)} <small>(source: ${provenance})</small></li>`;
    })
    .join("");
  const warningItems = panel.warnings.map((warning) => `<li>${warning}</li>`).join("");

  return `<section><h2>Assumptions</h2><p>${panel.disclaimer}</p><ul>${assumptionItems}</ul><h3>Warnings</h3><ul>${warningItems}</ul></section>`;
}
