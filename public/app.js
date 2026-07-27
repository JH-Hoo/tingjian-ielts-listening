const SCORE_KEY = "tingjian.exerciseScores.v1";
const LAST_KEY = "tingjian.lastExercise.v1";
const HIGHLIGHT_KEY = "tingjian.highlights.v1";
const HIGHLIGHT_MODE_KEY = "tingjian.highlightMode.v1";

let exercises = [];
let selectedId = "";
let currentPart = "P1";
let query = "";
let scores = {};
let highlights = {};
let highlightMode = false;
let highlightUndo = {};
let highlightRedo = {};

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

function loadLocalState() {
  try { scores = JSON.parse(localStorage.getItem(SCORE_KEY) || "{}"); } catch { scores = {}; }
  try { highlights = JSON.parse(localStorage.getItem(HIGHLIGHT_KEY) || "{}"); } catch { highlights = {}; }
  try { highlightMode = localStorage.getItem(HIGHLIGHT_MODE_KEY) === "on"; } catch { highlightMode = false; }
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
  const frame = $("#practice-frame");
  frame.title = `${item.part} 第 ${item.ordinal} 题：${item.title}`;
  if (frame.dataset.exerciseId !== item.id) {
    frame.dataset.exerciseId = item.id;
    frame.src = new URL(item.href, window.location.href).href;
  }
  $("#heading-meta").innerHTML = result
    ? `<small>上次得分</small><strong>${result.score}<span>/${result.total}</span></strong>`
    : '<small>练习状态</small><strong class="new-label">未练习</strong>';
  updateHighlightControls();
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

function saveHighlights() {
  try { localStorage.setItem(HIGHLIGHT_KEY, JSON.stringify(highlights)); } catch { /* Storage may be unavailable. */ }
}

function recordsFor(exerciseId) {
  return Array.isArray(highlights[exerciseId]) ? highlights[exerciseId] : [];
}

function copyHighlightRecords(records) {
  return records.map((record) => ({ ...record }));
}

function rememberHighlightChange(exerciseId, before, after) {
  const stack = highlightUndo[exerciseId] || [];
  highlightUndo[exerciseId] = [
    ...stack.slice(-49),
    { before: copyHighlightRecords(before), after: copyHighlightRecords(after) },
  ];
  highlightRedo[exerciseId] = [];
}

function updateHighlightControls() {
  const toggle = $("#highlight-toggle");
  const clear = $("#highlight-clear");
  const label = $("#highlight-label");
  const status = $("#highlight-status");
  if (!toggle || !clear || !label || !status) return;
  const count = recordsFor(selectedId).length;
  toggle.classList.toggle("active", highlightMode);
  toggle.setAttribute("aria-pressed", String(highlightMode));
  label.textContent = highlightMode ? "高亮已开" : "高亮";
  clear.disabled = count === 0;
  status.textContent = `${count} 处`;
}

function textNodesFor(doc) {
  const root = doc.querySelector("main") || doc.body;
  if (!root) return { root: null, nodes: [], text: "" };
  const view = doc.defaultView;
  const walker = doc.createTreeWalker(root, view.NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue) return view.NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent || parent.closest([
        "script", "style", "noscript", "textarea", "button",
        "[data-tingjian-highlighter-ui]", ".result-label", ".score-summary",
        ".results-in-page", "#score-summary", "[aria-live]",
      ].join(","))) {
        return view.NodeFilter.FILTER_REJECT;
      }
      return view.NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return { root, nodes, text: nodes.map((node) => node.nodeValue).join("") };
}

function selectionOffsets(doc, range) {
  const snapshot = textNodesFor(doc);
  if (!snapshot.root || !snapshot.root.contains(range.commonAncestorContainer)) return null;
  const offsets = new Map();
  let cursor = 0;
  for (const node of snapshot.nodes) {
    offsets.set(node, cursor);
    cursor += node.nodeValue.length;
  }
  const selectedNodes = snapshot.nodes.filter((node) => {
    try { return range.intersectsNode(node); } catch { return false; }
  });
  if (!selectedNodes.length) return null;
  const first = selectedNodes[0];
  const last = selectedNodes[selectedNodes.length - 1];
  let start = offsets.get(first) + (range.startContainer === first ? range.startOffset : 0);
  let end = offsets.get(last) + (range.endContainer === last ? range.endOffset : last.nodeValue.length);
  const raw = snapshot.text.slice(start, end);
  const leading = raw.match(/^\s*/)?.[0].length || 0;
  const trailing = raw.match(/\s*$/)?.[0].length || 0;
  start += leading;
  end -= trailing;
  if (end <= start) return null;
  return { start, end, text: snapshot.text.slice(start, end), fullText: snapshot.text };
}

