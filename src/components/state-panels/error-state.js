export function createErrorState(error) {
  return {
    kind: "error",
    message: error?.message ?? String(error ?? "Unknown error")
  };
}

export function renderErrorState(state) {
  return `<section data-state="error"><p>${state.message}</p></section>`;
}
