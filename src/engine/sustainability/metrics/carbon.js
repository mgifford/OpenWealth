import { buildModeledMetric, carbonMetricConfig } from "./shared.js";

export function calculateCarbonIntensity(accounts) {
  return buildModeledMetric(accounts, carbonMetricConfig());
}
