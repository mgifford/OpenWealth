import { buildModeledMetric, percentMetricConfig } from "./shared.js";

export function calculateSocialCommunityExposure(accounts) {
  return buildModeledMetric(
    accounts,
    percentMetricConfig("social_community_exposure", "social")
  );
}
