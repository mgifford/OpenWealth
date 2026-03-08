const CLIMATE_OVERLAYS = {
  rapid_transition: {
    label: "Rapid transition",
    projected_return_delta: -0.007,
    risk_note: "Near-term repricing risk for carbon-intensive holdings"
  },
  delayed_transition: {
    label: "Delayed transition",
    projected_return_delta: -0.003,
    risk_note: "Longer period of policy uncertainty and staggered repricing"
  },
  worsened_physical_risk: {
    label: "Worsened physical risk",
    projected_return_delta: -0.01,
    risk_note: "Higher expected loss rates from physical climate events"
  }
};

function adjustedNetWorth(baseFinalNetWorth, delta, years) {
  const factor = Math.pow(1 + delta, Math.max(0, years));
  return Number((baseFinalNetWorth * factor).toFixed(2));
}

export function runClimateOverlayScenarios(baseProjection, options = {}) {
  const years = options.years ?? baseProjection?.annualProjection?.length ?? 0;
  const finalNetWorth = baseProjection?.summary?.finalNetWorth ?? 0;

  return Object.entries(CLIMATE_OVERLAYS).map(([overlay_key, overlay]) => ({
    overlay_key,
    label: overlay.label,
    projected_return_delta: overlay.projected_return_delta,
    adjusted_final_net_worth: adjustedNetWorth(finalNetWorth, overlay.projected_return_delta, years),
    risk_note: overlay.risk_note,
    availability_state: "modeled",
    confidence: "medium",
    source_reference: "OpenWealth climate overlay assumptions (scenario-based, non-predictive)"
  }));
}
