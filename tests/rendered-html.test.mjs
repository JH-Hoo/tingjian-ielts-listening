import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const manifestSource = await readFile(new URL("../app/exercises.ts", import.meta.url), "utf8");
const exercises = JSON.parse(
  manifestSource.replace(/^export const exercises = /, "").replace(/ as const;\s*$/, ""),
);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the listening exercise library", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /听见/);
  assert.match(html, /IELTS Listening Library/);
  assert.match(html, /75/);
  assert.match(html, /单项练习/);
  assert.match(html, /Asia-Pacific Tours Activity Holidays/);
});

test("manifest contains all 75 exercises in the expected part counts", () => {
  assert.equal(exercises.length, 75);
  assert.deepEqual(
    Object.fromEntries(["P1", "P2", "P3", "P4"].map((part) => [
      part,
      exercises.filter((exercise) => exercise.part === part).length,
    ])),
    { P1: 18, P2: 14, P3: 17, P4: 26 },
  );
  assert.equal(new Set(exercises.map((exercise) => exercise.id)).size, 75);
  assert.equal(new Set(exercises.map((exercise) => exercise.href)).size, 75);
});

test("GitHub Pages entrypoint uses repository-safe relative paths", async () => {
  const [index, script, pagesManifest] = await Promise.all([
    readFile(new URL("../public/index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/app.js", import.meta.url), "utf8"),
    readFile(new URL("../public/exercises.json", import.meta.url), "utf8"),
  ]);
  assert.match(index, /href="\.\/app\.css"/);
  assert.match(index, /src="\.\/app\.js"/);
  assert.match(script, /fetch\("\.\/exercises\.json"\)/);
  const publishedExercises = JSON.parse(pagesManifest);
  assert.equal(publishedExercises.length, 75);
  assert.ok(publishedExercises.every((exercise) => exercise.href.startsWith("./exercises/")));
});

test("every exercise has audio, grading controls, and score reporting", async () => {
  for (const exercise of exercises) {
    const root = new URL(`../public/exercises/${exercise.id}/`, import.meta.url);
    const html = await readFile(new URL("index.html", root), "utf8");
    const audioName = html.match(/src=["'](audio\.(?:mp3|m4a))["']/i)?.[1];
    assert.ok(audioName, `${exercise.id} has no local audio reference`);
    const audio = await stat(new URL(audioName, root));
    assert.ok(audio.size > 500_000, `${exercise.id} audio is unexpectedly small`);
    assert.match(html, /id=["'](?:finish-btn|btnFinish)["']/i, `${exercise.id} has no submit control`);
    assert.match(html, /tingjian:score/, `${exercise.id} does not report its score`);
  }
});
