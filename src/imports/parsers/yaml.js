function parseScalar(text) {
  const trimmed = text.trim();

  if (trimmed === "null") {
    return null;
  }
  if (trimmed === "[]") {
    return [];
  }
  if (trimmed === "{}") {
    return {};
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

function stripComments(line) {
  const hashIndex = line.indexOf(" #");
  return hashIndex >= 0 ? line.slice(0, hashIndex) : line;
}

function splitKeyValue(text) {
  const separator = text.indexOf(":");
  if (separator < 0) {
    throw new Error(`Invalid YAML line: ${text}`);
  }

  return {
    key: text.slice(0, separator).trim(),
    rawValue: text.slice(separator + 1).trim()
  };
}

function nextMeaningfulLine(lines, startIndex) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const trimmed = lines[index].trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }
    return { line: lines[index], index };
  }

  return null;
}

function popToIndent(stack, indent) {
  while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
    stack.pop();
  }
}

export function parseYaml(content) {
  const lines = content.split(/\r?\n/).map((line) => stripComments(line.replace(/\t/g, "  ")));
  const root = {};
  const stack = [{ type: "object", value: root, indent: -1 }];

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }

    const indent = rawLine.length - rawLine.trimStart().length;
    popToIndent(stack, indent);
    const parent = stack[stack.length - 1];

    if (trimmed.startsWith("- ")) {
      if (parent.type !== "array") {
        throw new Error(`Unexpected list item in YAML: ${trimmed}`);
      }

      const itemText = trimmed.slice(2).trim();
      if (itemText.length === 0) {
        const obj = {};
        parent.value.push(obj);
        stack.push({ type: "object", value: obj, indent });
        continue;
      }

      if (itemText.includes(":")) {
        const { key, rawValue } = splitKeyValue(itemText);
        const obj = {};
        parent.value.push(obj);

        if (rawValue.length === 0) {
          obj[key] = {};
          stack.push({ type: "object", value: obj, indent });
        } else {
          obj[key] = parseScalar(rawValue);
          stack.push({ type: "object", value: obj, indent });
        }
        continue;
      }

      parent.value.push(parseScalar(itemText));
      continue;
    }

    if (parent.type !== "object") {
      throw new Error(`Invalid key-value placement in YAML: ${trimmed}`);
    }

    const { key, rawValue } = splitKeyValue(trimmed);
    if (rawValue.length > 0) {
      parent.value[key] = parseScalar(rawValue);
      continue;
    }

    const upcoming = nextMeaningfulLine(lines, index + 1);
    if (
      upcoming &&
      upcoming.line.length - upcoming.line.trimStart().length > indent &&
      upcoming.line.trim() === "[]"
    ) {
      parent.value[key] = [];
      index = upcoming.index;
      continue;
    }

    if (
      upcoming &&
      upcoming.line.length - upcoming.line.trimStart().length > indent &&
      upcoming.line.trim() === "{}"
    ) {
      parent.value[key] = {};
      index = upcoming.index;
      continue;
    }

    if (upcoming && upcoming.line.length - upcoming.line.trimStart().length > indent && upcoming.line.trim().startsWith("- ")) {
      parent.value[key] = [];
      stack.push({ type: "array", value: parent.value[key], indent });
    } else {
      parent.value[key] = {};
      stack.push({ type: "object", value: parent.value[key], indent });
    }
  }

  return root;
}
