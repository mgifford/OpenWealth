import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

function toMondayUtc(date) {
  const copy = new Date(date);
  const day = copy.getUTCDay();
  const diff = (day + 6) % 7;
  copy.setUTCDate(copy.getUTCDate() - diff);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

async function main() {
  const logFile = resolve("logs", "llm-usage.jsonl");
  let contents = "";

  try {
    contents = await readFile(logFile, "utf8");
  } catch (error) {
    if (error && error.code === "ENOENT") {
      console.log("No usage log found yet. Start with `npm run ollama:run` or `npm run copilot:log`.");
      return;
    }
    throw error;
  }

  const lines = contents
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const now = new Date();
  const weekStart = toMondayUtc(now);

  const records = lines
    .map((line) => JSON.parse(line))
    .filter((record) => new Date(record.timestamp) >= weekStart);

  const localCount = records.filter((record) => String(record.provider).includes("ollama")).length;
  const copilotCount = records.filter((record) => String(record.provider).includes("copilot")).length;
  const total = localCount + copilotCount;

  if (total === 0) {
    console.log("No local/cached usage records found for this week.");
    return;
  }

  const localShare = (localCount / total) * 100;
  const otherCount = records.length - total;

  const kindCounts = records.reduce((acc, record) => {
    const key = String(record.kind ?? "general");
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Week starting ${weekStart.toISOString().slice(0, 10)}`);
  console.log(`Total logged queries: ${records.length}`);
  console.log(`Local Ollama queries: ${localCount}`);
  console.log(`Copilot queries: ${copilotCount}`);
  console.log(`Other provider queries: ${otherCount}`);
  console.log(`Local share: ${localShare.toFixed(1)}%`);
  console.log("By kind:");

  for (const [kind, count] of Object.entries(kindCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`- ${kind}: ${count}`);
  }

  console.log("\nPR snippet:");
  console.log(`- LLM query mix (week of ${weekStart.toISOString().slice(0, 10)}): local-ollama ${localCount}, copilot ${copilotCount}, share ${localShare.toFixed(1)}% local.`);

  if (localShare < 80) {
    console.log("Status: below target (80%).");
  } else {
    console.log("Status: on target (>=80%).");
  }
}

main().catch((error) => {
  console.error(`[llm-ratio] ${error.message}`);
  process.exitCode = 1;
});