function resolveRecord(snapshot, record) {
  if (snapshot.text.slice(record.start, record.end) === record.text) {
    return { start: record.start, end: record.end };
  }
  let index = snapshot.text.indexOf(record.text);
  let fallback = -1;
  while (index !== -1) {
    if (fallback === -1) fallback = index;
    const prefix = snapshot.text.slice(Math.max(0, index - record.prefix.length), index);
    const suffix = snapshot.text.slice(index + record.text.length, index + record.text.length + record.suffix.length);
    if (prefix.endsWith(record.prefix) && suffix.startsWith(record.suffix)) {
      return { start: index, end: index + record.text.length };
    }
    index = snapshot.text.indexOf(record.text, index + 1);
  }
  return fallback === -1 ? null : { start: fallback, end: fallback + record.text.length };
}

function applyHighlightRecord(doc, record) {
  const snapshot = textNodesFor(doc);
  const resolved = resolveRecord(snapshot, record);
  if (!resolved) return false;
  const segments = [];
  let cursor = 0;
  for (const node of snapshot.nodes) {
    const nodeStart = cursor;
    const nodeEnd = cursor + node.nodeValue.length;
    const start = Math.max(resolved.start, nodeStart);
    const end = Math.min(resolved.end, nodeEnd);
    if (start < end && !node.parentElement.closest("mark.tingjian-highlight")) {
      segments.push({ node, start: start - nodeStart, end: end - nodeStart });
    }
    cursor = nodeEnd;
  }
  for (const segment of segments.reverse()) {
    const range = doc.createRange();
    range.setStart(segment.node, segment.start);
    range.setEnd(segment.node, segment.end);
    const mark = doc.createElement("mark");
    mark.className = "tingjian-highlight";
    mark.dataset.highlightId = record.id;
    mark.title = "点击取消此处高亮";
    range.surroundContents(mark);
  }
  return segments.length > 0;
}

function removeHighlightMarks(doc, highlightId) {
  const marks = [...doc.querySelectorAll("mark.tingjian-highlight")]
    .filter((mark) => mark.dataset.highlightId === highlightId);
  for (const mark of marks) {
    const parent = mark.parentNode;
    mark.replaceWith(...mark.childNodes);
    parent?.normalize();
  }
}

function syncFrameHighlights(exerciseId) {
  const frame = $("#practice-frame");
  if (frame.dataset.exerciseId !== exerciseId) return;
  const doc = frame.contentDocument;
  if (!doc) return;
  for (const mark of [...doc.querySelectorAll("mark.tingjian-highlight")]) {
    const parent = mark.parentNode;
    mark.replaceWith(...mark.childNodes);
    parent?.normalize();
  }
  for (const record of recordsFor(exerciseId)) applyHighlightRecord(doc, record);
}

function restoreHighlightChange(direction) {
  const source = direction === "undo" ? highlightUndo : highlightRedo;
  const target = direction === "undo" ? highlightRedo : highlightUndo;
  const stack = source[selectedId] || [];
  const change = stack.pop();
  if (!change) return false;
  source[selectedId] = stack;
  target[selectedId] = [...(target[selectedId] || []), change];
  highlights = {
    ...highlights,
    [selectedId]: copyHighlightRecords(direction === "undo" ? change.before : change.after),
  };
  saveHighlights();
  syncFrameHighlights(selectedId);
  updateHighlightControls();
  return true;
}

function setHighlightMode(enabled) {
  highlightMode = enabled;
  try { localStorage.setItem(HIGHLIGHT_MODE_KEY, highlightMode ? "on" : "off"); } catch { /* Storage may be unavailable. */ }
  updateFrameHighlightMode();
  updateHighlightControls();
}

function isEditableShortcutTarget(target) {
  return Boolean(target?.closest?.("input,textarea,select,[contenteditable='true'],[contenteditable=''],[role='textbox']"));
}

