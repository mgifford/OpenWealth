export function buildCaveatsSection(engineResult) {
  return {
    section_id: "caveats",
    title: "Caveats and warnings",
    warnings: engineResult.warnings ?? [],
    notes: [
      "Outputs are deterministic projections based on supplied assumptions.",
      "Missing or low-confidence data can materially change outcomes."
    ]
  };
}
