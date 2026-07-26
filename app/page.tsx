"use client";

import { useEffect, useMemo, useState } from "react";
import { exercises } from "./exercises";

type Exercise = (typeof exercises)[number];
type ScoreRecord = Record<string, { score: number; total: number; practicedAt: string }>;

const SCORE_KEY = "tingjian.exerciseScores.v1";
const LAST_KEY = "tingjian.lastExercise.v1";

export default function Home() {
  const [selectedId, setSelectedId] = useState<string>(exercises[0].id);
  const [part, setPart] = useState<Exercise["part"]>("P1");
  const [scores, setScores] = useState<ScoreRecord>({});
  const [query, setQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedScores = window.localStorage.getItem(SCORE_KEY);
    const lastExercise = window.localStorage.getItem(LAST_KEY);
    if (savedScores) {
      try { setScores(JSON.parse(savedScores)); } catch { /* Ignore damaged local data. */ }
    }
    if (lastExercise && exercises.some((item) => item.id === lastExercise)) {
      const item = exercises.find((exercise) => exercise.id === lastExercise)!;
      setSelectedId(item.id);
      setPart(item.part);
    }
  }, []);

  useEffect(() => {
    const receiveScore = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== "tingjian:score") return;
      const { exerciseId, score, total, practicedAt } = event.data;
      if (!exercises.some((item) => item.id === exerciseId)) return;
      setScores((current) => {
        const next = { ...current, [exerciseId]: { score, total, practicedAt } };
        window.localStorage.setItem(SCORE_KEY, JSON.stringify(next));
        return next;
      });
    };
    window.addEventListener("message", receiveScore);
    return () => window.removeEventListener("message", receiveScore);
  }, []);

  const selected = exercises.find((exercise) => exercise.id === selectedId) ?? exercises[0];
  const partExercises = useMemo(() => {
    const term = query.trim().toLowerCase();
    return exercises.filter((exercise) =>
      exercise.part === part &&
      (!term || exercise.title.toLowerCase().includes(term) || String(exercise.ordinal).includes(term))
    );
  }, [part, query]);

  const practicedCount = Object.keys(scores).length;
  const selectExercise = (exercise: Exercise) => {
    setSelectedId(exercise.id);
    setPart(exercise.part);
    setSidebarOpen(false);
    window.localStorage.setItem(LAST_KEY, exercise.id);
  };

  return (
    <main className="library-app">
      <header className="library-header">
        <div className="brand">
          <span className="brand-mark">听</span>
          <div><strong>听见</strong><small>IELTS Listening Library</small></div>
        </div>
        <div className="header-progress">
          <span>已练习</span>
          <strong>{practicedCount}<small>/75</small></strong>
        </div>
      </header>

      <button className="mobile-menu" onClick={() => setSidebarOpen(true)}>☰ 选择练习</button>

      <div className="library-layout">
        <aside className={sidebarOpen ? "exercise-sidebar open" : "exercise-sidebar"}>
          <div className="sidebar-top">
            <div><strong>单项练习</strong><small>选择 Part 和题目</small></div>
            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>
          </div>

          <div className="part-tabs">
            {(["P1", "P2", "P3", "P4"] as const).map((item) => (
              <button
                key={item}
                className={part === item ? "active" : ""}
                onClick={() => { setPart(item); setQuery(""); }}
              >
                {item}<small>{exercises.filter((exercise) => exercise.part === item).length}</small>
              </button>
            ))}
          </div>

          <label className="search">
            <span>⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`搜索 ${part} 题目`}
            />
          </label>

          <div className="exercise-list">
            {partExercises.map((exercise) => {
              const result = scores[exercise.id];
              return (
                <button
                  key={exercise.id}
                  className={selectedId === exercise.id ? "exercise-item selected" : "exercise-item"}
                  onClick={() => selectExercise(exercise)}
                >
                  <span className="exercise-number">{String(exercise.ordinal).padStart(2, "0")}</span>
                  <span className="exercise-copy">
                    <strong>{exercise.title}</strong>
                    <small>{exercise.part} · 第 {exercise.ordinal} 题</small>
                  </span>
                  {result ? (
                    <span className={`score-badge ${result.score === result.total ? "full" : ""}`}>
                      {result.score}/{result.total}
                    </span>
                  ) : <span className="not-started">—</span>}
                </button>
              );
            })}
          </div>
        </aside>

        {sidebarOpen && <button className="sidebar-backdrop" aria-label="关闭侧边栏" onClick={() => setSidebarOpen(false)} />}

        <section className="practice-main">
          <div className="practice-heading">
            <div>
              <span>{selected.part} · 第 {selected.ordinal} 题</span>
              <h1>{selected.title}</h1>
            </div>
            <div className="heading-meta">
              {scores[selected.id] ? (
                <>
                  <small>上次得分</small>
                  <strong>{scores[selected.id].score}<span>/{scores[selected.id].total}</span></strong>
                </>
              ) : (
                <>
                  <small>练习状态</small>
                  <strong className="new-label">未练习</strong>
                </>
              )}
            </div>
          </div>

          <div className="practice-frame">
            <iframe
              key={selected.id}
              src={selected.href}
              title={`${selected.part} 第 ${selected.ordinal} 题：${selected.title}`}
              allow="autoplay"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
