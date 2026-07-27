import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  pdfOnlyExercises,
  renderPdfOnlyExercise,
} from "./pdf-only-exercises.mjs";

const outputRoot = join(process.cwd(), "public", "exercises");

for (const [exerciseKey, exercise] of Object.entries(pdfOnlyExercises)) {
  const exerciseDir = join(outputRoot, exercise.id);
  mkdirSync(exerciseDir, { recursive: true });
  writeFileSync(
    join(exerciseDir, "index.html"),
    renderPdfOnlyExercise(exerciseKey, "audio.m4a").replace(/[ \t]+$/gm, ""),
  );
}

console.log(
  `Rebuilt ${Object.keys(pdfOnlyExercises).length} PDF-only exercises.`,
);