function handleHighlightShortcut(event) {
  if (event.defaultPrevented || event.repeat || isEditableShortcutTarget(event.target)) return;
  const key = event.key.toLowerCase();
  if (key === "h" && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    setHighlightMode(!highlightMode);
    return;
  }
  if (event.key === "Escape" && highlightMode) {
    event.preventDefault();
    setHighlightMode(false);
    return;
  }
  if (key === "z" && (event.metaKey || event.ctrlKey) && !event.altKey) {
    const changed = restoreHighlightChange(event.shiftKey ? "redo" : "undo");
    if (changed) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

function addSelectionHighlight(doc, exerciseId) {
  if (!highlightMode) return;
  const selection = doc.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if ([...doc.querySelectorAll("mark.tingjian-highlight")].some((mark) => {
    try { return range.intersectsNode(mark); } catch { return false; }
  })) return;
  const selected = selectionOffsets(doc, range);
  if (!selected || selected.text.length < 2 || selected.text.length > 800) return;
  const existing = recordsFor(exerciseId);
  if (existing.some((record) => selected.start < record.end && selected.end > record.start)) return;
  const record = {
    id: window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    start: selected.start,
    end: selected.end,
    text: selected.text,
    prefix: selected.fullText.slice(Math.max(0, selected.start - 24), selected.start),
    suffix: selected.fullText.slice(selected.end, selected.end + 24),
  };
  const updated = [...existing, record];
  rememberHighlightChange(exerciseId, existing, updated);
  highlights = { ...highlights, [exerciseId]: updated };
  saveHighlights();
  applyHighlightRecord(doc, record);
  selection.removeAllRanges();
  updateHighlightControls();
}

function installFrameHighlighter(frame) {
  const doc = frame.contentDocument;
  const exerciseId = frame.dataset.exerciseId;
  if (!doc || !exerciseId || !doc.documentElement) return;
  doc.documentElement.classList.toggle("tingjian-highlight-mode", highlightMode);
  if (doc.documentElement.dataset.tingjianHighlighter === "ready") return;
  doc.documentElement.dataset.tingjianHighlighter = "ready";
  const style = doc.createElement("style");
  style.dataset.tingjianHighlighterUi = "true";
  style.textContent = `
    mark.tingjian-highlight{background:#ffe36e!important;color:inherit!important;padding:0 .08em;border-radius:.18em;box-shadow:inset 0 -.08em rgba(199,153,0,.18);cursor:pointer}
    html.tingjian-highlight-mode mark.tingjian-highlight:hover{background:#ffd43b!important}
  `;
  (doc.head || doc.documentElement).appendChild(style);
  for (const record of recordsFor(exerciseId)) applyHighlightRecord(doc, record);
  let selectionTimer;
  const scheduleHighlight = () => {
    clearTimeout(selectionTimer);
    selectionTimer = setTimeout(() => addSelectionHighlight(doc, exerciseId), 250);
  };
  doc.addEventListener("pointerup", scheduleHighlight);
  doc.addEventListener("touchend", scheduleHighlight);
  doc.addEventListener("keydown", handleHighlightShortcut);
  doc.addEventListener("click", (event) => {
    const mark = event.target.closest?.("mark.tingjian-highlight");
    if (!mark) return;
    event.preventDefault();
    event.stopPropagation();
    const id = mark.dataset.highlightId;
    const existing = recordsFor(exerciseId);
    const updated = existing.filter((record) => record.id !== id);
    rememberHighlightChange(exerciseId, existing, updated);
    removeHighlightMarks(doc, id);
    highlights = { ...highlights, [exerciseId]: updated };
    saveHighlights();
    updateHighlightControls();
  }, true);
  updateHighlightControls();
}

function updateFrameHighlightMode() {
  const doc = $("#practice-frame").contentDocument;
  doc?.documentElement?.classList.toggle("tingjian-highlight-mode", highlightMode);
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
$("#practice-frame").addEventListener("load", (event) => installFrameHighlighter(event.currentTarget));
document.addEventListener("keydown", handleHighlightShortcut);
$("#highlight-toggle").addEventListener("click", () => setHighlightMode(!highlightMode));
$("#highlight-clear").addEventListener("click", () => {
  const records = recordsFor(selectedId);
  if (!records.length || !window.confirm("清除这篇练习的全部高亮标记？")) return;
  const doc = $("#practice-frame").contentDocument;
  if (doc) {
    for (const record of records) removeHighlightMarks(doc, record.id);
  }
  rememberHighlightChange(selectedId, records, []);
  highlights = { ...highlights, [selectedId]: [] };
  saveHighlights();
  updateHighlightControls();
});

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
