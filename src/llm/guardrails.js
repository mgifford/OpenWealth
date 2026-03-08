import { validateDocument } from "../schemas/validate.js";
import { REQUIRED_DISCLAIMER, containsProhibitedAuthorityClaim } from "./policies.js";

const CONTRACT_TO_SCHEMA = {
  intake: "llmIntakeResponse",
  scenarioDraft: "llmScenarioDraft",
  explanation: "llmExplanationSummary"
};

function collectTextFragments(payload) {
  const textFields = [];
  if (typeof payload.intent_summary === "string") {
    textFields.push(payload.intent_summary);
  }
  if (typeof payload.summary === "string") {
    textFields.push(payload.summary);
  }
  for (const item of payload.assumptions ?? []) {
    if (typeof item === "string") {
      textFields.push(item);
    }
  }
  for (const note of payload.confidence_notes ?? []) {
    if (typeof note.note === "string") {
      textFields.push(note.note);
    }
  }
  return textFields;
}

export function validateContractPayload(contractType, payload) {
  const schemaKey = CONTRACT_TO_SCHEMA[contractType];
  if (!schemaKey) {
    throw new Error(`Unknown contract type: ${contractType}`);
  }

  return validateDocument(schemaKey, payload);
}

export function enforceAssistantGuardrails(contractType, payload) {
  const normalizedPayload = {
    ...payload,
    disclaimer: payload.disclaimer?.trim() ? payload.disclaimer : REQUIRED_DISCLAIMER
  };

  const validation = validateContractPayload(contractType, normalizedPayload);
  if (!validation.valid) {
    return {
      valid: false,
      blocked: true,
      reason: "Contract validation failed",
      errors: validation.errors,
      payload: null
    };
  }

  const fragments = collectTextFragments(payload);
  if (fragments.some((text) => containsProhibitedAuthorityClaim(text))) {
    return {
      valid: false,
      blocked: true,
      reason: "Prohibited authority claim detected",
      errors: [{ path: "/", keyword: "policy", message: "Prohibited authority claim detected", params: {} }],
      payload: null
    };
  }

  return {
    valid: true,
    blocked: false,
    reason: null,
    errors: [],
    payload: {
      ...normalizedPayload
    }
  };
}
