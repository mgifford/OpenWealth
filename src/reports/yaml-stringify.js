function needsQuotes(value) {
  if (value.length === 0) {
    return true;
  }
  return /[\[\]{}#,\n\r\t]|^\s|\s$/.test(value);
}

function scalarToYaml(value) {
  if (value === null) {
    return "null";
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  const text = String(value);
  if (!needsQuotes(text)) {
    return text;
  }

  return JSON.stringify(text);
}

function writeNode(node, indentLevel, lines) {
  const indent = "  ".repeat(indentLevel);

  if (Array.isArray(node)) {
    if (node.length === 0) {
      lines.push(`${indent}[]`);
      return;
    }

    for (const item of node) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const entries = Object.entries(item);
        if (entries.length === 0) {
          lines.push(`${indent}- {}`);
          continue;
        }

        const [firstKey, firstValue] = entries[0];
        if (firstValue !== null && typeof firstValue === "object") {
          lines.push(`${indent}- ${firstKey}:`);
          writeNode(firstValue, indentLevel + 2, lines);
        } else {
          lines.push(`${indent}- ${firstKey}: ${scalarToYaml(firstValue)}`);
        }

        for (let index = 1; index < entries.length; index += 1) {
          const [key, value] = entries[index];
          if (value !== null && typeof value === "object") {
            lines.push(`${indent}  ${key}:`);
            writeNode(value, indentLevel + 2, lines);
          } else {
            lines.push(`${indent}  ${key}: ${scalarToYaml(value)}`);
          }
        }
      } else if (Array.isArray(item)) {
        lines.push(`${indent}-`);
        writeNode(item, indentLevel + 1, lines);
      } else {
        lines.push(`${indent}- ${scalarToYaml(item)}`);
      }
    }
    return;
  }

  if (node && typeof node === "object") {
    const entries = Object.entries(node);
    if (entries.length === 0) {
      lines.push(`${indent}{}`);
      return;
    }

    for (const [key, value] of entries) {
      if (value !== null && typeof value === "object") {
        lines.push(`${indent}${key}:`);
        writeNode(value, indentLevel + 1, lines);
      } else {
        lines.push(`${indent}${key}: ${scalarToYaml(value)}`);
      }
    }
    return;
  }

  lines.push(`${indent}${scalarToYaml(node)}`);
}

export function stringifyYaml(value) {
  const lines = [];
  writeNode(value, 0, lines);
  return `${lines.join("\n")}\n`;
}
