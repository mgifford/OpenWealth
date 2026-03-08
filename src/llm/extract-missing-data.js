function normalizeMissingField(entry) {
  if (typeof entry === "string") {
    return {
      field: entry,
      reason: "Missing input",
      prompt: `Please provide ${entry}.`,
      severity: "medium"
    };
  }

  return {
    field: entry.field,
    reason: entry.reason,
    prompt: entry.prompt ?? `Please provide ${entry.field}.`,
    severity: entry.severity ?? "medium"
  };
}

export function extractMissingData(payload) {
  return (payload.missing_inputs ?? []).map(normalizeMissingField);
}
