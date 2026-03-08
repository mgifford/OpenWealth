import { buildMetricDisclosure } from "../../ui/sustainability/metric-disclosure.js";

export function buildSustainabilitySection(sustainabilityResult) {
  return {
    section_id: "sustainability",
    title: "Sustainability and climate context",
    disclaimer: "Descriptive planning context only. Not an investment recommendation.",
    metrics: buildMetricDisclosure(sustainabilityResult.metrics ?? []),
    overlays: sustainabilityResult.climate_overlays ?? []
  };
}
