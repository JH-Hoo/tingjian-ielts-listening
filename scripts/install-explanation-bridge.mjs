import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const exercisesRoot = join(process.cwd(), "public", "exercises");
const installedBridge =
  /\n<script src="\.\.\/\.\.\/explanation-bridge\.js" data-exercise-id="[^"]+"><\/script>/;

let updated = 0;
for (const exerciseId of readdirSync(exercisesRoot)) {
  const file = join(exercisesRoot, exerciseId, "index.html");
  let html = readFileSync(file, "utf8");
  const bridge = `\n<script src="../../explanation-bridge.js" data-exercise-id="${exerciseId}"></script>`;
  let nextHtml = html.replaceAll(
    "源文件未提供逐题解析。",
    "提交后显示听力原文定位与解析。",
  );
  if (!nextHtml.includes(bridge)) {
    if (installedBridge.test(nextHtml)) {
      nextHtml = nextHtml.replace(installedBridge, bridge);
    } else {
      nextHtml = nextHtml.replace(/<\/body>/i, `${bridge}</body>`);
    }
  }
  if (nextHtml === html) continue;
  writeFileSync(file, nextHtml);
  updated += 1;
}

console.log(`Installed the transcript explanation bridge in ${updated} exercises.`);
