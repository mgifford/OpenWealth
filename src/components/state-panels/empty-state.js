export function createEmptyState(message = "No data yet. Start onboarding to create your household plan.") {
  return {
    kind: "empty",
    message
  };
}

export function renderEmptyState(state) {
  return `<section data-state="empty"><p>${state.message}</p></section>`;
}
