import { parseImportContent } from "./parsers/index.js";
import { normalizeImportPayload } from "./normalize.js";
import { matchRecords } from "./match-records.js";
import { generateImportDiff } from "./diff.js";
import { applyApprovedMerge } from "./apply-merge.js";

export function previewImport({ format, content, canonicalHousehold }) {
  const parsed = parseImportContent(format, content);
  const { normalized, diagnostics } = normalizeImportPayload(format, parsed);
  const matches = matchRecords(canonicalHousehold, normalized);
  const diff = generateImportDiff(canonicalHousehold, matches);

  return {
    parsed,
    normalized,
    diagnostics,
    matches,
    diff
  };
}

export async function applyImport({ preview, approvedChangeIds, sourceFile, repositories }) {
  return applyApprovedMerge({
    importDiff: preview.diff,
    approvedChangeIds,
    sourceFile,
    ...repositories
  });
}
