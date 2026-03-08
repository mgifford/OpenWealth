export { buildAssumptionsPanel, renderAssumptionsPanel } from "./assumptions-panel.js";
export {
	createEmptyState,
	renderEmptyState,
	createErrorState,
	renderErrorState,
	createLoadingState,
	renderLoadingState,
	createStaleState,
	renderStaleState
} from "./state-panels/index.js";

export const componentRegistry = Object.freeze({
	assumptions: "assumptions-panel",
	states: "state-panels"
});
