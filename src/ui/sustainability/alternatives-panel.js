function buildTradeoffNotes(metric) {
  if (metric.availability_state === "unavailable") {
    return "Insufficient data for this metric; treat as information gap.";
  }

  if (metric.metric_key === "renewable_transition_exposure") {
    return "Higher transition exposure can increase sector concentration risk.";
  }

  if (metric.metric_key === "fossil_exposure" || metric.metric_key === "carbon_intensity") {
    return "Lower exposure may change expected sector diversification.";
  }

  return "Review fit against your priorities and risk tolerance.";
}

export function buildAlternativesPanel(metrics = [], preferences = {}) {
  return {
    title: "Values-aligned alternatives",
    disclaimer: "Descriptive options only. This is not a recommendation.",
    entries: metrics.map((metric) => ({
      metric_key: metric.metric_key,
      availability_state: metric.availability_state,
      tradeoff_note: buildTradeoffNotes(metric),
      priority_weight: preferences.priorities?.[metric.metric_key.replace("_exposure", "")] ?? 0,
      uncertainty_notice:
        metric.availability_state === "measured"
          ? "Measured from source data."
          : metric.availability_state === "modeled"
            ? "Modeled estimate based on account mix."
            : "No reliable source coverage available."
    }))
  };
}

export function renderAlternativesPanel(panel) {
  const items = panel.entries
    .map(
      (entry) =>
        `<li><strong>${entry.metric_key}</strong>: ${entry.tradeoff_note} (${entry.uncertainty_notice})</li>`
    )
    .join("");

  return `<section><h3>${panel.title}</h3><p>${panel.disclaimer}</p><ul>${items}</ul></section>`;
}
