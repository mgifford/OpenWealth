import { projectCashflow, runSensitivityMatrix, runBoundedSimulation } from "./scenarios/index.js";
import { buildSustainabilityOverlay } from "./sustainability/index.js";

export function runDeterministicEngine(input) {
  const projection = projectCashflow(input);
  const sensitivity = runSensitivityMatrix(input);
  const simulation = runBoundedSimulation(input, input.simulationOptions ?? {});
  const sustainability = buildSustainabilityOverlay(input, projection);

  return {
    projection,
    sensitivity,
    simulation,
    sustainability,
    assumptions: projection.assumptions,
    warnings: projection.warnings
  };
}
