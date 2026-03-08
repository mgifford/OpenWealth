import { assembleReport } from "../../reports/assemble-report.js";
import { exportYamlArtifacts } from "../../reports/export-yaml.js";
import { packageReportBundle, serializeBundle } from "../../reports/package-bundle.js";

export function buildReportBundle(input, options = {}) {
  const report = assembleReport(input, options);
  const yamlArtifacts = exportYamlArtifacts(input, options);

  const artifacts = {
    "report.html": report.html,
    ...yamlArtifacts
  };

  const bundle = packageReportBundle(input, artifacts, options);

  return {
    report,
    bundle,
    serializedBundle: serializeBundle(bundle)
  };
}

export function createBundleDownloadPayload(serializedBundle, bundleName) {
  return {
    fileName: `${bundleName}.json`,
    mimeType: "application/json",
    data: serializedBundle
  };
}
