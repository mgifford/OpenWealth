import {
  calculateFossilExposure,
  calculateCarbonIntensity,
  calculateRenewableTransitionExposure,
  calculateSocialCommunityExposure,
  calculateControversialSectorExposure
} from "./metrics/index.js";
import { runClimateOverlayScenarios } from "./climate-overlays.js";

function hasOpaqueAggregateScore(metrics) {
  return metrics.some((metric) => metric.metric_key === "esg_score");
}

export function calculateSustainabilityMetrics(household) {
  const accounts = household?.accounts ?? [];
  const metrics = [
    calculateFossilExposure(accounts),
    calculateCarbonIntensity(accounts),
    calculateRenewableTransitionExposure(accounts),
    calculateSocialCommunityExposure(accounts),
    calculateControversialSectorExposure(accounts)
  ];

  return {
    metrics,
    has_opaque_score: hasOpaqueAggregateScore(metrics)
  };
}

export function buildSustainabilityOverlay(input, projection) {
  const household = input?.household ?? {};
  const preferences = household.sustainability_preferences ?? null;
  const metricResult = calculateSustainabilityMetrics(household);

  return {
    preferences,
    metrics: metricResult.metrics,
    has_opaque_score: metricResult.has_opaque_score,
    climate_overlays: runClimateOverlayScenarios(projection, {
      years: input?.scenario?.projection_years
    })
  };
}
