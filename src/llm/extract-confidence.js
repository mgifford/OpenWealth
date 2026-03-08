function normalizeConfidence(entry) {
  if (typeof entry === "string") {
    return {
      topic: "general",
      confidence: "medium",
      note: entry
    };
  }

  return {
    topic: entry.topic ?? "general",
    confidence: entry.confidence ?? "medium",
    note: entry.note ?? "Confidence note unavailable"
  };
}

export function extractConfidenceNotes(payload) {
  return (payload.confidence_notes ?? []).map(normalizeConfidence);
}
