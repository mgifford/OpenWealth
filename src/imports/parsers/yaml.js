function parseScalar(text) {
  const trimmed = text.trim();

  if (trimmed === "null") {
    return null;
  }
  if (trimmed === "true") {
    return true;
  }
  if (trimmed === "false") {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseKeyValue(line) {
  const separator = line.indexOf(":");
  if (separator < 0) {
    throw new Error(`Invalid YAML line: ${line}`);
  }

  const key = line.slice(0, separator).trim();
  const rawValue = line.slice(separator + 1).trim();
  return {
    key,
    hasValue: rawValue.length > 0,
    value: parseScalar(rawValue)
  };
}

export function parseYaml(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.replace(/\t/g, "  "))
    .filter((line) => line.trim().length > 0 && !line.trim().startsWith("#"));

  const root = {};
  let activeArray = null;
  let activeArrayIndent = -1;

  for (const line of lines) {
    const indent = line.length - line.trimStart().length;
    const trimmed = line.trim();

    if (trimmed.startsWith("- ")) {
      if (!activeArray) {
        throw new Error(`Unexpected list item in YAML: ${line}`);
      }

      const itemText = trimmed.slice(2).trim();
      if (itemText.length === 0) {
        activeArray.push({});
        continue;
      }

      const parsed = parseKeyValue(itemText);
      activeArray.push({ [parsed.key]: parsed.hasValue ? parsed.value : {} });
      continue;
    }

    if (activeArray && indent <= activeArrayIndent) {
      activeArray = null;
      activeArrayIndent = -1;
    }

    const parsed = parseKeyValue(trimmed);
    if (!parsed.hasValue) {
      root[parsed.key] = [];
      activeArray = root[parsed.key];
      activeArrayIndent = indent;
    } else if (activeArray && activeArray.length > 0 && indent > activeArrayIndent) {
      activeArray[activeArray.length - 1][parsed.key] = parsed.value;
    } else {
      root[parsed.key] = parsed.value;
    }
  }

  return root;
}
