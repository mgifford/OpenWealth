function nextChangeId(index) {
  return `chg_${String(index + 1).padStart(4, "0")}`;
}

export function buildFieldDiff(oldRecord, newRecord, basePath, confidence) {
  const keys = new Set([...Object.keys(oldRecord ?? {}), ...Object.keys(newRecord ?? {})]);
  const changes = [];

  for (const key of keys) {
    const oldValue = oldRecord?.[key];
    const newValue = newRecord?.[key];

    if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
      continue;
    }

    changes.push({
      path: `${basePath}/${key}`,
      old_value: oldValue,
      new_value: newValue,
      confidence,
      requires_manual_review: confidence < 0.8
    });
  }

  return changes;
}

export function generateImportDiff(canonicalHousehold, matchedRecords) {
  const proposedChanges = [];

  for (const result of matchedRecords) {
    if (result.matchType === "new") {
      proposedChanges.push({
        entity: "account",
        entity_id: result.incoming.account_id,
        operation: "add",
        path: "/accounts/-",
        old_value: null,
        new_value: result.incoming,
        confidence: result.confidence,
        requires_manual_review: false
      });
      continue;
    }

    const basePath = `/accounts/${result.match.account_id}`;
    const fieldChanges = buildFieldDiff(result.match, result.incoming, basePath, result.confidence).map(
      (change) => ({
        entity: "account",
        entity_id: result.match.account_id,
        operation: "replace",
        ...change,
        requires_manual_review: change.requires_manual_review || result.matchType === "heuristic"
      })
    );

    proposedChanges.push(...fieldChanges);
  }

  return {
    proposedChanges: proposedChanges.map((change, index) => ({
      change_id: nextChangeId(index),
      ...change
    })),
    summary: {
      total: proposedChanges.length,
      requiresManualReview: proposedChanges.filter((change) => change.requires_manual_review).length
    }
  };
}
