import { projectCashflow } from "./project-cashflow.js";

function lcg(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function runBoundedSimulation(baseInput, options = {}) {
  const seed = options.seed ?? 12345;
  const runs = options.runs ?? 10;
  const returnBound = options.returnBound ?? 0.015;

  const rand = lcg(seed);
  const outputs = [];

  for (let index = 0; index < runs; index += 1) {
    const jitter = (rand() * 2 - 1) * returnBound;
    const scenario = {
      ...(baseInput.scenario ?? {}),
      expected_return:
        (baseInput.scenario?.expected_return ?? baseInput.household.assumptions.expected_return) + jitter
    };

    const result = projectCashflow({ ...baseInput, scenario });
    outputs.push({
      run: index + 1,
      expectedReturn: result.assumptions.expectedReturn,
      finalNetWorth: result.summary.finalNetWorth,
      totalUnfunded: result.summary.totalUnfunded
    });
  }

  return {
    seed,
    runs,
    returnBound,
    warnings: [
      "Bounded simulation is illustrative only and not a prediction.",
      "Pseudo-random sampling is deterministic when seed is fixed."
    ],
    outputs
  };
}
