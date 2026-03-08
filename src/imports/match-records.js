function confidenceForHeuristic(account, incoming) {
  let confidence = 0.4;
  if (account.account_type && incoming.account_type && account.account_type === incoming.account_type) {
    confidence += 0.3;
  }
  if (account.institution && incoming.institution && account.institution === incoming.institution) {
    confidence += 0.3;
  }
  return Math.min(1, confidence);
}

function heuristicMatch(canonicalAccounts, incoming) {
  const scored = canonicalAccounts
    .map((account) => ({
      account,
      score: confidenceForHeuristic(account, incoming)
    }))
    .filter((entry) => entry.score > 0.4)
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) {
    return null;
  }

  const top = scored[0];
  const second = scored[1];

  // Treat near ties as ambiguous and require manual creation/review.
  if (second && Math.abs(top.score - second.score) < 0.05) {
    return null;
  }

  return {
    account: top.account,
    confidence: top.score
  };
}

export function matchRecords(canonicalHousehold, normalizedPayload) {
  const incomingAccounts = normalizedPayload.household?.accounts ?? normalizedPayload.accounts ?? [];
  const canonicalAccounts = canonicalHousehold.accounts ?? [];

  return incomingAccounts.map((incoming) => {
    const exact = canonicalAccounts.find((account) => account.account_id === incoming.account_id);
    if (exact) {
      return {
        incoming,
        match: exact,
        matchType: "exact",
        confidence: 1
      };
    }

    const heuristic = heuristicMatch(canonicalAccounts, incoming);
    if (heuristic) {
      return {
        incoming,
        match: heuristic.account,
        matchType: "heuristic",
        confidence: heuristic.confidence
      };
    }

    return {
      incoming,
      match: null,
      matchType: "new",
      confidence: 1
    };
  });
}
