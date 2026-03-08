import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const DATA_ROOT = join(process.cwd(), "data", "public");
const OUTPUT_ROOT = join(process.cwd(), "dist", "data-refresh");

async function listFiles(root) {
  const results = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
        continue;
      }
      if (entry.name === ".gitkeep") {
        continue;
      }
      results.push(fullPath);
    }
  }

  await walk(root);
  return results.sort();
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function main() {
  await mkdir(OUTPUT_ROOT, { recursive: true });

  const files = await listFiles(DATA_ROOT);
  const records = [];

  for (const filePath of files) {
    const content = await readFile(filePath);
    records.push({
      path: relative(process.cwd(), filePath).replaceAll("\\", "/"),
      sha256: sha256(content),
      bytes: content.length
    });
  }

  const generatedAt = new Date().toISOString();
  const checksumLines = records.map((record) => `${record.sha256}  ${record.path}`);
  const changelog = [
    `# Public Data Refresh`,
    "",
    `Generated at: ${generatedAt}`,
    "",
    "## Dataset Inventory",
    ...records.map((record) => `- ${record.path} (${record.bytes} bytes)`)
  ].join("\n");

  await writeFile(join(OUTPUT_ROOT, "checksums.txt"), `${checksumLines.join("\n")}\n`, "utf8");
  await writeFile(join(OUTPUT_ROOT, "changelog.md"), `${changelog}\n`, "utf8");
  await writeFile(
    join(OUTPUT_ROOT, "refresh-manifest.json"),
    `${JSON.stringify({ generated_at: generatedAt, records }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Public data refresh prepared ${records.length} file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
