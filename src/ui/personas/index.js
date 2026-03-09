const PERSONAS = Object.freeze([
  {
    persona_id: "steady-saver",
    title: "Steady Saver",
    lifestyle: "frugal",
    summary: "Prioritizes essential spending and lower volatility.",
    retirement_goal_range: "900k - 1.2M",
    life_expectancy_range: { min: 86, max: 92 },
    assumptions: {
      retirement_age: 63,
      annual_spending: 48000,
      projection_years: 34,
      cpp_start_age: 65,
      oas_start_age: 65,
      withdrawal_strategy: "blended",
      starter_balance: 95000,
      retirement_target_age: 63,
      expected_return: 0.045
    }
  },
  {
    persona_id: "balanced-builder",
    title: "Balanced Builder",
    lifestyle: "comfortable",
    summary: "Balances growth and stability for long retirement horizon.",
    retirement_goal_range: "1.2M - 1.8M",
    life_expectancy_range: { min: 88, max: 95 },
    assumptions: {
      retirement_age: 65,
      annual_spending: 62000,
      projection_years: 36,
      cpp_start_age: 66,
      oas_start_age: 65,
      withdrawal_strategy: "tfsa_first",
      starter_balance: 140000,
      retirement_target_age: 65,
      expected_return: 0.052
    }
  },
  {
    persona_id: "late-bloom-growth",
    title: "Late Bloom Growth",
    lifestyle: "comfortable",
    summary: "Accepts higher volatility to support delayed retirement income.",
    retirement_goal_range: "1.5M - 2.1M",
    life_expectancy_range: { min: 90, max: 97 },
    assumptions: {
      retirement_age: 67,
      annual_spending: 72000,
      projection_years: 38,
      cpp_start_age: 70,
      oas_start_age: 70,
      withdrawal_strategy: "rrsp_first",
      starter_balance: 170000,
      retirement_target_age: 67,
      expected_return: 0.058
    }
  }
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function listRetirementPersonas() {
  return clone(PERSONAS);
}

export function pickRandomRetirementPersona(randomFn = Math.random) {
  const personas = listRetirementPersonas();
  const index = Math.floor(randomFn() * personas.length);
  return personas[index];
}

export function applyPersonaToFormValues(persona, currentValues = {}) {
  const assumptions = persona.assumptions;
  return {
    householdName: currentValues.householdName ?? `${persona.title} Household`,
    personName: currentValues.personName ?? persona.title,
    starterBalance: assumptions.starter_balance,
    retirementTargetAge: assumptions.retirement_target_age,
    scenarioName: `${persona.title} Scenario`,
    scenarioRetirementAge: assumptions.retirement_age,
    annualSpending: assumptions.annual_spending,
    projectionYears: assumptions.projection_years,
    cppAge: assumptions.cpp_start_age,
    oasAge: assumptions.oas_start_age,
    strategy: assumptions.withdrawal_strategy,
    lifestyle: persona.lifestyle,
    retirementGoalRange: persona.retirement_goal_range,
    lifeExpectancyRange: `${persona.life_expectancy_range.min}-${persona.life_expectancy_range.max}`
  };
}
