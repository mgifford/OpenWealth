export function createLoadingState(message = "Running deterministic model...") {
  return {
    kind: "loading",
    message
  };
}

export function renderLoadingState(state) {
  return `<section data-state="loading"><p>${state.message}</p></section>`;
}
