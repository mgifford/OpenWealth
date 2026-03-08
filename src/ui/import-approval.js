export function approveAll(diff) {
  return diff.proposedChanges.map((change) => change.change_id);
}

export function approveByPath(diff, includePaths) {
  return diff.proposedChanges
    .filter((change) => includePaths.some((path) => change.path.startsWith(path)))
    .map((change) => change.change_id);
}
