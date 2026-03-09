export function buildScenariosSection(scenario, engineResult) {
  const projection = engineResult.projection ?? {};
  return {
    section_id: "scenarios",
    title: "Scenario outcomes",
    scenario: {
      name: scenario.name ?? "Scenario",
      retirement_age: scenario.retirement_age,
      cpp_start_age: scenario.cpp_start_age,
      oas_start_age: scenario.oas_start_age,
      withdrawal_strategy: scenario.withdrawal_strategy,
      expected_return: scenario.expected_return,
      inflation_rate: scenario.inflation_rate
    },
    summary: projection.summary ?? {},
    annual_projection: projection.annualProjection ?? []
  };
}
