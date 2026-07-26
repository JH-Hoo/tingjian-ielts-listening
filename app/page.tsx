"use client";

import { useRef, useState } from "react";

const parts = [
  { id: 1, range: "1–10", title: "Film Club", type: "日常对话" },
  { id: 2, range: "11–20", title: "Gisborne", type: "生活场景独白" },
  { id: 3, range: "21–30", title: "Pacific Tapa Cloth", type: "学术讨论" },
  { id: 4, range: "31–40", title: "The Mangrove Regeneration Project", type: "学术独白" },
];

export default function Home() {
  const [activePart, setActivePart] = useState(1);
  const frames = useRef<Array<HTMLIFrameElement | null>>([]);

  const openPart = (part: number) => {
    frames.current.forEach((frame) => {
      frame?.contentDocument?.querySelectorAll("audio").forEach((audio) => audio.pause());
    });
    setActivePart(part);
  };

  const finishCurrentPart = () => {
    const frame = frames.current[activePart - 1];
    frame?.contentDocument?.querySelector<HTMLButtonElement>("#finish-btn")?.click();
  };

  return (
    <main className="exam-app">
      <header className="exam-header">
        <div className="exam-brand">
          <span>听</span>
          <div><strong>听见</strong><small>IELTS Listening Practice</small></div>
        </div>
        <div className="exam-meta">
          <span>完整听力练习</span>
          <b>40 Questions</b>
        </div>
      </header>

      <nav className="part-nav" aria-label="Listening test parts">
        {parts.map((part) => (
          <button
            key={part.id}
            className={activePart === part.id ? "active" : ""}
            onClick={() => openPart(part.id)}
          >
            <span>Part {part.id}</span>
            <strong>{part.title}</strong>
            <small>Questions {part.range}</small>
          </button>
        ))}
      </nav>

      <div className="exam-toolbar">
        <div>
          <b>Part {activePart}</b>
          <span>{parts[activePart - 1].type} · Questions {parts[activePart - 1].range}</span>
        </div>
        <div className="toolbar-actions">
          <button
            disabled={activePart === 1}
            onClick={() => openPart(activePart - 1)}
          >
            上一 Part
          </button>
          <button className="finish" onClick={finishCurrentPart}>提交本 Part</button>
          <button
            disabled={activePart === 4}
            onClick={() => openPart(activePart + 1)}
          >
            下一 Part
          </button>
        </div>
      </div>

      <section className="frames">
        {parts.map((part, index) => (
          <iframe
            key={part.id}
            ref={(element) => { frames.current[index] = element; }}
            src={`/parts/part${part.id}/index.html`}
            title={`IELTS Listening Part ${part.id}: ${part.title}`}
            className={activePart === part.id ? "visible" : ""}
            allow="autoplay"
          />
        ))}
      </section>
    </main>
  );
}
