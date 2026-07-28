import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const exercisesRoot = join(process.cwd(), "public", "exercises");
const legacyBridge =
  /\n<script>\s*\(\(\) => \{\s*const reportScore = \(\) => window\.setTimeout\(\(\) => \{[\s\S]*?\}\)\(\);\s*<\/script>(?=<\/body>)/;
const installedBridge =
  /\n<script src="\.\.\/\.\.\/score-bridge\.js" data-exercise-id="[^"]+"><\/script>/;

let updated = 0;
for (const exerciseId of readdirSync(exercisesRoot)) {
  const file = join(exercisesRoot, exerciseId, "index.html");
  let html = readFileSync(file, "utf8");
  if (!legacyBridge.test(html) && !installedBridge.test(html)) continue;

  const bridge = `\n<script src="../../score-bridge.js" data-exercise-id="${exerciseId}"></script>`;
  if (html.includes(bridge)) continue;
  const nextHtml = installedBridge.test(html)
    ? html.replace(installedBridge, bridge)
    : html.replace(legacyBridge, bridge);
  if (nextHtml === html) {
    throw new Error(`Could not install score bridge in ${exerciseId}`);
  }
  writeFileSync(file, nextHtml);
  updated += 1;
}

console.log(`Installed the IELTS score bridge in ${updated} exercises.`);
