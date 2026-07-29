import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import vm from "node:vm";
import { pdfOnlyExercises } from "./pdf-only-exercises.mjs";

const projectRoot = process.cwd();
const manifestSource = readFileSync(
  join(projectRoot, "app", "exercises.ts"),
  "utf8",
);
const exercises = JSON.parse(
  manifestSource
    .replace(/^export const exercises = /, "")
    .replace(/ as const;\s*$/, ""),
);

const decodeHtml = (value) =>
  value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const stripHtml = (value) =>
  decodeHtml(
    value
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const questionNumbers = (questionId) => {
  const match = String(questionId).match(/(\d+)\s*[-–—]\s*(\d+)/);
  if (!match) return [String(questionId)];
  return Array.from(
    { length: Number(match[2]) - Number(match[1]) + 1 },
    (_, index) => String(Number(match[1]) + index),
  );
};

const extractOptionLabels = (html, key, answerValues) => {
  const labels = [...html.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/gi)]
    .filter((match) => {
      const block = match[0];
      return (
        new RegExp(`\\bname=["']${escapeRegExp(key)}["']`, "i").test(block) &&
        answerValues.some((answer) =>
          new RegExp(
            `\\bvalue=["']${escapeRegExp(String(answer))}["']`,
            "i",
          ).test(block),
        )
      );
    })
    .map((match) => {
      const value = match[0].match(/\bvalue=["']([^"']+)["']/i)?.[1] || "";
      return { value, text: stripHtml(match[0]).replace(/^[A-H]\s+/, "") };
    });

  if (labels.length > 0) return labels;

  const taggedOptions = [...html.matchAll(
    /<([a-z][\w-]*)\b[^>]*\bdata-value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/\1>/gi,
  )]
    .filter((match) => answerValues.includes(match[2]))
    .map((match) => ({ value: match[2], text: stripHtml(match[3]) }));
  if (taggedOptions.length > 0) return taggedOptions;

  return answerValues.map((value) => ({ value, text: String(value) }));
};

const extractQuestionContext = (html, questionId, key) => {
  const anchors = [
    `data-q="${questionId}"`,
    `data-q='${questionId}'`,
    `name="${key}"`,
    `name='${key}'`,
  ];
  const positions = anchors.map((anchor) => html.lastIndexOf(anchor));
  const position = Math.max(...positions);
  if (position < 0) return "";

  const groupStart = Math.max(
    html.lastIndexOf('<div class="group"', position),
    html.lastIndexOf("<div class='group'", position),
  );
  if (groupStart >= 0 && position - groupStart < 7000) {
    const nextGroupCandidates = [
      html.indexOf('<div class="group"', position + 1),
      html.indexOf("<div class='group'", position + 1),
    ].filter((candidate) => candidate >= 0);
    const groupEnd =
      nextGroupCandidates.length > 0
        ? Math.min(...nextGroupCandidates)
        : Math.min(html.length, position + 5000);
    return stripHtml(html.slice(groupStart, groupEnd)).slice(0, 2500);
  }

  const elementCandidates = ["tr", "li", "p", "article"]
    .map((tag) => {
      const start = html.lastIndexOf(`<${tag}`, position);
      const end = start >= 0 ? html.indexOf(`</${tag}>`, position) : -1;
      return { tag, start, end };
    })
    .filter(
      ({ start, end }) =>
        start >= 0 && end >= position && end - start > 0 && end - start < 6000,
    )
    .sort((a, b) => b.start - a.start);
  if (elementCandidates.length > 0) {
    const { tag, start, end } = elementCandidates[0];
    return stripHtml(html.slice(start, end + tag.length + 3)).slice(0, 2500);
  }

  const nearby = html.slice(Math.max(0, position - 1200), position + 1800);
  return stripHtml(nearby).slice(0, 2500);
};

const extractLocalContext = (html, questionId, key) => {
  const anchors = [
    `data-q="${questionId}"`,
    `data-q='${questionId}'`,
    `name="${key}"`,
    `name='${key}'`,
  ];
  const position = Math.max(...anchors.map((anchor) => html.lastIndexOf(anchor)));
  if (position < 0) return "";
  const nearby = html.slice(Math.max(0, position - 320), position + 520);
  return stripHtml(
    nearby
      .replace(/<input\b[^>]*>/gi, (input) =>
        new RegExp(`\\bname=["']${escapeRegExp(key)}["']`, "i").test(input)
          ? " [[TARGET]] "
          : " ___ ",
      )
      .replace(/<select\b[\s\S]*?<\/select>/gi, " ___ "),
  ).slice(0, 900);
};

