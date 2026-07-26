import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

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

test("server-renders the four-part listening shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /听见/);
  assert.match(html, /IELTS Listening Practice/);
  assert.match(html, /40 Questions/);
  for (let part = 1; part <= 4; part += 1) {
    assert.match(html, new RegExp(`Part ${part}`));
    assert.match(html, new RegExp(`/parts/part${part}/index.html`));
  }
});

test("each part has ten matching question keys and a playable audio asset", async () => {
  for (let part = 1; part <= 4; part += 1) {
    const htmlUrl = new URL(`../public/parts/part${part}/index.html`, import.meta.url);
    const audioUrl = new URL(`../public/parts/part${part}/audio.mp3`, import.meta.url);
    const html = await readFile(htmlUrl, "utf8");
    const list = html.match(/questionList:\s*\[([^\]]+)\]/)?.[1] ?? "";
    const expected = [...list.matchAll(/['"](\d+)['"]/g)].map((match) => match[1]);
    const answerStart = html.indexOf("answerKey:");
    const answerEnd = html.indexOf("transcriptLines:", answerStart);
    const answerBlock = html.slice(answerStart, answerEnd);
    const answers = new Set(
      [...answerBlock.matchAll(/['"]q(\d+)['"]\s*:/g)].map((match) => match[1]),
    );
    const questionTemplate = html.slice(html.indexOf("questionsPage()"));
    const controls = new Set(
      [...questionTemplate.matchAll(/data-q=["'](\d+)["']/g)].map((match) => match[1]),
    );

    assert.equal(expected.length, 10);
    assert.ok(expected.every((question) => answers.has(question)));
    assert.ok(expected.every((question) => controls.has(question)));
    assert.match(html, /src=["']audio\.mp3["']/);
    assert.ok((await stat(audioUrl)).size > 1_000_000);
  }
});
