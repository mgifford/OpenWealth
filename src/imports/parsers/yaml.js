import { parse as parseYamlText } from "yaml";

export function parseYaml(content) {
  return parseYamlText(content);
}
