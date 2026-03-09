export function buildAssumptionsSection(engineResult, scenario = {}) {
  return {
    section_id: "assumptions",
    title: "Assumptions",
    values: engineResult.assumptions ?? {},
    provenance: scenario.assumptions_provenance ?? {}
  };
}
