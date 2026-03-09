function isoTimestamp(clock = () => new Date()) {
  return clock().toISOString();
}

function scenarioId() {
  return `scenario_${Math.random().toString(36).slice(2, 10)}`;
}

export function buildScenarioDraft(input, options = {}) {
  if (!input?.name?.trim()) {
    throw new Error("Scenario name is required");
  }

  const retirementAge = Number(input.retirement_age ?? 65);
  if (retirementAge < 40 || retirementAge > 75) {
    throw new Error("Scenario retirement age must be between 40 and 75");
  }

  return {
    scenario_id: input.scenario_id ?? scenarioId(),
    name: input.name.trim(),
    base_household_id: input.base_household_id,
    retirement_age: retirementAge,
    cpp_start_age: Number(input.cpp_start_age ?? 65),
    oas_start_age: Number(input.oas_start_age ?? 65),
    withdrawal_strategy: input.withdrawal_strategy ?? "blended",
    expected_return: Number(input.expected_return ?? 0.05),
    inflation_rate: Number(input.inflation_rate ?? 0.02),
    annual_spending: Number(input.annual_spending ?? 60000),
    projection_years: Number(input.projection_years ?? 30),
    assumptions_provenance: {
      expected_return: input.assumptions_provenance?.expected_return ?? "default",
      inflation_rate: input.assumptions_provenance?.inflation_rate ?? "default",
      source: input.assumptions_provenance?.source ?? "user"
    },
    created_at: input.created_at ?? isoTimestamp(options.clock)
  };
}
