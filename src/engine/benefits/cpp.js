import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const benefitRules = JSON.parse(
  readFileSync(join(__dirname, "../../../data/public/benefits/cpp-oas.ca-2026.json"), "utf8")
);

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
