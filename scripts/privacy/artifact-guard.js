import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.argv[2] ? join(process.cwd(), process.argv[2]) : join(process.cwd(), "dist");

const FORBIDDEN_PATH_PATTERNS = [
  /(^|\/)private(\/|$)/i,
  /(^|\/)secrets?(\/|$)/i,
  /(^|\/)households?(\/|$)/i,
  /\.env/i,
  /(^|\/)tmp(\/|$)/i
];

const FORBIDDEN_CONTENT_PATTERNS = [/social insurance number/i, /\bSIN\b/, /passport number/i, /bank account number/i];

async function listFiles(dir) {
  const files = [];

  async function walk(current) {
    const entries = await readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

function pathIsForbidden(path) {
  return FORBIDDEN_PATH_PATTERNS.some((pattern) => pattern.test(path));
}

function contentIsForbidden(content) {
  return FORBIDDEN_CONTENT_PATTERNS.some((pattern) => pattern.test(content));
}

async function main() {
  const files = await listFiles(root);
  const violations = [];

  for (const filePath of files) {
    const relativePath = relative(process.cwd(), filePath).replaceAll("\\", "/");
    if (pathIsForbidden(relativePath)) {
      violations.push(`Forbidden artifact path: ${relativePath}`);
      continue;
    }

    const content = await readFile(filePath, "utf8");
    if (contentIsForbidden(content)) {
      violations.push(`Forbidden content pattern in: ${relativePath}`);
    }
  }

  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(`::error::${violation}`);
    }
    throw new Error(`Artifact guard failed with ${violations.length} violation(s).`);
  }

  console.log(`Artifact guard passed for ${files.length} file(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
