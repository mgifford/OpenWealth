import { createSnapshotService, createHouseholdRepository } from "../state/index.js";
import { createProvenanceRecorder } from "./provenance.js";

function applyAccountChange(accounts, change) {
  if (change.operation === "add") {
    return accounts.concat([change.new_value]);
  }

  const accountId = change.entity_id;
  const target = accounts.find((account) => account.account_id === accountId);
  if (!target) {
    return accounts;
  }

  const field = change.path.split("/").at(-1);
  target[field] = change.new_value;
  return accounts;
}

export function createApprovalGate(importDiff) {
  return {
    preview() {
      return importDiff;
    },
    evaluate(approvedChangeIds) {
      const approvedSet = new Set(approvedChangeIds);
      const approved = importDiff.proposedChanges.filter((change) => approvedSet.has(change.change_id));
      const rejected = importDiff.proposedChanges.filter((change) => !approvedSet.has(change.change_id));
      return { approved, rejected };
    }
  };
}

export async function applyApprovedMerge(options) {
  const householdRepository = options.householdRepository ?? createHouseholdRepository(options);
  const snapshotService = options.snapshotService ?? createSnapshotService(options);
  const provenanceRecorder = options.provenanceRecorder ?? createProvenanceRecorder(options);

  const gate = createApprovalGate(options.importDiff);
  const { approved } = gate.evaluate(options.approvedChangeIds);

  if (approved.length === 0) {
    return { applied: 0, snapshot: null, provenance: [] };
  }

  const current = await householdRepository.load();
  if (!current) {
    throw new Error("No canonical household to merge into");
  }

  const snapshot = await snapshotService.createSnapshot("pre-import-merge");

  const next = {
    ...current,
    accounts: [...(current.accounts ?? [])]
  };

  for (const change of approved) {
    if (change.entity === "account") {
      next.accounts = applyAccountChange(next.accounts, change);
    }
  }

  const saved = await householdRepository.save(next);
  const provenance = await provenanceRecorder.append(approved, options.sourceFile ?? "import", true);

  return {
    applied: approved.length,
    household: saved,
    snapshot,
    provenance
  };
}
