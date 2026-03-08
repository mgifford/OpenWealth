function nowIso() {
  return new Date().toISOString();
}

export function migrateToV1_0_0(document) {
  const next = { ...document };

  if (!next.schema_version) {
    next.schema_version = "1.0.0";
  }

  if (!next.updated_at) {
    next.updated_at = nowIso();
  }

  if (!Array.isArray(next.accounts)) {
    next.accounts = [];
  }

  if (!Array.isArray(next.goals)) {
    next.goals = [];
  }

  return next;
}
