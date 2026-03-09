import { CPP_OAS_RULES_CA_2026 } from "../data/cpp-oas.ca-2026.js";

const benefitRules = CPP_OAS_RULES_CA_2026;

export function annualOasAtStartAge(startAge) {
  const rules = benefitRules.oas;

  if (startAge < rules.min_start_age || startAge > rules.max_start_age) {
    throw new Error(`OAS start age must be between ${rules.min_start_age} and ${rules.max_start_age}`);
  }

  const deltaYears = startAge - 65;
  const factor = 1 + Math.max(0, deltaYears) * rules.delay_increase_per_year;
  return rules.base_annual_at_65 * factor;
}

export function getOasRules() {
  return benefitRules.oas;
}
