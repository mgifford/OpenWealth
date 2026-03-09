import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { mkdir, appendFile } from "node:fs/promises";
import { resolve } from "node:path";

function parseArgs(argv) {
  const args = {
    model: process.env.OLLAMA_MODEL ?? "qwen2.5-coder:7b",
    promptFile: "",
    logProvider: "local-ollama",
    kind: "general",
    note: "",
    skipLog: false
  };

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--model") {
      args.model = argv[index + 1] ?? args.model;
      index += 1;
    } else if (token === "--prompt-file") {
      args.promptFile = argv[index + 1] ?? "";
      index += 1;
    } else if (token === "--provider") {
      args.logProvider = argv[index + 1] ?? args.logProvider;
      index += 1;
    } else if (token === "--kind") {
      args.kind = argv[index + 1] ?? args.kind;
      index += 1;
    } else if (token === "--note") {
      args.note = argv[index + 1] ?? "";
      index += 1;
    } else if (token === "--skip-log") {
      args.skipLog = true;
    }
  }

  return args;
}

async function logUsage(record) {
  const logDir = resolve("logs");
  const logFile = resolve(logDir, "llm-usage.jsonl");
  await mkdir(logDir, { recursive: true });
  await appendFile(logFile, `${JSON.stringify(record)}\n`, "utf8");
}

async function readPrompt(promptFile) {
  if (promptFile) {
    return readFile(promptFile, "utf8");
  }

  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  return chunks.join("").trim();
}

function runOllama(model, prompt) {
  return new Promise((resolve, reject) => {
    const child = spawn("ollama", ["run", model], { stdio: ["pipe", "pipe", "inherit"] });

    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
      process.stdout.write(chunk);
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`ollama run exited with code ${code}`));
        return;
      }
      resolve(output);
    });

    child.stdin.write(prompt);
    child.stdin.end();
  });
}

async function main() {
  const args = parseArgs(process.argv);
  const prompt = await readPrompt(args.promptFile);

  if (!prompt) {
    throw new Error("Prompt is empty. Provide --prompt-file <path> or pipe text into stdin.");
  }

  await runOllama(args.model, prompt);

  if (!args.skipLog) {
    await logUsage({
      timestamp: new Date().toISOString(),
      provider: args.logProvider,
      kind: args.kind,
      note: args.note,
      model: args.model,
      promptChars: prompt.length
    });
  }

  console.error(`\n[ollama] model=${args.model}`);
  console.error(`[ollama] logged=${args.skipLog ? "no" : "yes"}`);
}

main().catch((error) => {
  console.error(`[ollama] ${error.message}`);
  process.exitCode = 1;
});
