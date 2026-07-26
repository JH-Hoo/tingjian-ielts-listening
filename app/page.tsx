"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const questions = [
  ["The Maoris are an example of a society that never developed a", "form of communication.", "written"],
  ["Discoveries at underwater sites have helped scholars better understand the everyday", "of ancient communities.", "lifestyle"],
  ["In recent excavations, experts have applied advanced", "to improve the accuracy of findings.", "technology"],
  ["One commonly identified cause of many wrecks is damage caused by a violent", ".", "storm"],
  ["Some findings have been used to produce a", "gallery to showcase life on board sunken vessels.", "film"],
  ["Due to difficult access and preservation issues, the amount of", "conducted was quite restricted.", "research"],
  ["There was one wreck where the crew used a", "as a defense against pirate attacks.", "gun"],
  ["Among the materials found was a", "that detailed the ship's intended route.", "map"],
  ["Valuable cargo, especially items like", ", was a major motivation for early explorers.", "gold"],
  ["Various luxury goods were discovered, including jewellery and old", ".", "coins"],
] as const;

const normalize = (value: string) =>
  value.trim().toLowerCase().replace(/[.,!?;:'"]/g, "").replace(/\s+/g, " ");

export default function Home() {
  const [answers, setAnswers] = useState<string[]>(Array(10).fill(""));
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [dark, setDark] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const score = useMemo(
    () => answers.filter((answer, index) => normalize(answer) === questions[index][2]).length,
    [answers],
  );
  const answered = answers.filter((answer) => answer.trim()).length;
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  const updateAnswer = (index: number, value: string) => {
    setAnswers((current) => current.map((item, i) => (i === index ? value : item)));
    setSubmitted(false);
  };

  return (
    <main className={dark ? "app dark" : "app"}>
      <header className="topbar">
        <a className="brand" href="#practice" aria-label="听见首页">
          <span className="brand-mark">听</span>
          <span><strong>听见</strong><small>Listening Lab</small></span>
        </a>
        <div className="top-actions">
          <span className="status-dot">练习模式</span>
          <button className="icon-button" onClick={() => setDark((value) => !value)}>
            {dark ? "浅色" : "深色"}
          </button>
        </div>
      </header>

      <section className="hero">
        <div>
          <span className="eyebrow">IELTS Listening · Part 4</span>
          <h1>像在考场一样听，<br /><em>更清楚地进步。</em></h1>
          <p>沉浸式听力练习、即时判分与逐题反馈。先独立完成，再查看正确答案。</p>
        </div>
        <div className="hero-card">
          <span>本次练习</span>
          <strong>Underwater<br />Archaeological Sites</strong>
          <div><b>10</b> 题 <i /> <b>ONE WORD ONLY</b></div>
        </div>
      </section>

      <section id="practice" className="workspace">
        <aside className="rail">
          <div className="rail-label">题目导航</div>
          <div className="question-grid">
            {questions.map((_, index) => {
              const correct = submitted && normalize(answers[index]) === questions[index][2];
              const wrong = submitted && !correct;
              return (
                <a
                  href={`#q${index + 31}`}
                  key={index}
                  className={`${answers[index] ? "answered" : ""} ${correct ? "correct" : ""} ${wrong ? "wrong" : ""}`}
                >
                  {index + 31}
                </a>
              );
            })}
          </div>
          <div className="progress-copy"><span>{answered}/10 已作答</span><b>{Math.round(answered * 10)}%</b></div>
          <div className="progress-track"><span style={{ width: `${answered * 10}%` }} /></div>
          <div className="timer"><small>练习用时</small><strong>{time}</strong></div>
        </aside>

        <article className="paper">
          <div className="audio-card">
            <div className="audio-title"><span>音频</span><strong>Underwater Archaeological Sites</strong></div>
            <audio ref={audioRef} controls preload="metadata" src="/audio/underwater-archaeology.mp3" />
          </div>

          <div className="instructions">
            <span>Questions 31–40</span>
            <h2>Complete the notes below.</h2>
            <p>Write <strong>ONE WORD ONLY</strong> for each answer.</p>
          </div>

          <h3>Underwater Archaeological Sites</h3>
          <div className="section-label">General information</div>

          <ol className="questions" start={31}>
            {questions.map(([before, after, correctAnswer], index) => {
              const isCorrect = normalize(answers[index]) === correctAnswer;
              return (
                <li id={`q${index + 31}`} key={index}>
                  <span>{before}</span>
                  <label>
                    <span className="sr-only">Question {index + 31}</span>
                    <input
                      value={answers[index]}
                      onChange={(event) => updateAnswer(index, event.target.value)}
                      className={submitted ? (isCorrect ? "input-correct" : "input-wrong") : ""}
                      autoComplete="off"
                      spellCheck={false}
                    />
                    {submitted && <small className={isCorrect ? "feedback good" : "feedback bad"}>
                      {isCorrect ? "正确" : `答案：${correctAnswer}`}
                    </small>}
                  </label>
                  <span>{after}</span>
                </li>
              );
            })}
          </ol>

          {submitted && (
            <div className="result" role="status">
              <div><small>本次得分</small><strong>{score}<span>/10</span></strong></div>
              <p>{score >= 8 ? "很棒，细节捕捉已经很稳定。" : score >= 6 ? "不错，再听一遍错题对应片段。" : "先核对答案，再完整听一遍巩固关键词。"}</p>
            </div>
          )}

          <div className="submit-row">
            <button className="secondary" onClick={() => { setAnswers(Array(10).fill("")); setSubmitted(false); setSeconds(0); audioRef.current?.pause(); }}>
              重新作答
            </button>
            <button className="primary" onClick={() => setSubmitted(true)}>提交并判分 <span>→</span></button>
          </div>
        </article>
      </section>

      <footer>
        <span>独立听力练习工具</span>
        <p>IELTS is a registered trademark. This practice site is not affiliated with or endorsed by IELTS.</p>
      </footer>
    </main>
  );
}
