import { buildManifest } from "./manifest.js";
import { sha256Hex, utf8Size, encodeBase64Utf8 } from "./crypto-utils.js";

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

function inferMimeType(fileName) {
  if (fileName.endsWith(".html")) {
    return "text/html";
  }
  if (fileName.endsWith(".yaml") || fileName.endsWith(".yml")) {
    return "application/yaml";
  }
  if (fileName.endsWith(".json")) {
    return "application/json";
  }
  if (fileName.endsWith(".md")) {
    return "text/markdown";
  }
  return "text/plain";
}

function canonicalArtifactString(artifact) {
  return [
    artifact.name,
    artifact.mime_type,
    artifact.encoding,
    artifact.sha256,
    String(artifact.size_bytes),
    artifact.content_base64
  ].join("|");
}

export function serializeBundle(bundle) {
  const orderedNames = Object.keys(bundle.files).sort((left, right) => left.localeCompare(right));
  const artifacts = orderedNames.map((name) => {
    const content = bundle.files[name];
    return {
      name,
      mime_type: inferMimeType(name),
      encoding: "utf-8",
      sha256: sha256Hex(content),
      size_bytes: utf8Size(content),
      content_base64: encodeBase64Utf8(content)
    };
  });

  const manifestArtifact = artifacts.find((artifact) => artifact.name === "manifest.json");
  const bundleIntegritySeed = artifacts.map(canonicalArtifactString).join("\n");

  const externalBundle = {
    format: "application/vnd.openwealth.bundle+json",
    format_version: "1.1.0",
    bundle_name: bundle.bundle_name,
    generated_at: bundle.generated_at,
    manifest_sha256: manifestArtifact?.sha256 ?? null,
    bundle_sha256: sha256Hex(bundleIntegritySeed),
    artifacts
  };

  return JSON.stringify(externalBundle, null, 2);
}
