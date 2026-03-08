const DISCLAIMER = "Informational planning output only. This is not financial advice.";

export function buildAssumptionsPanel(engineResult) {
  return {
    disclaimer: DISCLAIMER,
    assumptions: engineResult.assumptions ?? {},
    warnings: engineResult.warnings ?? []
  };
}

export function renderAssumptionsPanel(panel) {
  const assumptionItems = Object.entries(panel.assumptions)
    .map(([key, value]) => `<li><strong>${key}</strong>: ${String(value)}</li>`)
    .join("");
  const warningItems = panel.warnings.map((warning) => `<li>${warning}</li>`).join("");

  return `<section><h2>Assumptions</h2><p>${panel.disclaimer}</p><ul>${assumptionItems}</ul><h3>Warnings</h3><ul>${warningItems}</ul></section>`;
}
