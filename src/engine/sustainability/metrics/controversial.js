import { buildModeledMetric, percentMetricConfig } from "./shared.js";

export function calculateControversialSectorExposure(accounts) {
  return buildModeledMetric(
    accounts,
    percentMetricConfig("controversial_sector_exposure", "controversial")
  );
}
