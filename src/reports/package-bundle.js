import { buildManifest } from "./manifest.js";

function formatDateForBundle(timestamp) {
  return timestamp.slice(0, 10).replaceAll("-", "");
}

export function createBundleName(options) {
  const feature = options.feature ?? "privacy-first-investment-context-dashboard";
  const version = options.version ?? "v1";
  const dateToken = formatDateForBundle(options.generatedAt ?? new Date().toISOString());
  return `openwealth-${feature}-${dateToken}-${version}`;
}

export function packageReportBundle(input, artifacts, options = {}) {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const schemaVersion = options.schemaVersion ?? "1.0.0";

  const bundleName = createBundleName({
    generatedAt,
    feature: options.feature,
    version: options.version
  });

  const manifest = buildManifest(input, artifacts, {
    generatedAt,
    schemaVersion,
    bundleName
  });

  const files = {
    ...artifacts,
    "manifest.json": JSON.stringify(manifest, null, 2)
  };

  return {
    bundle_name: bundleName,
    generated_at: generatedAt,
    files
  };
}

export function serializeBundle(bundle) {
  return JSON.stringify(bundle, null, 2);
}
