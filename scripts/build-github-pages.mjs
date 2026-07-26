import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const source = readFileSync(join(projectRoot, "app", "exercises.ts"), "utf8");
const exercises = JSON.parse(
  source.replace(/^export const exercises = /, "").replace(/ as const;\s*$/, ""),
);
const pagesManifest = exercises.map((exercise) => ({
  ...exercise,
  href: `./exercises/${exercise.id}/`,
}));
writeFileSync(
  join(projectRoot, "public", "exercises.json"),
  `${JSON.stringify(pagesManifest, null, 2)}\n`,
);
console.log(`Prepared ${pagesManifest.length} exercises for GitHub Pages.`);
