import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const sourceRoot = process.argv[2];
if (!sourceRoot || !existsSync(sourceRoot)) {
  throw new Error("Pass the extracted IELTS Listening source directory.");
}

const projectRoot = process.cwd();
const outputRoot = join(projectRoot, "public", "exercises");
mkdirSync(outputRoot, { recursive: true });

const naturalNumber = (name) => Number(name.match(/^(\d+)/)?.[1] ?? 9999);
const cleanTitle = (name) =>
  name
    .replace(/\.zip$/i, "")
    .replace(/^\d+\.\s*P[1-4]\s*/i, "")
    .trim();

const bridgeScript = (exerciseId) => `
<script>
(() => {
  const reportScore = () => window.setTimeout(() => {
    const graded = [...document.querySelectorAll('.q-nav-item.correct,.q-nav-item.incorrect')];
    const weight = item => {
      const value = item.dataset.qnum || item.textContent.trim();
      const match = value.match(/(\\d+)\\s*-\\s*(\\d+)/);
      return match ? Number(match[2]) - Number(match[1]) + 1 : 1;
    };
    const score = graded.filter(item => item.classList.contains('correct')).reduce((sum,item) => sum + weight(item), 0);
    const total = graded.reduce((sum,item) => sum + weight(item), 0);
    const scoreText = document.querySelector('#scoreNum')?.textContent || '';
    const scoreMatch = scoreText.match(/(\\d+)\\s*\\/\\s*(\\d+)/);
    const finalScore = total > 0 ? score : Number(scoreMatch?.[1] || 0);
    const finalTotal = total > 0 ? total : Number(scoreMatch?.[2] || 0);
    if (finalTotal > 0) {
      window.parent.postMessage({
        type: 'tingjian:score',
        exerciseId: ${JSON.stringify(exerciseId)},
        score: finalScore,
        total: finalTotal,
        practicedAt: new Date().toISOString()
      }, '*');
    }
  }, 300);
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#finish-btn,#btnFinish')?.addEventListener('click', reportScore);
  });
})();
</script>`;

