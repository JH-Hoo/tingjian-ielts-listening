import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { answerKeySafetyIssues } from "../scripts/grading-safety.mjs";

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
  assert.match(index, /id="highlight-toggle"/);
  assert.match(index, /id="highlight-clear"/);
  assert.match(script, /tingjian\.highlights\.v1/);
  assert.match(script, /installFrameHighlighter/);
  assert.match(script, /mark\.tingjian-highlight/);
  assert.match(script, /event\.preventDefault\(\)/);
  assert.match(script, /event\.stopPropagation\(\)/);
  assert.match(script, /\.result-label/);
  assert.match(script, /\.results-in-page/);
  assert.match(index, /aria-keyshortcuts="H"/);
  assert.match(script, /handleHighlightShortcut/);
  assert.match(script, /isEditableShortcutTarget/);
  assert.match(script, /restoreHighlightChange\(event\.shiftKey \? "redo" : "undo"\)/);
  const scoreKey = script.match(/const SCORE_KEY = "([^"]+)"/)?.[1];
  const highlightKey = script.match(/const HIGHLIGHT_KEY = "([^"]+)"/)?.[1];
  assert.ok(scoreKey && highlightKey);
  assert.notEqual(scoreKey, highlightKey);
  const publishedExercises = JSON.parse(pagesManifest);
  assert.equal(publishedExercises.length, 75);
  assert.ok(publishedExercises.every((exercise) => exercise.href.startsWith("./exercises/")));
});

