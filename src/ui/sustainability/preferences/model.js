const PRIORITY_KEYS = [
  "fossil_exposure",
  "carbon_intensity",
  "renewable_transition",
  "social_community",
  "controversial_sector"
];

export function createDefaultSustainabilityPreferences() {
  return {
    exclusions: [],
    priorities: {
      fossil_exposure: 3,
      carbon_intensity: 3,
      renewable_transition: 3,
      social_community: 3,
      controversial_sector: 3
    },
    tradeoff_tolerance: "medium",
    local_investment_preference: false,
    indigenous_rights_consideration: false
  };
}

function normalizePriority(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(5, Math.round(numeric)));
}

export function normalizeSustainabilityPreferences(input = {}) {
  const defaults = createDefaultSustainabilityPreferences();
  const exclusions = Array.isArray(input.exclusions) ? [...new Set(input.exclusions)] : defaults.exclusions;

  const priorities = PRIORITY_KEYS.reduce((accumulator, key) => {
    accumulator[key] = normalizePriority(input.priorities?.[key] ?? defaults.priorities[key]);
    return accumulator;
  }, {});

  return {
    exclusions,
    priorities,
    tradeoff_tolerance: input.tradeoff_tolerance ?? defaults.tradeoff_tolerance,
    local_investment_preference: Boolean(input.local_investment_preference),
    indigenous_rights_consideration: Boolean(input.indigenous_rights_consideration)
  };
}

export function applyPreferenceInput(current, patch) {
  return normalizeSustainabilityPreferences({
    ...current,
    ...patch,
    priorities: {
      ...(current?.priorities ?? {}),
      ...(patch?.priorities ?? {})
    }
  });
}
