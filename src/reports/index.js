import { buildSustainabilitySection } from "./sections/sustainability.js";

export function reportModuleStatus() {
  return "ready";
}

export function buildReportSections(engineResult) {
  return {
    sustainability: buildSustainabilitySection(engineResult.sustainability ?? {})
  };
}
