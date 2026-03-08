import { buildModeledMetric, percentMetricConfig } from "./shared.js";

export function calculateFossilExposure(accounts) {
  return buildModeledMetric(accounts, percentMetricConfig("fossil_exposure", "fossil"));
}
