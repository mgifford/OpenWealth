function scenarioMetric(result) {
  return {
    scenario_id: result.scenario.scenario_id,
    scenario_name: result.scenario.name,
    final_net_worth: result.engineResult.projection.summary.finalNetWorth,
    total_unfunded: result.engineResult.projection.summary.totalUnfunded,
    assumptions: result.engineResult.assumptions,
    warnings: result.engineResult.warnings
  };
}

export function buildScenarioComparison(results) {
  const rows = results.map(scenarioMetric);

  const byNetWorth = [...rows].sort((left, right) => right.final_net_worth - left.final_net_worth);

  return {
    rows,
    leader: byNetWorth[0] ?? null,
    assumption_differences: rows.map((row) => ({
      scenario_id: row.scenario_id,
      scenario_name: row.scenario_name,
      assumptions: row.assumptions
    }))
  };
}

export function renderComparisonTable(comparison) {
  const body = comparison.rows
    .map(
      (row) =>
        `<tr><th scope="row">${row.scenario_name}</th><td>${Math.round(row.final_net_worth)}</td><td>${Math.round(row.total_unfunded)}</td></tr>`
    )
    .join("");

  return `<table><caption>Scenario comparison summary</caption><thead><tr><th scope="col">Scenario</th><th scope="col">Final net worth</th><th scope="col">Total unfunded</th></tr></thead><tbody>${body}</tbody></table>`;
}
