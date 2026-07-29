import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const manifest = JSON.parse(
  readFileSync(join(root, "public", "exercises.json"), "utf8"),
);
const data = JSON.parse(
  readFileSync(join(root, "public", "explanations.json"), "utf8"),
);
const errors = [];
let explanationUnits = 0;
let representedQuestions = 0;

for (const exercise of manifest) {
  const page = data.exercises?.[exercise.id];
  if (!page) {
    errors.push(`${exercise.id}: missing explanation page`);
    continue;
  }
  const file = join(root, "public", "exercises", exercise.id, "index.html");
  const html = readFileSync(file, "utf8");
  const expectedBridge = `<script src="../../explanation-bridge.js" data-exercise-id="${exercise.id}"></script>`;
  if (!html.includes(expectedBridge)) {
    errors.push(`${exercise.id}: explanation bridge is not installed`);
  }
  for (const [questionId, item] of Object.entries(page)) {
    explanationUnits += 1;
    representedQuestions += item.numbers?.length || 0;
    for (const field of [
      "numbers",
      "answer",
      "answerText",
      "location",
      "evidence",
      "keyQuote",
      "reason",
      "source",
    ]) {
      const value = item[field];
      if (
        value == null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors.push(`${exercise.id} Q${questionId}: missing ${field}`);
      }
    }
    if (!/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(item.location || "")) {
      errors.push(`${exercise.id} Q${questionId}: invalid location ${item.location}`);
    }
    if (!item.reason?.includes(item.location)) {
      errors.push(`${exercise.id} Q${questionId}: reason omits location`);
    }
  }
}

const directories = readdirSync(join(root, "public", "exercises"));
if (directories.length !== manifest.length) {
  errors.push(
    `exercise directory count ${directories.length} != manifest count ${manifest.length}`,
  );
}
if (Object.keys(data.exercises || {}).length !== 75) {
  errors.push(`explanation exercise count is not 75`);
}
if (explanationUnits !== 736) {
  errors.push(`explanation unit count ${explanationUnits} != 736`);
}
if (representedQuestions !== 750) {
  errors.push(`represented question count ${representedQuestions} != 750`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  JSON.stringify(
    {
      exercises: Object.keys(data.exercises).length,
      explanationUnits,
      representedQuestions,
      bridgeInstalled: manifest.length,
    },
    null,
    2,
  ),
);