const missing = {
  "P1-1": {
    title: "Asia-Pacific Tours Activity Holidays",
    instruction: "Complete the table. Write ONE WORD AND/OR A NUMBER for each answer.",
    sections: [
      { heading: "Vietnam", questions: [
        { n: 1, prompt: "Either ___ lessons or a one-day trek", answer: ["diving"], explanation: "The speaker offers instruction in diving." },
        { n: 2, prompt: "A one-day trek in the ___", answer: ["jungle"], explanation: "The trek goes through the jungle near the beach." },
        { n: 3, prompt: "Attend a ___ performance", answer: ["dance"], explanation: "Opera is rejected as the former option; the current activity is a dance show." },
        { n: 4, prompt: "Cost: £ ___", answer: ["1450", "1,450"], explanation: "The old price was £1,600, but it was reduced to £1,450." },
      ]},
      { heading: "Hong Kong", questions: [
        { n: 5, prompt: "Look at ___ in a country park", answer: ["birds"], explanation: "Visitors can see birds of all sorts in the hills." },
        { n: 6, prompt: "Followed by ___ in a monastery", answer: ["dinner"], explanation: "The guided visit includes dinner in a monastery." },
        { n: 7, prompt: "Visit an ___ factory", answer: ["electronics"], explanation: "The shopping visit is to an electronics factory." },
      ]},
      { heading: "Japan", questions: [
        { n: 8, prompt: "Destination: ___", answer: ["Japan"], explanation: "Korea and Thailand are distractors; the selected package is Japan." },
        { n: 9, prompt: "A museum of traditional ___", answer: ["costume"], explanation: "The tour includes a museum of traditional costume." },
        { n: 10, prompt: "A big ___ market", answer: ["fish"], explanation: "The crafts market is corrected to a large fish market." },
      ]},
    ],
  },
  "P2-3": {
    title: "Shampoo Marketing Project",
    instruction: "Choose the correct answer for each question.",
    sections: [{ heading: "Questions 21-30", questions: [
      { n: 21, prompt: "Over time, shampoo has become…", options: ["A. a cheaper product", "B. more hygienic in its effects", "C. a different kind of commodity"], answer: ["C"], explanation: "Correct option: C." },
      { n: 22, prompt: "What does Janet say about ‘bad hair days’?", options: ["A. They really do exist", "B. Women worry about them more than men", "C. Their name is inaccurate"], answer: ["A"], explanation: "Correct option: A." },
      { n: 23, prompt: "What do they say about chemicals used in shampoos?", options: ["A. All shampoos contain the same chemicals", "B. The chemicals are believed to be dangerous", "C. Their presence is rarely publicised"], answer: ["C"], explanation: "Correct option: C." },
      { n: 24, prompt: "Printing directly onto shampoo bottles…", options: ["A. costs more", "B. looks less attractive", "C. takes much longer"], answer: ["B"], explanation: "Correct option: B." },
      { n: 25, prompt: "Which environmental issue do they want to investigate?", options: ["A. bottle appearance", "B. variations in bottle weight", "C. source of recycled plastic"], answer: ["B"], explanation: "Correct option: B." },
      { n: 26, prompt: "Michael bases his shampoo purchase on…", options: ["A. brand loyalty", "B. value for money", "C. trying new products"], answer: ["C"], explanation: "Correct option: C." },
      { n: 27, prompt: "Main advertising focus of Zing", options: ["A. relaxation", "B. enviable lifestyle", "C. natural ingredients", "D. masculine image", "E. reliability", "F. romantic interest", "G. celebrities"], answer: ["B"], explanation: "Correct option: B, enviable lifestyle." },
      { n: 28, prompt: "Main advertising focus of Splash", options: ["A. relaxation", "B. enviable lifestyle", "C. natural ingredients", "D. masculine image", "E. reliability", "F. romantic interest", "G. celebrities"], answer: ["F"], explanation: "Correct option: F, romantic interest." },
      { n: 29, prompt: "Main advertising focus of Just go", options: ["A. relaxation", "B. enviable lifestyle", "C. natural ingredients", "D. masculine image", "E. reliability", "F. romantic interest", "G. celebrities"], answer: ["E"], explanation: "Correct option: E, product reliability." },
      { n: 30, prompt: "Main advertising focus of Brozene", options: ["A. relaxation", "B. enviable lifestyle", "C. natural ingredients", "D. masculine image", "E. reliability", "F. romantic interest", "G. celebrities"], answer: ["A"], explanation: "Correct option: A, relaxation." },
    ]}],
  },
  "P3-4": {
    title: "Handwriting",
    instruction: "Choose the correct answer. Questions 21-24 require TWO answers.",
    sections: [{ heading: "Questions 21-30", questions: [
      { n: "21-22", prompt: "Which TWO benefits of learning to write surprised both students?", multiple: true, options: ["A. improved fine motor skills", "B. improved memory", "C. improved concentration", "D. improved imagination", "E. improved spatial awareness"], answer: ["C", "E"], explanation: "Correct answers: C and E." },
      { n: "23-24", prompt: "Which TWO handwriting problems for children with dyspraxia are easiest to correct?", multiple: true, options: ["A. incorrect letter spacing", "B. not writing in a straight line", "C. too much pressure", "D. confusing shapes / writing slowly", "E. holding the pencil incorrectly"], answer: ["A", "C"], explanation: "Correct answers: A and C." },
      { n: 25, prompt: "Using laptops to teach writing to children with dyslexia…", options: ["A. lacks motivation", "B. produces quick fluency", "C. produces a more positive reaction to mistakes"], answer: ["C"], explanation: "Correct option: C." },
      { n: 26, prompt: "The woman thinks that…", options: ["A. cursive disadvantages some children", "B. print links to lower performance", "C. most UK teachers prefer tradition"], answer: ["A"], explanation: "Correct option: A." },
      { n: 27, prompt: "What impact does poor handwriting have on exams?", options: ["A. evidence suggests grades are affected", "B. neatness matters less now", "C. candidates write shorter answers"], answer: ["A"], explanation: "Correct option: A." },
      { n: 28, prompt: "What prediction is made about handwriting?", options: ["A. touch typing will come first", "B. children will continue handwriting", "C. all handwriting will be digital"], answer: ["B"], explanation: "Correct option: B." },
      { n: 29, prompt: "Digital reliance has made it difficult for the woman to…", options: ["A. take detailed notes", "B. spell and punctuate", "C. read old documents"], answer: ["B"], explanation: "Correct option: B." },
      { n: 30, prompt: "How do the students feel about their own handwriting?", options: ["A. legible but not stylish", "B. children will continue handwriting", "C. embarrassed that the habit lapsed"], answer: ["C"], explanation: "Correct option: C." },
    ]}],
  },
  "P3-5": {
    title: "Using Scientific Techniques for Art",
    instruction: "Choose the correct answer for each question.",
    sections: [{ heading: "Questions 21-30", questions: [
      { n: 21, prompt: "What does Josh think about Jackson Pollock’s paintings?", options: ["A. easy to copy", "B. complex", "C. childish"], answer: ["B"], explanation: "Correct option: B." },
      { n: 22, prompt: "The $5 painting was considered fake because…", options: ["A. it lacked documentation", "B. it was too cheap", "C. it used the wrong colours"], answer: ["A"], explanation: "Correct option: A." },
      { n: 23, prompt: "Why did the Foundation reject the painting?", options: ["A. the back of the painting", "B. the type of paint", "C. paint application"], answer: ["B"], explanation: "Correct option: B." },
      { n: 24, prompt: "What do Josh and Emily agree about art evaluation?", options: ["A. only critics can evaluate", "B. science has replaced tradition", "C. science and art experts should collaborate"], answer: ["C"], explanation: "Correct option: C." },
      { n: 25, prompt: "Seracini used ___ to model the building.", options: ["A. ultrasound", "B. gamma-ray technology", "C. stone", "D. a laser scanner", "E. a radar machine", "F. glass", "G. a thermographic camera", "H. brick"], answer: ["D"], explanation: "Correct option: D, a laser scanner." },
      { n: 26, prompt: "He used ___ to reveal wall materials.", options: ["A. ultrasound", "B. gamma-ray technology", "C. stone", "D. a laser scanner", "E. a radar machine", "F. glass", "G. a thermographic camera", "H. brick"], answer: ["G"], explanation: "Correct option: G, a thermographic camera." },
      { n: 27, prompt: "The east-wall space used to hold ___.", options: ["A. ultrasound", "B. gamma-ray technology", "C. stone", "D. a laser scanner", "E. a radar machine", "F. glass", "G. a thermographic camera", "H. brick"], answer: ["F"], explanation: "Correct option: F, glass." },
      { n: 28, prompt: "He analysed the wall using ___.", options: ["A. ultrasound", "B. gamma-ray technology", "C. stone", "D. a laser scanner", "E. a radar machine", "F. glass", "G. a thermographic camera", "H. brick"], answer: ["E"], explanation: "Correct option: E, a radar machine." },
      { n: 29, prompt: "The painting may remain on the original ___ wall.", options: ["A. ultrasound", "B. gamma-ray technology", "C. stone", "D. a laser scanner", "E. a radar machine", "F. glass", "G. a thermographic camera", "H. brick"], answer: ["C"], explanation: "Correct option: C, stone." },
      { n: 30, prompt: "He is using ___ to prove the theory.", options: ["A. ultrasound", "B. gamma-ray technology", "C. stone", "D. a laser scanner", "E. a radar machine", "F. glass", "G. a thermographic camera", "H. brick"], answer: ["B"], explanation: "Correct option: B, gamma-ray technology." },
    ]}],
  },
  "P4-2": {
    title: "Human Memory",
    instruction: "Complete the notes. Write ONE WORD ONLY for each answer.",
    sections: [{ heading: "Human Memory", questions: [
      { n: 31, prompt: "Before 3000 BC, people were unable to ___, so they relied on memory.", answer: ["write"], explanation: "Writing had not yet been developed." },
      { n: 32, prompt: "Memory identified dangerous foods, such as some types of ___.", answer: ["plants"], explanation: "Some similar-looking plants were poisonous." },
      { n: 33, prompt: "Memories linked to a ___ are easier to recall.", answer: ["place"], explanation: "Simonides linked information with a particular place." },
      { n: 34, prompt: "The senses, especially ___, could help memory.", answer: ["sight"], explanation: "The lecture singles out sight." },
      { n: 35, prompt: "Making a good ___ depended on memory.", answer: ["speech"], explanation: "Public speaking relied on a strong memory." },
      { n: 36, prompt: "People also have their ___ memory.", answer: ["natural"], explanation: "Cicero contrasted developed artificial memory with natural memory." },
      { n: 37, prompt: "Scholastics used memory techniques to teach ___.", answer: ["religion"], explanation: "They instructed pupils about religion." },
      { n: 38, prompt: "In the 17th century, people believed ___ could provide explanations.", answer: ["science"], explanation: "Science was believed to answer human questions." },
      { n: 39, prompt: "Schoolchildren learned facts such as ___ through repetition.", answer: ["dates"], explanation: "The example given is repeatedly learning dates." },
      { n: 40, prompt: "‘S’ worked as a ___.", answer: ["journalist"], explanation: "The research subject S was a journalist." },
    ]}],
  },
};

