(() => {
  const script = document.currentScript;
  const exerciseId = script?.dataset.exerciseId || "";
  if (!exerciseId) return;

  const dataUrl = new URL("explanations.json", script.src);
  const pagePromise = fetch(dataUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => data.exercises?.[exerciseId] || null)
    .catch((error) => {
      console.error("Could not load transcript explanations:", error);
      return null;
    });

  const firstQuestionNumber = (item) => Number(item.numbers?.[0] || 0);
  const orderedItems = (page) =>
    Object.values(page || {}).sort(
      (left, right) => firstQuestionNumber(left) - firstQuestionNumber(right),
    );

  const locationStart = (location) => {
    const match = String(location).match(/^(\d+):(\d+)/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : 0;
  };

  const makeLine = (label, value, className = "") => {
    const row = document.createElement("p");
    row.className = `tx-row ${className}`.trim();
    const heading = document.createElement("strong");
    heading.textContent = `${label}：`;
    const text = document.createElement("span");
    text.textContent = value;
    row.append(heading, text);
    return row;
  };

  const makeExplanation = (item, compact = false) => {
    const card = document.createElement(compact ? "div" : "article");
    card.className = `transcript-explanation${compact ? " compact" : ""}`;
    const heading = document.createElement("div");
    heading.className = "tx-heading";
    const question = document.createElement("strong");
    question.textContent = `Q${item.numbers.join("–")}`;
    const badge = document.createElement("span");
    badge.className = "tx-badge";
    badge.textContent = "根据听力文本整理";
    heading.append(question, badge);

    const answer = makeLine("正确答案", item.answerText, "tx-answer");
    const location = makeLine("原文定位", item.location);
    const replay = document.createElement("button");
    replay.type = "button";
    replay.className = "tx-replay";
    replay.textContent = "从这里重听";
    replay.addEventListener("click", () => {
      const audio = document.querySelector("audio");
      if (!audio) return;
      audio.currentTime = locationStart(item.location);
      audio.play().catch(() => {});
    });
    location.append(replay);

    card.append(
      heading,
      answer,
      location,
      makeLine("听力原文", item.evidence, "tx-evidence"),
      makeLine("解析", item.reason, "tx-reason"),
    );
    return card;
  };

  const renderIntoAnswerPanels = (page) => {
    let rendered = 0;
    for (const row of document.querySelectorAll(".gradable[data-q]")) {
      const item = page[row.dataset.q];
      const panel = row.querySelector(".answer-panel");
      if (!item || !panel) continue;
      panel.querySelector(".source-note")?.remove();
      if (!panel.querySelector(".transcript-explanation")) {
        panel.appendChild(makeExplanation(item, true));
      }
      rendered += 1;
    }
    return rendered > 0;
  };

  const renderReviewList = (page) => {
    const reviewList = document.querySelector("#reviewList");
    if (!reviewList) return false;
    const section = document.createElement("section");
    section.className = "transcript-explanations";
    const heading = document.createElement("h3");
    heading.textContent = "听力原文与解析";
    section.append(heading, ...orderedItems(page).map((item) => makeExplanation(item)));
    reviewList.appendChild(section);
    return true;
  };

  const renderResults = (page) => {
    const results = document.querySelector(".results-in-page");
    if (!results) return false;
    const section = document.createElement("section");
    section.className = "transcript-explanations";
    const heading = document.createElement("h2");
    heading.textContent = "听力原文与解析";
    section.append(heading, ...orderedItems(page).map((item) => makeExplanation(item)));
    results.appendChild(section);
    return true;
  };

  const render = async () => {
    const page = await pagePromise;
    if (!page) return;
    document.querySelectorAll(".transcript-explanations").forEach((node) => node.remove());
    if (renderIntoAnswerPanels(page)) return;
    if (renderReviewList(page)) return;
    renderResults(page);
  };

  const clear = () => {
    document.querySelectorAll(".transcript-explanations").forEach((node) => node.remove());
  };

  const style = document.createElement("style");
  style.textContent = `
    .transcript-explanations{margin-top:24px;padding-top:18px;border-top:2px solid #d8e2ee}
    .transcript-explanations>h2,.transcript-explanations>h3{margin:0 0 14px}
    .transcript-explanation{margin:0 0 14px;padding:15px 16px;border:1px solid #d8e2ee;border-radius:10px;background:#f8fbff;color:#172033}
    .transcript-explanation.compact{margin-top:10px;margin-bottom:0;padding:12px 13px}
    .tx-heading{display:flex;align-items:center;gap:9px;margin-bottom:8px}
    .tx-badge{padding:2px 7px;border-radius:999px;background:#e8f1ff;color:#24558f;font-size:12px;font-weight:600}
    .tx-row{margin:6px 0;line-height:1.55}
    .tx-row>strong{color:#263c57}
    .tx-evidence>span{font-style:italic;color:#35465b}
    .tx-replay{margin-left:9px;padding:3px 8px;border:1px solid #8bb0dd;border-radius:6px;background:#fff;color:#24558f;cursor:pointer;font:inherit;font-size:12px}
    .tx-replay:hover{background:#edf5ff}
  `;
  document.head.appendChild(style);

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#finish-btn,#btnFinish")?.addEventListener("click", () => {
      window.setTimeout(render, 60);
    });
    document.querySelector("#reset,#btnReset,#btnClear")?.addEventListener("click", clear);
  });
})();