const parseConfiguration = (html, exerciseId) => {
  const source = html.match(
    /<script[^>]*id=["']task-configuration["'][^>]*>([\s\S]*?)<\/script>/i,
  )?.[1];
  if (!source) return null;
  const context = {};
  new vm.Script(
    source.replace(/\bconst\s+CONFIG_DATA\s*=/, "globalThis.CONFIG_DATA ="),
    { filename: `${exerciseId}-configuration.js` },
  ).runInNewContext(context);
  return context.CONFIG_DATA;
};

const timestampWithoutMilliseconds = (value) => {
  const match = String(value).match(/(?:(\d+):)?(\d+):(\d+)[,.]\d+/);
  if (!match) return String(value);
  const hours = Number(match[1] || 0);
  const minutes = hours * 60 + Number(match[2]);
  return `${String(minutes).padStart(2, "0")}:${match[3]}`;
};

const localTranscript = (exerciseId) => {
  const publishedPath = join(
    projectRoot,
    "content",
    "transcripts",
    `${exerciseId}.json`,
  );
  const workPath = join(projectRoot, "work", "transcripts", `${exerciseId}.json`);
  const path = existsSync(publishedPath) ? publishedPath : workPath;
  if (!existsSync(path)) return [];
  const data = JSON.parse(readFileSync(path, "utf8"));
  return (data.transcription || []).map((segment) => [
    timestampWithoutMilliseconds(segment.timestamps.from),
    timestampWithoutMilliseconds(segment.timestamps.to),
    String(segment.text).trim(),
  ]);
};

const customQuestion = ({
  id,
  numbers = [String(id)],
  answerType,
  answerValues,
  answerLabels,
  context,
}) => ({
  id: String(id),
  numbers: numbers.map(String),
  key: `q${String(id).replace(/\s*[-–—]\s*/g, "_")}`,
  answerType,
  answerValues: answerValues.map(String),
  answerLabels: answerLabels.map(([value, text]) => ({
    value: String(value),
    text,
  })),
  context,
  localContext: context,
});

const customPdfQuestions = (exercise) => {
  if (exercise.kind === "tour-table") {
    const contexts = new Map();
    for (const row of exercise.rows) {
      if (row.costQuestion) {
        contexts.set(
          row.costQuestion,
          `${row.tour}: total cost per person`,
        );
      }
      if (row.tourQuestion) {
        contexts.set(row.tourQuestion, "Tour destination");
      }
      for (const detail of row.details) {
        if (typeof detail === "string") continue;
        contexts.set(detail.q, `${detail.before} [[TARGET]] ${detail.after}`);
        if (detail.q2) {
          contexts.set(detail.q2, `${detail.before} ${detail.after} [[TARGET]]`);
        }
      }
    }
    return exercise.questions.map((question) =>
      customQuestion({
        id: question.n,
        answerType: "text",
        answerValues: question.answers,
        answerLabels: question.answers.map((answer) => [answer, answer]),
        context: contexts.get(question.n) || `Question ${question.n}`,
      }),
    );
  }

  const questions = [];
  for (const question of exercise.choices || []) {
    const correct = question.options.find(([value]) => value === question.answer);
    questions.push(
      customQuestion({
        id: question.n,
        answerType: "single",
        answerValues: [question.answer],
        answerLabels: [correct],
        context: `${question.prompt} ${question.options
          .map(([value, text]) => `${value} ${text}`)
          .join(" ")}`,
      }),
    );
  }
  for (const question of exercise.multi || []) {
    questions.push(
      customQuestion({
        id: question.label,
        numbers: question.label.split(/[–—-]/),
        answerType: "multiple",
        answerValues: question.answers,
        answerLabels: question.options.filter(([value]) =>
          question.answers.includes(value),
        ),
        context: `${question.prompt} ${question.options
          .map(([value, text]) => `${value} ${text}`)
          .join(" ")}`,
      }),
    );
  }

  const matching = exercise.matching;
  for (const row of matching?.rows || []) {
    const correct = matching.options.find(([value]) => value === row.answer);
    questions.push(
      customQuestion({
        id: row.n,
        answerType: "matching",
        answerValues: [row.answer],
        answerLabels: [correct],
        context: `${matching.instruction} ${row.label}`,
      }),
    );
  }

  const flow = exercise.flow;
  for (const row of flow?.rows || []) {
    const correct = flow.options.find(([value]) => value === row.answer);
    questions.push(
      customQuestion({
        id: row.n,
        answerType: "flowChart",
        answerValues: [row.answer],
        answerLabels: [correct],
        context: `${flow.title}: ${row.before} [[TARGET]] ${row.after}`,
      }),
    );
  }

  if (exercise.kind === "memory-notes") {
    const contexts = new Map();
    for (const section of exercise.sections) {
      for (const note of section.notes) {
        if (typeof note === "string") continue;
        contexts.set(
          note.q,
          `${section.heading}: ${note.before} [[TARGET]] ${note.after}`,
        );
      }
    }
    for (const question of exercise.questions) {
      questions.push(
        customQuestion({
          id: question.n,
          answerType: "text",
          answerValues: question.answers,
          answerLabels: question.answers.map((answer) => [answer, answer]),
          context: contexts.get(question.n) || `Question ${question.n}`,
        }),
      );
    }
  }

  return questions.sort(
    (a, b) => Number(a.numbers[0]) - Number(b.numbers[0]),
  );
};

const specialHtmlQuestions = (html) => {
  const anchors = [...html.matchAll(
    /<div\s+id=["']anchor_q(\d+)["'][^>]*\bdata-answer=["']([^"']+)["'][^>]*>/gi,
  )];
  return anchors.map((anchor, index) => {
    const start = anchor.index;
    const end = anchors[index + 1]?.index ?? html.indexOf("</main>", start);
    const context = stripHtml(html.slice(start, end));
    return customQuestion({
      id: anchor[1],
      answerType: "text",
      answerValues: [anchor[2]],
      answerLabels: [[anchor[2], anchor[2]]],
      context,
    });
  });
};

const output = {
  generatedAt: new Date().toISOString(),
  summary: {
    exercises: exercises.length,
    questionNumbers: 0,
    exercisesWithTranscript: 0,
    questionNumbersWithTranscript: 0,
  },
  exercises: [],
};

for (const exercise of exercises) {
  const html = readFileSync(
    join(projectRoot, "public", "exercises", exercise.id, "index.html"),
    "utf8",
  );
  const configuration = parseConfiguration(html, exercise.id);
  const customExercise = Object.values(pdfOnlyExercises).find(
    (candidate) => candidate.id === exercise.id,
  );
  const record = {
    id: exercise.id,
    title: exercise.title,
    part: exercise.part,
    ordinal: exercise.ordinal,
    transcript: (configuration?.transcriptLines || localTranscript(exercise.id)).map(
      ([start, end, text]) => [
        timestampWithoutMilliseconds(start),
        timestampWithoutMilliseconds(end),
        text,
      ],
    ),
    questions: [],
  };

  if (configuration) {
    for (const questionId of configuration.questionList) {
      const key = `q${String(questionId).replace(/\s*[-–—]\s*/g, "_")}`;
      const collections = Object.entries(configuration.answerKey || {}).filter(
        ([, answers]) =>
          answers &&
          typeof answers === "object" &&
          Object.prototype.hasOwnProperty.call(answers, key),
      );
      if (collections.length !== 1) {
        throw new Error(
          `${exercise.id} ${questionId} has ${collections.length} answer collections`,
        );
      }
      const [answerType, answerCollection] = collections[0];
      const rawAnswers = answerCollection[key];
      const answerValues = Array.isArray(rawAnswers)
        ? rawAnswers.map(String)
        : [String(rawAnswers)];
      record.questions.push({
        id: String(questionId),
        numbers: questionNumbers(questionId),
        key,
        answerType,
        answerValues,
        answerLabels: extractOptionLabels(html, key, answerValues),
        context: extractQuestionContext(html, questionId, key),
        localContext: extractLocalContext(html, questionId, key),
      });
    }
  } else if (customExercise) {
    record.questions = customPdfQuestions(customExercise);
  } else {
    record.questions = specialHtmlQuestions(html);
  }

  const representedQuestionNumbers = record.questions.reduce(
    (sum, question) => sum + question.numbers.length,
    0,
  );
  output.summary.questionNumbers += representedQuestionNumbers || 10;
  if (record.transcript.length > 0) {
    output.summary.exercisesWithTranscript += 1;
    output.summary.questionNumbersWithTranscript += representedQuestionNumbers;
  }
  output.exercises.push(record);
}

const outputPath = join(projectRoot, "work", "explanation-corpus.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(JSON.stringify(output.summary, null, 2));
console.log(`Wrote ${outputPath}`);
