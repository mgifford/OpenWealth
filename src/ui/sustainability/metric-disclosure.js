function availabilityLabel(metric) {
  if (metric.availability_state === "measured") {
    return "Measured";
  }
  if (metric.availability_state === "modeled") {
    return "Modeled";
  }
  return "Unavailable";
}

function valueForMetric(metric) {
  if (metric.availability_state === "measured") {
    return metric.measured_value;
  }
  if (metric.availability_state === "modeled") {
    return metric.modeled_value;
  }
  return null;
}

export function buildMetricDisclosure(metrics = []) {
  return metrics.map((metric) => ({
    metric_key: metric.metric_key,
    availability: availabilityLabel(metric),
    value: valueForMetric(metric),
    unit: metric.unit ?? "n/a",
    confidence: metric.confidence ?? "low",
    source_reference: metric.source_reference ?? "Data unavailable"
  }));
}

export function renderMetricDisclosure(disclosureRows) {
  const rows = disclosureRows
    .map(
      (row) =>
        `<tr><td>${row.metric_key}</td><td>${row.availability}</td><td>${row.value ?? "n/a"}</td><td>${row.unit}</td><td>${row.confidence}</td><td>${row.source_reference}</td></tr>`
    )
    .join("");

  return `<table><thead><tr><th>Metric</th><th>Availability</th><th>Value</th><th>Unit</th><th>Confidence</th><th>Source</th></tr></thead><tbody>${rows}</tbody></table>`;
}
