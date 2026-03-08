function balanceWeight(account, totalBalance) {
  if (totalBalance <= 0) {
    return 0;
  }
  return Math.max(0, account.current_balance ?? 0) / totalBalance;
}

function modeledAvailability(accounts) {
  return accounts.length > 0 ? "modeled" : "unavailable";
}

function confidenceFromAvailability(availability) {
  if (availability === "measured") {
    return "high";
  }
  if (availability === "modeled") {
    return "medium";
  }
  return "low";
}

function unitPercent() {
  return "% portfolio";
}

function totalBalance(accounts) {
  return accounts.reduce((sum, account) => sum + Math.max(0, account.current_balance ?? 0), 0);
}

const EXPOSURE_BY_ACCOUNT_TYPE = {
  tfsa: {
    fossil: 0.12,
    carbon: 95,
    renewable: 0.22,
    social: 0.11,
    controversial: 0.04
  },
  rrsp: {
    fossil: 0.16,
    carbon: 125,
    renewable: 0.17,
    social: 0.08,
    controversial: 0.06
  },
  fhsa: {
    fossil: 0.1,
    carbon: 80,
    renewable: 0.25,
    social: 0.1,
    controversial: 0.03
  },
  resp: {
    fossil: 0.08,
    carbon: 70,
    renewable: 0.29,
    social: 0.12,
    controversial: 0.02
  },
  non_registered: {
    fossil: 0.2,
    carbon: 140,
    renewable: 0.14,
    social: 0.07,
    controversial: 0.08
  },
  chequing_savings: {
    fossil: 0.01,
    carbon: 8,
    renewable: 0.02,
    social: 0.02,
    controversial: 0.01
  }
};

function lookupTypeProfile(accountType) {
  return EXPOSURE_BY_ACCOUNT_TYPE[accountType] ?? null;
}

export function buildModeledMetric(accounts, config) {
  const total = totalBalance(accounts);
  const available = modeledAvailability(accounts);

  if (available === "unavailable") {
    return {
      metric_key: config.key,
      availability_state: "unavailable",
      unit: config.unit,
      source_reference: "No holdings available for metric calculation",
      confidence: confidenceFromAvailability("unavailable")
    };
  }

  let modeledValue = 0;
  for (const account of accounts) {
    const profile = lookupTypeProfile(account.account_type);
    if (!profile) {
      continue;
    }

    const weight = balanceWeight(account, total);
    modeledValue += weight * profile[config.profileKey] * config.scale;
  }

  return {
    metric_key: config.key,
    availability_state: "modeled",
    modeled_value: Number(modeledValue.toFixed(config.decimals ?? 2)),
    unit: config.unit,
    source_reference: "Modeled from account-type exposure assumptions (OpenWealth baseline 2026)",
    confidence: confidenceFromAvailability("modeled")
  };
}

export function percentMetricConfig(key, profileKey) {
  return {
    key,
    profileKey,
    scale: 100,
    unit: unitPercent(),
    decimals: 2
  };
}

export function carbonMetricConfig() {
  return {
    key: "carbon_intensity",
    profileKey: "carbon",
    scale: 1,
    unit: "tCO2e / $M revenue",
    decimals: 1
  };
}
