import { buildModeledMetric, percentMetricConfig } from "./shared.js";

export function calculateRenewableTransitionExposure(accounts) {
  return buildModeledMetric(
    accounts,
    percentMetricConfig("renewable_transition_exposure", "renewable")
  );
}
