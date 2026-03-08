import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const DIST_ROOT = join(process.cwd(), "dist");
const RELEASE_ROOT = join(DIST_ROOT, "release");

async function listFiles(root) {
  const results = [];

  async function walk(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        results.push(full);
      }
    }
  }

  await walk(root);
  return results.sort();
}

async function main() {
  await mkdir(RELEASE_ROOT, { recursive: true });

  const files = await listFiles(DIST_ROOT);
  const inventory = [];

  for (const file of files) {
    if (file.startsWith(RELEASE_ROOT)) {
      continue;
    }
    const fileStat = await stat(file);
    inventory.push({
      path: relative(process.cwd(), file).replaceAll("\\", "/"),
      size_bytes: fileStat.size
    });
  }

  const generatedAt = new Date().toISOString();
  const manifest = {
    release_version: process.env.GITHUB_REF_NAME ?? "snapshot",
    commit: process.env.GITHUB_SHA ?? "local",
    generated_at: generatedAt,
    inventory
  };

  const changelog = [
    "# OpenWealth Release Package",
    "",
    `Generated at: ${generatedAt}`,
    `Commit: ${manifest.commit}`,
    "",
    "## Included Artifacts",
    ...inventory.map((item) => `- ${item.path} (${item.size_bytes} bytes)`)
  ].join("\n");

  await writeFile(join(RELEASE_ROOT, "release-manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(join(RELEASE_ROOT, "CHANGELOG_AUTOGEN.md"), `${changelog}\n`, "utf8");

  console.log(`Release package prepared with ${inventory.length} file(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
