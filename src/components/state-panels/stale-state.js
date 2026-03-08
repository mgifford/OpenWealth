export function createStaleState(lastUpdated) {
  return {
    kind: "stale",
    message: `Data may be stale. Last update: ${lastUpdated ?? "unknown"}`
  };
}

export function renderStaleState(state) {
  return `<section data-state="stale"><p>${state.message}</p></section>`;
}