const customPage = (exerciseId, exercise, audioName) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${exercise.title}</title><style>
:root{--ink:#183c38;--green:#0e5a4f;--mint:#e4efeb;--paper:#fffdf8;--line:#d8ded9;--red:#b94a2d}
*{box-sizing:border-box}body{margin:0;background:#f5f3ed;color:var(--ink);font:15px/1.65 Arial,sans-serif}
header{position:sticky;top:0;z-index:2;padding:18px 28px;background:var(--paper);border-bottom:1px solid var(--line)}
header strong{display:block;font:24px Georgia,serif}header small{color:#70827c}
main{max-width:920px;margin:auto;padding:24px 28px 100px}audio{width:100%;margin:0 0 22px}
.intro{padding:17px 20px;border-left:3px solid #eb6b43;background:var(--mint)}
section{margin-top:24px;padding:22px;background:var(--paper);border:1px solid var(--line);border-radius:8px}
h2{margin:0 0 16px;font:22px Georgia,serif}.q{padding:18px 0;border-top:1px solid #e5e8e5}.q:first-of-type{border-top:0}
.q-title{display:flex;gap:10px}.num{min-width:42px;color:#eb6b43;font-weight:bold}
input[type=text]{width:220px;max-width:100%;margin:12px 0 0 52px;padding:9px 10px;border:1px solid #8ca29b;border-radius:4px}
label{display:block;margin:8px 0 0 52px}.answer{display:none;margin:13px 0 0 52px;padding:11px 13px;background:#edf6f2;border-left:3px solid var(--green)}
.answer.bad{background:#fff0eb;border-color:var(--red)}body.review .answer{display:block}.correct{color:var(--green)}.incorrect{color:var(--red)}
footer{position:fixed;right:0;bottom:0;left:0;display:flex;justify-content:flex-end;gap:10px;padding:13px 28px;background:var(--paper);border-top:1px solid var(--line)}
button{padding:10px 18px;border:1px solid var(--green);border-radius:4px;background:white;color:var(--green);font-weight:bold;cursor:pointer}button.primary{background:var(--green);color:white}
@media(max-width:600px){header,main,footer{padding-left:14px;padding-right:14px}input[type=text],label,.answer{margin-left:0}}
</style></head><body>
<header><strong>${exercise.title}</strong><small>${exercise.instruction}</small></header>
<main><audio controls preload="metadata" src="${audioName}"></audio><div class="intro">${exercise.instruction}</div>
${exercise.sections.map(section => `<section><h2>${section.heading}</h2>${section.questions.map((q, qi) => `<div class="q" data-index="${qi}">
<div class="q-title"><span class="num">${q.n}</span><span>${q.prompt}</span></div>
${q.options ? q.options.map(option => `<label><input type="${q.multiple ? "checkbox" : "radio"}" name="q${String(q.n).replace("-", "_")}" value="${option[0]}"> ${option}</label>`).join("") : `<input type="text" name="q${q.n}" autocomplete="off">`}
<div class="answer"><strong></strong><br>答案：${q.answer.join(" / ")}<br>${q.explanation}</div></div>`).join("")}</section>`).join("")}
</main><footer><button id="reset">重新作答</button><button class="primary" id="finish-btn">提交并查看答案</button></footer>
<script>
const data=${JSON.stringify(exercise.sections.flatMap(section => section.questions))};
const norm=value=>String(value??'').trim().toLowerCase().replace(/[,£]/g,'');
document.getElementById('finish-btn').onclick=()=>{
 let score=0,total=0;
 document.body.classList.add('review');
 document.querySelectorAll('.q').forEach((row,index)=>{
  const q=data[index],name='q'+String(q.n).replace('-','_');
  const values=q.options?[...document.querySelectorAll('[name="'+name+'"]:checked')].map(el=>el.value):[document.querySelector('[name="'+name+'"]')?.value||''];
  const ok=q.answer.length===values.length&&q.answer.every(answer=>values.some(value=>norm(value)===norm(answer)));
  total+=q.multiple?q.answer.length:1;score+=ok?(q.multiple?q.answer.length:1):0;
  const box=row.querySelector('.answer'),label=box.querySelector('strong');box.classList.toggle('bad',!ok);label.className=ok?'correct':'incorrect';label.textContent=ok?'✓ 正确':'✗ 需要复习';
  row.querySelectorAll('input').forEach(input=>input.disabled=true);
 });
 window.parent.postMessage({type:'tingjian:score',exerciseId:${JSON.stringify(exerciseId)},score,total,practicedAt:new Date().toISOString()},'*');
};
document.getElementById('reset').onclick=()=>{document.body.classList.remove('review');document.querySelectorAll('input').forEach(input=>{input.disabled=false;input.checked=false;if(input.type==='text')input.value=''});};
</script></body></html>`;

const manifest = [];
for (const part of ["P1", "P2", "P3", "P4"]) {
  const zipFiles = readdirSync(join(sourceRoot, part))
    .filter((name) => name.toLowerCase().endsWith(".zip"))
    .sort((a, b) => naturalNumber(a) - naturalNumber(b));

  zipFiles.forEach((zipName, index) => {
    const sourceNo = naturalNumber(zipName);
    const exerciseId = `${part.toLowerCase()}-${String(index + 1).padStart(2, "0")}`;
    const exerciseDir = join(outputRoot, exerciseId);
    mkdirSync(exerciseDir, { recursive: true });

    const temp = mkdtempSync(join(tmpdir(), "tingjian-import-"));
    execFileSync("/usr/bin/ditto", ["-x", "-k", join(sourceRoot, part, zipName), temp]);
    const files = [];
    const walk = (directory) => {
      for (const name of readdirSync(directory)) {
        const full = join(directory, name);
        if (statSync(full).isDirectory()) walk(full);
        else files.push(full);
      }
    };
    walk(temp);

    const html = files.find((file) => file.toLowerCase().endsWith(".html"));
    const audio = files.find((file) => file.toLowerCase().endsWith(".mp3"));
    if (!audio) throw new Error(`Missing audio: ${zipName}`);
    cpSync(audio, join(exerciseDir, "audio.mp3"));

    const missingKey = `${part}-${sourceNo}`;
    if (html) {
      let page = readFileSync(html, "utf8");
      page = page.replace(/<\/body>/i, `${bridgeScript(exerciseId)}</body>`);
      writeFileSync(join(exerciseDir, "index.html"), page);
    } else if (missing[missingKey]) {
      writeFileSync(join(exerciseDir, "index.html"), customPage(exerciseId, missing[missingKey], "audio.mp3"));
    } else {
      throw new Error(`No HTML or custom exercise data: ${zipName}`);
    }

    manifest.push({
      id: exerciseId,
      part,
      ordinal: index + 1,
      sourceNo,
      title: cleanTitle(zipName),
      href: `/exercises/${exerciseId}/`,
      hasTranscript: Boolean(html) || missingKey === "P1-1" || missingKey === "P4-2",
    });
    rmSync(temp, { recursive: true });
  });
}

writeFileSync(
  join(projectRoot, "app", "exercises.ts"),
  `export const exercises = ${JSON.stringify(manifest, null, 2)} as const;\n`,
);
console.log(`Imported ${manifest.length} exercises.`);
