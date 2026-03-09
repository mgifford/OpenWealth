import { CPP_OAS_RULES_CA_2026 } from "../data/cpp-oas.ca-2026.js";

const benefitRules = CPP_OAS_RULES_CA_2026;

export function annualCppAtStartAge(startAge) {
  const rules = benefitRules.cpp;

  if (startAge < rules.min_start_age || startAge > rules.max_start_age) {
    throw new Error(`CPP start age must be between ${rules.min_start_age} and ${rules.max_start_age}`);
  }

  const deltaYears = startAge - 65;
  const factor =
    deltaYears >= 0
      ? 1 + deltaYears * rules.delay_increase_per_year
      : 1 + deltaYears * rules.early_reduction_per_year;

  return rules.base_annual_at_65 * factor;
}

export function getCppRules() {
  return benefitRules.cpp;
}
