import { ESLint } from "eslint";

const eslint = new ESLint();
const results = await eslint.lintFiles(["src/**/*.js", "tests/**/*.mjs", "scripts/**/*.mjs"]);
const formatter = await eslint.loadFormatter("stylish");
const output = formatter.format(results);

if (output.trim()) {
  console.log(output);
}

const errorCount = results.reduce((count, result) => count + result.errorCount, 0);
if (errorCount > 0) {
  process.exitCode = 1;
}
