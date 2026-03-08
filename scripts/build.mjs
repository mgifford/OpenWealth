import { mkdir, copyFile, cp } from "node:fs/promises";
import { resolve } from "node:path";

const distRoot = resolve("dist");
await mkdir(distRoot, { recursive: true });
await mkdir(resolve(distRoot, "src"), { recursive: true });

// Baseline build copies starter assets so CI can validate build path.
await cp(resolve("src"), resolve(distRoot, "src"), { recursive: true });
await copyFile(resolve("index.html"), resolve(distRoot, "index.html"));

console.log("Build complete: dist/");
