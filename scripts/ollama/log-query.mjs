import { mkdir, appendFile } from "node:fs/promises";
import { resolve } from "node:path";

function parseArgs(argv) {
  const args = {
    provider: "local-ollama",
    kind: "general",
    note: ""
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--provider") {
      args.provider = argv[index + 1] ?? args.provider;
      index += 1;
    } else if (token === "--kind") {
      args.kind = argv[index + 1] ?? args.kind;
      index += 1;
    } else if (token === "--note") {
      args.note = argv[index + 1] ?? "";
      index += 1;
    }
  }

  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  const logDir = resolve("logs");
  const logFile = resolve(logDir, "llm-usage.jsonl");

  await mkdir(logDir, { recursive: true });

  const record = {
    timestamp: new Date().toISOString(),
    provider: args.provider,
    kind: args.kind,
    note: args.note
  };

  await appendFile(logFile, `${JSON.stringify(record)}\n`, "utf8");
  console.log(`Logged LLM usage entry to ${logFile}`);
}

main().catch((error) => {
  console.error(`[llm-log] ${error.message}`);
  process.exitCode = 1;
});
