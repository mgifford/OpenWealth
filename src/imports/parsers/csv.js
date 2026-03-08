function splitCsvLine(line) {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const next = line[index + 1];
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsv(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    throw new Error("CSV import requires a header and at least one data row");
  }

  const headers = splitCsvLine(lines[0]);
  const records = lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    const row = {};

    for (let index = 0; index < headers.length; index += 1) {
      row[headers[index]] = values[index] ?? "";
    }

    return row;
  });

  return {
    headers,
    records
  };
}
