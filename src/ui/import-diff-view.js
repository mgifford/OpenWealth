export function toCompactDiff(diff) {
  return diff.proposedChanges.map((change) => ({
    change_id: change.change_id,
    path: change.path,
    operation: change.operation,
    confidence: change.confidence
  }));
}

export function toDetailedDiff(diff) {
  return diff.proposedChanges;
}
