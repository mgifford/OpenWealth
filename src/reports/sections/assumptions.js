export function buildAssumptionsSection(engineResult) {
  return {
    section_id: "assumptions",
    title: "Assumptions",
    values: engineResult.assumptions ?? {}
  };
}
