import { projectCashflow, runSensitivityMatrix, runBoundedSimulation } from "./scenarios/index.js";

export function runDeterministicEngine(input) {
  const projection = projectCashflow(input);
  const sensitivity = runSensitivityMatrix(input);
  const simulation = runBoundedSimulation(input, input.simulationOptions ?? {});

  return {
    projection,
    sensitivity,
    simulation,
    assumptions: projection.assumptions,
    warnings: projection.warnings
  };
}
