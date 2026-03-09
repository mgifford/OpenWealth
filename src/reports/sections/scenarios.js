function deriveRetirementYear(scenario, projection) {
  const firstRow = projection.annualProjection?.[0] ?? null;
  if (!firstRow) {
    return null;
  }

  const currentYear = Number(firstRow.year ?? new Date().getUTCFullYear());
  const currentAge = Number(firstRow.age ?? 38);
  const retirementAge = Number(scenario.retirement_age ?? 65);

  return currentYear + Math.max(0, retirementAge - currentAge);
}

export function buildScenariosSection(scenario, engineResult) {
  const projection = engineResult.projection ?? {};
  const expectedRetirementYear = deriveRetirementYear(scenario, projection);

  return {
    section_id: "scenarios",
    title: "Look ahead milestones",
    scenario: {
      name: scenario.name ?? "Scenario",
      retirement_age: scenario.retirement_age,
      cpp_start_age: scenario.cpp_start_age,
      oas_start_age: scenario.oas_start_age,
      withdrawal_strategy: scenario.withdrawal_strategy,
      expected_return: scenario.expected_return,
      inflation_rate: scenario.inflation_rate
    },
    milestones: {
      expected_retirement_year: expectedRetirementYear
    },
    plain_language_labels: {
      withdrawal_strategy: "spending order",
      expected_return: "stocks growth estimate",
      inflation_rate: "price increase estimate"
    },
    summary: projection.summary ?? {},
    annual_projection: projection.annualProjection ?? []
  };
}