test("every exercise offers 1.2x audio playback", async () => {
  const pages = await Promise.all(exercises.map((exercise) =>
    readFile(new URL(`../public/exercises/${exercise.id}/index.html`, import.meta.url), "utf8")
  ));
  pages.forEach((html, index) => {
    assert.match(
      html,
      /<option[^>]+value=["']1\.2["']/i,
      `${exercises[index].id} has no 1.2x speed option`,
    );
  });
});

test("every exercise can render an answer review without unsafe answer-key reads", async () => {
  const pages = await Promise.all(exercises.map((exercise) =>
    readFile(new URL(`../public/exercises/${exercise.id}/index.html`, import.meta.url), "utf8")
  ));
  pages.forEach((html, index) => {
    const exerciseId = exercises[index].id;
    assert.deepEqual(
      answerKeySafetyIssues(html),
      [],
      `${exerciseId} directly reads an undefined answer-key collection`,
    );
    const hasAnswerReview =
      html.includes('class="answer-panel"') ||
      (html.includes("results-in-page") && html.includes("Correct Answer")) ||
      (html.includes("renderReview") && html.includes("scoreNum"));
    assert.ok(hasAnswerReview, `${exerciseId} has no answer-review output`);

    const configuration = html.match(
      /<script[^>]*id=["']task-configuration["'][^>]*>([\s\S]*?)<\/script>/i,
    )?.[1];
    if (configuration) {
      const context = {};
      new vm.Script(
        configuration.replace(
          /\bconst\s+CONFIG_DATA\s*=/,
          "globalThis.CONFIG_DATA =",
        ),
      ).runInNewContext(context);
      for (const question of context.CONFIG_DATA.questionList) {
        const answerKey = `q${String(question).replace("-", "_")}`;
        const matchingCollections = Object.entries(context.CONFIG_DATA.answerKey)
          .filter(([, answers]) =>
            answers &&
            typeof answers === "object" &&
            Object.prototype.hasOwnProperty.call(answers, answerKey)
          );
        assert.equal(
          matchingCollections.length,
          1,
          `${exerciseId} question ${question} does not have exactly one configured answer`,
        );
      }
    } else if (html.includes("renderReview") && html.includes("scoreNum")) {
      assert.equal(
        (html.match(/\bdata-answer=/g) ?? []).length,
        10,
        `${exerciseId} does not configure all 10 answers`,
      );
    } else {
      const gradableTags = [...html.matchAll(
        /<[^>]*class="[^"]*\bgradable\b[^"]*"[^>]*>/g,
      )].map((match) => match[0]);
      assert.ok(gradableTags.length > 0, `${exerciseId} has no gradable questions`);
      assert.ok(
        gradableTags.every((tag) => /\bdata-answers?=/.test(tag)),
        `${exerciseId} has a gradable question without an answer`,
      );
    }

    let scriptNumber = 0;
    for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
      scriptNumber += 1;
      assert.doesNotThrow(
        () => new vm.Script(match[1], { filename: `${exerciseId}#script-${scriptNumber}` }),
        `${exerciseId} contains invalid grading JavaScript`,
      );
    }
  });
});

test("multiple-choice groups award one mark per correct option", async () => {
  const bridgeSource = await readFile(
    new URL("../public/score-bridge.js", import.meta.url),
    "utf8",
  );
  const listeners = {};
  const context = {
    window: {
      addEventListener(type, listener) {
        listeners[type] = listener;
      },
      parent: { postMessage() {} },
      setTimeout() {},
    },
    document: {
      currentScript: { dataset: { exerciseId: "test" } },
      createElement() {
        return {};
      },
      head: { appendChild() {} },
      querySelector() {
        return null;
      },
      querySelectorAll() {
        return [];
      },
    },
    Set,
  };
  new vm.Script(bridgeSource).runInNewContext(context);
  const { scoreMultipleSelection } = context.window.TingjianScoreBridge;
  assert.equal(scoreMultipleSelection(["C", "E"], ["C", "E"]), 2);
  assert.equal(scoreMultipleSelection(["E", "C"], ["C", "E"]), 2);
  assert.equal(scoreMultipleSelection(["C", "A"], ["C", "E"]), 1);
  assert.equal(scoreMultipleSelection(["C"], ["C", "E"]), 1);
  assert.equal(scoreMultipleSelection(["A", "B"], ["C", "E"]), 0);

  let configuredMultipleGroups = 0;
  let configuredMultipleMarks = 0;
  let sharedBridgePages = 0;
  for (const exercise of exercises) {
    const html = await readFile(
      new URL(`../public/exercises/${exercise.id}/index.html`, import.meta.url),
      "utf8",
    );
    const configuration = html.match(
      /<script[^>]*id=["']task-configuration["'][^>]*>([\s\S]*?)<\/script>/i,
    )?.[1];
    if (html.includes('src="../../score-bridge.js"')) sharedBridgePages += 1;
    if (!configuration) continue;
    const configContext = {};
    new vm.Script(
      configuration.replace(
        /\bconst\s+CONFIG_DATA\s*=/,
        "globalThis.CONFIG_DATA =",
      ),
    ).runInNewContext(configContext);
    for (const [key, answers] of Object.entries(
      configContext.CONFIG_DATA.answerKey.multiple || {},
    )) {
      configuredMultipleGroups += 1;
      configuredMultipleMarks += answers.length;
      const range = key.match(/q(\d+)_(\d+)/);
      assert.ok(range, `${exercise.id} has an invalid multiple-choice key ${key}`);
      assert.equal(
        answers.length,
        Number(range[2]) - Number(range[1]) + 1,
        `${exercise.id} ${key} has the wrong IELTS mark weight`,
      );
    }
  }
  assert.equal(configuredMultipleGroups, 11);
  assert.equal(configuredMultipleMarks, 23);
  assert.equal(sharedBridgePages, 70);
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
    assert.match(
      html,
      /tingjian:score|score-bridge\.js/,
      `${exercise.id} does not report its score`,
    );
  }
});

test("the site does not present model-generated text as source explanation", async () => {
  let visibleExplanationBlocks = 0;
  let sourceNotes = 0;
  let transcriptPages = 0;
  for (const exercise of exercises) {
    const html = await readFile(
      new URL(`../public/exercises/${exercise.id}/index.html`, import.meta.url),
      "utf8",
    );
    visibleExplanationBlocks += (html.match(/<b>解析<\/b>/g) ?? []).length;
    sourceNotes += (html.match(/源文件未提供逐题解析/g) ?? []).length;
    if (html.includes("transcriptLines:")) transcriptPages += 1;
  }
  assert.equal(visibleExplanationBlocks, 0);
  assert.equal(sourceNotes, 48);
  assert.equal(transcriptPages, 69);
});

test("PDF-only exercises preserve their source-specific layouts and wording", async () => {
  const readExercise = (id) =>
    readFile(new URL(`../public/exercises/${id}/index.html`, import.meta.url), "utf8");
  const [tour, shampoo, handwriting, art, memory] = await Promise.all([
    readExercise("p1-01"),
    readExercise("p2-01"),
    readExercise("p3-01"),
    readExercise("p3-02"),
    readExercise("p4-01"),
  ]);

  assert.match(tour, /<table class="tour-table">/);
  assert.match(tour, /a cookery course at a 5-star hotel/);
  assert.match(tour, /£1,320/);
  assert.match(tour, /£1,800/);
  assert.equal((tour.match(/class="inline-result gradable"/g) ?? []).length, 10);

  assert.equal((shampoo.match(/class="option-bank"/g) ?? []).length, 1);
  assert.equal((shampoo.match(/class="matching-row gradable"/g) ?? []).length, 4);
  assert.match(shampoo, /The presence of the chemicals is rarely publicised/);
  assert.match(shampoo, /product reliability/);

  assert.equal((handwriting.match(/data-type="multi"/g) ?? []).length, 2);
  assert.equal((handwriting.match(/data-weight="2"/g) ?? []).length, 2);
  assert.match(
    handwriting,
    /earned=values\.filter\(value=>answers\.includes\(value\)\)\.length/,
  );
  assert.match(handwriting, /not spacing letters correctly/);
  assert.match(handwriting, /writing very slowly/);
  assert.match(handwriting, /regretful that they have lost the habit/);
  assert.doesNotMatch(handwriting, /not holding the pencil correctly/);

  assert.equal((art.match(/class="option-bank"/g) ?? []).length, 1);
  assert.equal((art.match(/class="flow-step gradable"/g) ?? []).length, 6);
  assert.match(art, /Seracini’s search for Leonardo Da Vinci’s Battle of Anghiari/);
  assert.match(art, /a thermographic camera/);

  for (const heading of [
    "Early Cultures",
    "Ancient Greeks",
    "Ancient Romans",
    "Later European History",
    "Modern Times",
  ]) {
    assert.match(memory, new RegExp(heading));
  }
  assert.match(memory, /Memory helped with navigation and family history/);
  assert.match(memory, /important research was conducted on “S”/);
  assert.match(memory, /Later, people started to rely on computers/);
  assert.equal((memory.match(/class="inline-result gradable"/g) ?? []).length, 10);
});
