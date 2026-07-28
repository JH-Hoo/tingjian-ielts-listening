(() => {
  const script = document.currentScript;
  const exerciseId = script?.dataset.exerciseId || "";

  const scoreMultipleSelection = (selectedAnswers, correctAnswers) => {
    const selected = new Set(selectedAnswers);
    return correctAnswers.filter((answer) => selected.has(answer)).length;
  };
  window.TingjianScoreBridge = { scoreMultipleSelection };

  const rangeWeight = (questionNumber) => {
    const match = String(questionNumber).match(/(\d+)\s*[-–—]\s*(\d+)/);
    return match ? Number(match[2]) - Number(match[1]) + 1 : 1;
  };

  const questionKey = (questionNumber) =>
    `q${String(questionNumber).replace(/\s*[-–—]\s*/g, "_")}`;

  const getConfiguration = () => {
    try {
      return typeof CONFIG_DATA === "undefined" ? null : CONFIG_DATA;
    } catch {
      return null;
    }
  };

  const updateMultipleReview = (questionNumber, earned, total) => {
    const navItem = [...document.querySelectorAll(".q-nav-item")].find(
      (item) => (item.dataset.qnum || item.textContent.trim()) === String(questionNumber),
    );
    if (navItem && earned > 0 && earned < total) {
      navItem.classList.remove("correct", "incorrect");
      navItem.classList.add("partial");
      navItem.title = `${earned}/${total} correct`;
    }

    for (const row of document.querySelectorAll(".results-table tbody tr")) {
      const displayedQuestion = row.querySelector("td")?.textContent.trim();
      if (displayedQuestion !== String(questionNumber)) continue;
      const resultCell = row.querySelector("td:last-child");
      if (resultCell && earned > 0 && earned < total) {
        resultCell.className = "result-partial";
        resultCell.textContent = `${earned}/${total} Correct`;
      }
    }
  };

  const scoreConfiguredPage = (configuration) => {
    let score = 0;
    let total = 0;

    for (const questionNumber of configuration.questionList || []) {
      const key = questionKey(questionNumber);
      const correctAnswers = configuration.answerKey?.multiple?.[key];

      if (Array.isArray(correctAnswers)) {
        const selectedAnswers = [
          ...document.querySelectorAll(`[name="${key}"]:checked`),
        ].map((input) => input.value);
        const earned = scoreMultipleSelection(selectedAnswers, correctAnswers);
        const weight = correctAnswers.length;
        score += earned;
        total += weight;
        updateMultipleReview(questionNumber, earned, weight);
        continue;
      }

      const navItem = [...document.querySelectorAll(".q-nav-item")].find(
        (item) => (item.dataset.qnum || item.textContent.trim()) === String(questionNumber),
      );
      const weight = rangeWeight(questionNumber);
      total += weight;
      if (navItem?.classList.contains("correct")) score += weight;
    }

    return { score, total };
  };

  const scoreRenderedPage = () => {
    const graded = [
      ...document.querySelectorAll(".q-nav-item.correct,.q-nav-item.incorrect"),
    ];
    const score = graded
      .filter((item) => item.classList.contains("correct"))
      .reduce(
        (sum, item) =>
          sum + rangeWeight(item.dataset.qnum || item.textContent.trim()),
        0,
      );
    const total = graded.reduce(
      (sum, item) =>
        sum + rangeWeight(item.dataset.qnum || item.textContent.trim()),
      0,
    );
    if (total > 0) return { score, total };

    const scoreText = document.querySelector("#scoreNum")?.textContent || "";
    const match = scoreText.match(/(\d+)\s*\/\s*(\d+)/);
    return { score: Number(match?.[1] || 0), total: Number(match?.[2] || 0) };
  };

  const reportScore = () =>
    window.setTimeout(() => {
      const configuration = getConfiguration();
      const result = configuration
        ? scoreConfiguredPage(configuration)
        : scoreRenderedPage();
      if (result.total <= 0) return;
      window.parent.postMessage(
        {
          type: "tingjian:score",
          exerciseId,
          score: result.score,
          total: result.total,
          practicedAt: new Date().toISOString(),
        },
        "*",
      );
    }, 300);

  const style = document.createElement("style");
  style.textContent =
    ".q-nav-item.partial{background:#fef3c7!important;border-color:#f59e0b!important;color:#92400e!important}.result-partial{color:#b45309;font-weight:600}";
  document.head.appendChild(style);

  window.addEventListener("DOMContentLoaded", () => {
    document
      .querySelector("#finish-btn,#btnFinish")
      ?.addEventListener("click", reportScore);
  });
})();
