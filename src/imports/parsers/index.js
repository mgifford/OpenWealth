import { parseJson } from "./json.js";
import { parseYaml } from "./yaml.js";
import { parseCsv } from "./csv.js";

export function parseImportContent(format, content) {
  if (format === "json") {
    return parseJson(content);
  }

  if (format === "yaml") {
    return parseYaml(content);
  }

  if (format === "csv") {
    return parseCsv(content);
  }

  throw new Error(`Unsupported import format: ${format}`);
}
