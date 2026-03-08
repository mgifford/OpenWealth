import { projectCashflow } from "./project-cashflow.js";

export function runSensitivityMatrix(baseInput) {
  const variants = [
    { id: "low_return", expected_return_shift: -0.01, inflation_rate_shift: 0 },
    { id: "base_case", expected_return_shift: 0, inflation_rate_shift: 0 },
    { id: "high_return", expected_return_shift: 0.01, inflation_rate_shift: 0 },
    { id: "high_inflation", expected_return_shift: 0, inflation_rate_shift: 0.01 }
  ];

  return variants.map((variant) => {
    const scenario = {
      ...(baseInput.scenario ?? {}),
      expected_return:
        (baseInput.scenario?.expected_return ?? baseInput.household.assumptions.expected_return) +
        variant.expected_return_shift,
      inflation_rate:
        (baseInput.scenario?.inflation_rate ?? baseInput.household.assumptions.inflation_rate) +
        variant.inflation_rate_shift
    };

    const result = projectCashflow({ ...baseInput, scenario });
    return {
      id: variant.id,
      assumptions: result.assumptions,
      finalNetWorth: result.summary.finalNetWorth,
      totalUnfunded: result.summary.totalUnfunded
    };
  });
}
