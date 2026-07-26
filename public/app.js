const SCORE_KEY = "tingjian.exerciseScores.v1";
const LAST_KEY = "tingjian.lastExercise.v1";

let exercises = [];
let selectedId = "";
let currentPart = "P1";
let query = "";
let scores = {};

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

function loadLocalState() {
  try { scores = JSON.parse(localStorage.getItem(SCORE_KEY) || "{}"); } catch { scores = {}; }
  selectedId = localStorage.getItem(LAST_KEY) || exercises[0].id;
  if (!exercises.some((item) => item.id === selectedId)) selectedId = exercises[0].id;
  currentPart = exercises.find((item) => item.id === selectedId).part;
}

function renderTabs() {
  const counts = Object.fromEntries(["P1", "P2", "P3", "P4"].map((part) => [
    part, exercises.filter((item) => item.part === part).length,
  ]));
  $("#part-tabs").innerHTML = ["P1", "P2", "P3", "P4"].map((part) =>
    `<button data-part="${part}" class="${part === currentPart ? "active" : ""}">${part}<small>${counts[part]}</small></button>`
  ).join("");
}

function renderList() {
  const term = query.trim().toLowerCase();
  const visible = exercises.filter((item) =>
    item.part === currentPart &&
    (!term || item.title.toLowerCase().includes(term) || String(item.ordinal).includes(term))
  );
  $("#exercise-list").innerHTML = visible.map((item) => {
    const result = scores[item.id];
    const badge = result
      ? `<span class="score-badge ${result.score === result.total ? "full" : ""}">${result.score}/${result.total}</span>`
      : '<span class="not-started">—</span>';
    return `<button class="exercise-item ${item.id === selectedId ? "selected" : ""}" data-id="${item.id}">
      <span class="exercise-number">${String(item.ordinal).padStart(2, "0")}</span>
      <span class="exercise-copy"><strong>${escapeHtml(item.title)}</strong><small>${item.part} · 第 ${item.ordinal} 题</small></span>
      ${badge}
    </button>`;
  }).join("");
  $("#practiced-count").innerHTML = `${Object.keys(scores).length}<small>/75</small>`;
}

function renderSelected() {
  const item = exercises.find((exercise) => exercise.id === selectedId) || exercises[0];
  const result = scores[item.id];
  $("#exercise-kicker").textContent = `${item.part} · 第 ${item.ordinal} 题`;
  $("#exercise-title").textContent = item.title;
  $("#practice-frame").title = `${item.part} 第 ${item.ordinal} 题：${item.title}`;
  $("#practice-frame").src = new URL(item.href, window.location.href).href;
  $("#heading-meta").innerHTML = result
    ? `<small>上次得分</small><strong>${result.score}<span>/${result.total}</span></strong>`
    : '<small>练习状态</small><strong class="new-label">未练习</strong>';
}

function selectExercise(id) {
  const item = exercises.find((exercise) => exercise.id === id);
  if (!item) return;
  selectedId = id;
  currentPart = item.part;
  localStorage.setItem(LAST_KEY, id);
  renderTabs();
  renderList();
  renderSelected();
  closeSidebar();
}

function closeSidebar() {
  $("#sidebar").classList.remove("open");
  $("#sidebar-backdrop").classList.remove("visible");
}

document.addEventListener("click", (event) => {
  const partButton = event.target.closest("[data-part]");
  if (partButton) {
    currentPart = partButton.dataset.part;
    query = "";
    $("#search").value = "";
    $("#search").placeholder = `搜索 ${currentPart} 题目`;
    renderTabs();
    renderList();
  }
  const exerciseButton = event.target.closest("[data-id]");
  if (exerciseButton) selectExercise(exerciseButton.dataset.id);
});

$("#search").addEventListener("input", (event) => { query = event.target.value; renderList(); });
$("#mobile-menu").addEventListener("click", () => {
  $("#sidebar").classList.add("open");
  $("#sidebar-backdrop").classList.add("visible");
});
$("#sidebar-close").addEventListener("click", closeSidebar);
$("#sidebar-backdrop").addEventListener("click", closeSidebar);

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== "tingjian:score") return;
  const { exerciseId, score, total, practicedAt } = event.data;
  if (!exercises.some((item) => item.id === exerciseId)) return;
  scores = { ...scores, [exerciseId]: { score, total, practicedAt } };
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
  renderList();
  if (selectedId === exerciseId) renderSelected();
});

fetch("./exercises.json")
  .then((response) => {
    if (!response.ok) throw new Error("题库加载失败");
    return response.json();
  })
  .then((data) => {
    exercises = data;
    loadLocalState();
    renderTabs();
    renderList();
    renderSelected();
  })
  .catch(() => { $("#exercise-title").textContent = "题库加载失败，请刷新页面重试"; });
