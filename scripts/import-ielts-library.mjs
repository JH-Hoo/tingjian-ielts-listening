import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  pdfOnlyExercises,
  renderPdfOnlyExercise,
} from "./pdf-only-exercises.mjs";

const sourceRoot = process.argv[2];
if (!sourceRoot || !existsSync(sourceRoot)) {
  throw new Error("Pass the extracted IELTS Listening source directory.");
}

const projectRoot = process.cwd();
const outputRoot = join(projectRoot, "public", "exercises");
mkdirSync(outputRoot, { recursive: true });

const naturalNumber = (name) => Number(name.match(/^(\d+)/)?.[1] ?? 9999);
const cleanTitle = (name) =>
  name
    .replace(/\.zip$/i, "")
    .replace(/^\d+\.\s*P[1-4]\s*/i, "")
    .trim();

const bridgeScript = (exerciseId) => `
<script>
(() => {
  const reportScore = () => window.setTimeout(() => {
    const graded = [...document.querySelectorAll('.q-nav-item.correct,.q-nav-item.incorrect')];
    const weight = item => {
      const value = item.dataset.qnum || item.textContent.trim();
      const match = value.match(/(\\d+)\\s*-\\s*(\\d+)/);
      return match ? Number(match[2]) - Number(match[1]) + 1 : 1;
    };
    const score = graded.filter(item => item.classList.contains('correct')).reduce((sum,item) => sum + weight(item), 0);
    const total = graded.reduce((sum,item) => sum + weight(item), 0);
    const scoreText = document.querySelector('#scoreNum')?.textContent || '';
    const scoreMatch = scoreText.match(/(\\d+)\\s*\\/\\s*(\\d+)/);
    const finalScore = total > 0 ? score : Number(scoreMatch?.[1] || 0);
    const finalTotal = total > 0 ? total : Number(scoreMatch?.[2] || 0);
    if (finalTotal > 0) {
      window.parent.postMessage({
        type: 'tingjian:score',
        exerciseId: ${JSON.stringify(exerciseId)},
        score: finalScore,
        total: finalTotal,
        practicedAt: new Date().toISOString()
      }, '*');
    }
  }, 300);
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#finish-btn,#btnFinish')?.addEventListener('click', reportScore);
  });
})();
</script>`;

const manifest = [];
for (const part of ["P1", "P2", "P3", "P4"]) {
  const zipFiles = readdirSync(join(sourceRoot, part))
    .filter((name) => name.toLowerCase().endsWith(".zip"))
    .sort((a, b) => naturalNumber(a) - naturalNumber(b));

  zipFiles.forEach((zipName, index) => {
    const sourceNo = naturalNumber(zipName);
    const exerciseId = `${part.toLowerCase()}-${String(index + 1).padStart(2, "0")}`;
    const exerciseDir = join(outputRoot, exerciseId);
    mkdirSync(exerciseDir, { recursive: true });

    const temp = mkdtempSync(join(tmpdir(), "tingjian-import-"));
    execFileSync("/usr/bin/ditto", ["-x", "-k", join(sourceRoot, part, zipName), temp]);
    const files = [];
    const walk = (directory) => {
      for (const name of readdirSync(directory)) {
        const full = join(directory, name);
        if (statSync(full).isDirectory()) walk(full);
        else files.push(full);
      }
    };
    walk(temp);

    const html = files.find((file) => file.toLowerCase().endsWith(".html"));
    const audio = files.find((file) => file.toLowerCase().endsWith(".mp3"));
    if (!audio) throw new Error(`Missing audio: ${zipName}`);
    cpSync(audio, join(exerciseDir, "audio.mp3"));

    const missingKey = `${part}-${sourceNo}`;
    if (html) {
      let page = readFileSync(html, "utf8");
      page = page.replace(/<\/body>/i, `${bridgeScript(exerciseId)}</body>`);
      writeFileSync(join(exerciseDir, "index.html"), page);
    } else if (pdfOnlyExercises[missingKey]) {
      writeFileSync(
        join(exerciseDir, "index.html"),
        renderPdfOnlyExercise(missingKey, "audio.mp3").replace(/[ \t]+$/gm, ""),
      );
    } else {
      throw new Error(`No HTML or custom exercise data: ${zipName}`);
    }

    manifest.push({
      id: exerciseId,
      part,
      ordinal: index + 1,
      sourceNo,
      title: cleanTitle(zipName),
      href: `/exercises/${exerciseId}/`,
      hasTranscript: Boolean(html) || missingKey === "P1-1" || missingKey === "P4-2",
    });
    rmSync(temp, { recursive: true });
  });
}

writeFileSync(
  join(projectRoot, "app", "exercises.ts"),
  `export const exercises = ${JSON.stringify(manifest, null, 2)} as const;\n`,
);
console.log(`Imported ${manifest.length} exercises.`);
