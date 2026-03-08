export function appName() {
  return "OpenWealth";
}

export { buildReportSections } from "./reports/index.js";
export {
  assembleReport,
  exportYamlArtifacts,
  buildManifest,
  packageReportBundle,
  serializeBundle
} from "./reports/index.js";
