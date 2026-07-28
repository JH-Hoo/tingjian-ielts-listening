import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normalizeAnswerKeyCollections } from "./grading-safety.mjs";

const exerciseRoot = join(process.cwd(), "public", "exercises");
const changed = [];

for (const exerciseId of readdirSync(exerciseRoot).sort()) {
  const file = join(exerciseRoot, exerciseId, "index.html");
  if (!existsSync(file)) continue;
  const original = readFileSync(file, "utf8");
  const normalized = normalizeAnswerKeyCollections(original);
  if (normalized === original) continue;
  writeFileSync(file, normalized);
  changed.push(exerciseId);
}

console.log(`Hardened ${changed.length} exercise pages: ${changed.join(", ") || "none"}`);
