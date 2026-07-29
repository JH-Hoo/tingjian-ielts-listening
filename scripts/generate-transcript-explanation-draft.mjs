import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const projectRoot = process.cwd();
const corpus = JSON.parse(
  readFileSync(join(projectRoot, "work", "explanation-corpus.json"), "utf8"),
);

const stopWords = new Set(
  "a an and are as at be been being but by can could did do does for from had has have he her here him his how i if in into is it its may might more most not of on or our she should so some than that the their them then there these they this those through to too under up us was we were what when where which who why will with would you your".split(
    " ",
  ),
);

const stem = (word) => {
  let value = word.toLowerCase();
  if (value.length > 6 && value.endsWith("ing")) value = value.slice(0, -3);
  else if (value.length > 5 && value.endsWith("ed")) value = value.slice(0, -2);
  else if (value.length > 5 && value.endsWith("es")) value = value.slice(0, -2);
  else if (value.length > 4 && value.endsWith("s")) value = value.slice(0, -1);
  return value;
};

const tokens = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((word) => word && !stopWords.has(word))
    .map(stem);

const oneEditApart = (left, right) => {
  if (left === right) return true;
  if (left.length < 5 || right.length < 5) return false;
  if (Math.abs(left.length - right.length) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 1) return false;
    if (left.length > right.length) i += 1;
    else if (right.length > left.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  return edits + (i < left.length || j < right.length ? 1 : 0) <= 1;
};

const compact = (value) => String(value).replace(/\s+/g, " ").trim();
const plainTranscript = (value) =>
  compact(
    String(value)
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&"),
  );

const shortEvidence = (value, maximumWords = 80) => {
  const words = compact(value).split(" ");
  return words.length <= maximumWords
    ? words.join(" ")
    : `${words.slice(0, maximumWords).join(" ")}…`;
};

const localTargetContext = (value) => {
  const text = compact(value);
  const marker = text.indexOf("[[TARGET]]");
  if (marker < 0) return text;
  const before = text.slice(0, marker).split(" ").slice(-12).join(" ");
  const after = text
    .slice(marker + "[[TARGET]]".length)
    .split(" ")
    .slice(0, 12)
    .join(" ");
  return `${before} ${after}`;
};

const normalisedPhrase = (value) =>
  String(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const numberWords = new Map([
  ["twenty-one", "21"],
  ["twenty-two", "22"],
  ["twenty-three", "23"],
  ["twenty-four", "24"],
  ["twenty-five", "25"],
  ["twenty-six", "26"],
  ["twenty-seven", "27"],
  ["twenty-eight", "28"],
  ["twenty-nine", "29"],
  ["thirty", "30"],
  ["thirty-one", "31"],
  ["thirty-two", "32"],
  ["thirty-three", "33"],
  ["thirty-four", "34"],
  ["thirty-five", "35"],
  ["thirty-six", "36"],
  ["thirty-seven", "37"],
  ["thirty-eight", "38"],
  ["thirty-nine", "39"],
  ["forty", "40"],
]);

const normaliseNumberWords = (value) => {
  let text = String(value).toLowerCase();
  for (const [word, number] of numberWords) {
    text = text.replaceAll(word, number).replaceAll(word.replace("-", " "), number);
  }
  return text;
};

const transcriptQuestionRanges = (lines) => {
  const byQuestionRange = new Map();
  lines.forEach((line, index) => {
    const currentText = normaliseNumberWords(plainTranscript(line[2]));
    const combinedText = `${currentText} ${normaliseNumberWords(
      plainTranscript(lines[index + 1]?.[2] || ""),
    )}`;
    const pattern =
      /(?:(answer|look at)\s+)?questions?\s+(\d+)\s*(?:to|through|and|-)\s*(\d+)/;
    const currentMatch = currentText.match(pattern);
    const match = currentMatch || combinedText.match(pattern);
    if (!match) return;
    const priority = match[1] === "answer" ? 3 : match[1] === "look at" ? 2 : 1;
    const candidate = {
      first: Number(match[2]),
      last: Number(match[3]),
      index,
      startIndex: index + (currentMatch ? 1 : 2),
      priority,
    };
    const key = `${candidate.first}-${candidate.last}`;
    const previous = byQuestionRange.get(key);
    if (
      !previous ||
      candidate.priority > previous.priority ||
      (candidate.priority === previous.priority && candidate.index > previous.index)
    ) {
      byQuestionRange.set(key, candidate);
    }
  });
  const ranges = [...byQuestionRange.values()].sort(
    (left, right) => left.index - right.index,
  );
  return ranges.map((range, index) => {
    const nextRangeIndex = ranges[index + 1]?.index ?? lines.length;
    const endMarkerIndex = lines.findIndex(
      (line, lineIndex) =>
        lineIndex >= range.startIndex &&
        lineIndex < nextRangeIndex &&
        /that is the end of (?:part|section)/i.test(plainTranscript(line[2])),
    );
    return {
      ...range,
      endIndex:
        (endMarkerIndex >= 0 ? endMarkerIndex : nextRangeIndex) - 1,
    };
  });
};

const reviewedEvidenceRanges = {
  "p2-01": {
    21: [7, 10],
    22: [19, 21],
    23: [23, 26],
    24: [28, 32],
    25: [33, 38],
    26: [40, 44],
    27: [52, 60],
    28: [64, 74],
    29: [78, 84],
    30: [85, 89],
  },
  "p3-01": {
    "21–22": [12, 23],
    "23–24": [24, 35],
    25: [40, 44],
    26: [45, 50],
    27: [51, 55],
    28: [56, 60],
    29: [61, 66],
    30: [67, 71],
  },
  "p3-02": {
    21: [10, 14],
    22: [20, 22],
    23: [23, 30],
    24: [31, 36],
    25: [43, 46],
    26: [47, 52],
    27: [51, 54],
    28: [55, 59],
    29: [59, 60],
    30: [61, 63],
  },
  "p2-03": {
    14: [19, 19],
  },
  "p2-07": {
    20: [45, 46],
  },
  "p2-08": {
    12: [9, 10],
    13: [17, 17],
    14: [18, 24],
    15: [26, 30],
  },
  "p3-06": {
    25: [23, 28],
    26: [33, 36],
  },
  "p3-07": {
    25: [31, 35],
  },
};

const boundsForQuestion = (ranges, question, lineCount) => {
  const firstNumber = Number(question.numbers[0]);
  const matchingRange = ranges.find(
    (range) => firstNumber >= range.first && firstNumber <= range.last,
  );
  if (!matchingRange) {
    return {
      firstQuestion: Number(question.numbers[0]),
      lastQuestion: Number(question.numbers.at(-1)),
      startIndex: 0,
      endIndex: lineCount - 1,
      candidateStartIndex: 0,
      candidateEndIndex: lineCount - 1,
    };
  }
  const questionSpan =
    (matchingRange.endIndex - matchingRange.startIndex + 1) /
    (matchingRange.last - matchingRange.first + 1);
  const firstOffset = firstNumber - matchingRange.first;
  const representedCount = question.numbers.length;
  return {
    firstQuestion: matchingRange.first,
    lastQuestion: matchingRange.last,
    startIndex: matchingRange.startIndex,
    endIndex: matchingRange.endIndex,
    candidateStartIndex: Math.max(
      matchingRange.startIndex,
      Math.floor(
        matchingRange.startIndex + (firstOffset - 0.55) * questionSpan,
      ),
    ),
    candidateEndIndex: Math.min(
      matchingRange.endIndex,
      Math.ceil(
        matchingRange.startIndex +
          (firstOffset + representedCount + 0.55) * questionSpan,
      ),
    ),
  };
};

const locationLabel = (lines, indices) => {
  const ordered = [...new Set(indices)].sort((a, b) => a - b);
  if (ordered.length === 0) return "";
  return `${lines[ordered[0]][0]}-${lines[ordered.at(-1)][1]}`;
};

const expandIndices = (lines, indices, radius) => {
  const expanded = new Set();
  for (const index of indices) {
    for (let nearby = index - radius; nearby <= index + radius; nearby += 1) {
      if (nearby >= 0 && nearby < lines.length) expanded.add(nearby);
    }
  }
  return [...expanded].sort((a, b) => a - b);
};

const expandEvidenceIndices = (lines, indices, before, after) => {
  const expanded = new Set();
  for (const index of indices) {
    for (let nearby = index - before; nearby <= index + after; nearby += 1) {
      if (nearby >= 0 && nearby < lines.length) expanded.add(nearby);
    }
  }
  return [...expanded].sort((a, b) => a - b);
};

const evidenceForIndices = (lines, indices) => {
  return shortEvidence(
    indices.map((index) => plainTranscript(lines[index][2])).join(" "),
  );
};

const reviewedIndices = (exerciseId, questionId) => {
  const range = reviewedEvidenceRanges[exerciseId]?.[questionId];
  if (!range) return null;
  const [first, last] = range;
  return Array.from({ length: last - first + 1 }, (_, offset) => first + offset);
};

const keyQuoteForIndices = (lines, indices, question) => {
  const answerTokens = new Set(
    question.answerLabels.flatMap(({ text }) => tokens(text)),
  );
  const ranked = indices
    .map((index) => {
      const text = plainTranscript(lines[index][2]);
      const words = new Set(tokens(text));
      const overlap = [...answerTokens].filter((token) => words.has(token)).length;
      return { index, text, overlap };
    })
    .filter(({ text }) => text && !/^(?:part|section) \d/i.test(text))
    .sort((left, right) => right.overlap - left.overlap || left.index - right.index);
  const chosen = ranked.slice(0, question.answerType === "multiple" ? 2 : 1);
  return shortEvidence(
    chosen
      .sort((left, right) => left.index - right.index)
      .map(({ text }) => text)
      .join(" "),
    38,
  );
};

const answerText = (question) =>
  question.answerLabels
    .map(({ value, text }) =>
      /^[A-H]$/.test(value) && text !== value ? `${value}（${text}）` : text,
    )
    .join("、");

const findBestLine = ({
  lines,
  lineTokens,
  documentFrequency,
  answerValue,
  answerLabel,
  context,
  expectedIndex,
  minimumIndex,
  maximumIndex,
}) => {
  const answerTargetTokens = new Set(tokens(answerLabel));
  const contextTargetTokens = new Set(tokens(context).slice(0, 18));
  const exactPhrase = /^[A-H]$/.test(answerValue)
    ? ""
    : normalisedPhrase(answerValue);
  if (exactPhrase) {
    const paddedNeedle = ` ${exactPhrase} `;
    const exactIndices = [];
    for (
      let index = Math.max(0, minimumIndex);
      index <= Math.min(lines.length - 1, maximumIndex);
      index += 1
    ) {
      const linePhrase = ` ${normalisedPhrase(plainTranscript(lines[index][2]))} `;
      if (linePhrase.includes(paddedNeedle)) exactIndices.push(index);
    }
    if (exactIndices.length > 0) {
      const index = exactIndices.sort(
        (left, right) =>
          Math.abs(left - expectedIndex) - Math.abs(right - expectedIndex),
      )[0];
      return { index, score: 100, exact: true, lexicalScore: 12 };
    }
  }
  let best = { index: Math.max(0, Math.round(expectedIndex)), score: -Infinity };

  for (let index = 0; index < lines.length; index += 1) {
    if (index < minimumIndex - 2 || index > maximumIndex) continue;
    const scoringWindow = expandIndices(lines, [index], 2).filter(
      (lineIndex) =>
        lineIndex >= Math.max(0, minimumIndex) && lineIndex <= maximumIndex,
    );
    const transcriptPhrase = normalisedPhrase(
      scoringWindow.map((lineIndex) => plainTranscript(lines[lineIndex][2])).join(" "),
    );
    const words = new Set(scoringWindow.flatMap((lineIndex) => lineTokens[lineIndex]));
    let lexicalScore = 0;
    const scoreToken = (token, multiplier) => {
      const exactToken = words.has(token);
      const fuzzyToken =
        !exactToken && [...words].some((word) => oneEditApart(token, word));
      if (!exactToken && !fuzzyToken) return;
      const frequency = documentFrequency.get(token) || 1;
      lexicalScore +=
        (1 + Math.log((lines.length + 1) / frequency)) *
        (exactToken ? 1 : 0.85) *
        multiplier;
    };
    for (const token of answerTargetTokens) scoreToken(token, 2.2);
    for (const token of contextTargetTokens) {
      if (!answerTargetTokens.has(token)) scoreToken(token, 0.35);
    }
    const exact = exactPhrase && transcriptPhrase.includes(exactPhrase);
    const positionPenalty = Math.abs(index - expectedIndex) * 0.9;
    const backwardsPenalty =
      index + 2 < minimumIndex ? (minimumIndex - index) * 2.4 : 0;
    const score =
      lexicalScore * 3.5 + (exact ? 60 : 0) - positionPenalty - backwardsPenalty;
    if (score > best.score) best = { index, score, exact, lexicalScore };
  }
  return best;
};

const explanationReason = (question, location, keyQuote) => {
  const answer = answerText(question);
  if (question.answerType === "text") {
    return `录音在 ${location} 直接给出了空格所缺的信息。其中“${question.answerValues.join(
      " / ",
    )}”正好补全题干所缺的信息，因此答案是 ${answer}。`;
  }
  if (question.answerType === "multiple") {
    return `录音在 ${location} 先后给出了题目要求的多个要点；它们分别与 ${answer} 的含义对应，因此本组应选择 ${question.answerValues.join(
      "、",
    )}。`;
  }
  if (question.answerType === "matching" || question.answerType === "flowChart") {
    return `录音在 ${location} 描述了题目所问的对象、特征或步骤；这段信息与 ${answer} 的含义相符，所以该题应匹配到 ${question.answerValues.join(
      "、",
    )}。`;
  }
  return `录音在 ${location} 对题目所问内容作出了直接说明，其含义与选项 ${answer} 一致，所以选择 ${question.answerValues.join(
    "、",
  )}；判断依据是录音含义，而不是只看题目中的相同单词。`;
};

const draft = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  provenance:
    "Drafted from the transcript text embedded in each source HTML page. Requires coverage and low-confidence review before publication.",
  exercises: {},
};

const confidenceCounts = {
  transcriptMarker: 0,
  exact: 0,
  high: 0,
  medium: 0,
  low: 0,
};

for (const exercise of corpus.exercises) {
  if (exercise.transcript.length === 0 || exercise.questions.length === 0) continue;
  const lines = exercise.transcript;
  const questionRanges = transcriptQuestionRanges(lines);
  const lineTokens = lines.map((line) => tokens(plainTranscript(line[2])));
  const documentFrequency = new Map();
  for (const words of lineTokens) {
    for (const token of new Set(words)) {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    }
  }

  const page = {};
  let minimumIndex = 0;
  exercise.questions.forEach((question, questionIndex) => {
    const bounds = boundsForQuestion(questionRanges, question, lines.length);
    const firstNumber = Number(question.numbers[0]);
    const expectedIndex =
      (bounds.candidateStartIndex + bounds.candidateEndIndex) / 2;
    if (minimumIndex < bounds.startIndex || minimumIndex > bounds.endIndex) {
      minimumIndex = bounds.startIndex;
    }
    const targets = question.answerLabels.length
      ? question.answerLabels
      : question.answerValues.map((value) => ({ value, text: value }));
    const textQuestion = question.answerType === "text";
    const targetMatches = targets.map((target) =>
      findBestLine({
        lines,
        lineTokens,
        documentFrequency,
        answerValue: target.value,
        answerLabel: target.text,
        context: `${localTargetContext(question.localContext)} ${question.context}`,
        expectedIndex,
        minimumIndex: Math.max(
          minimumIndex,
          textQuestion ? bounds.startIndex : bounds.candidateStartIndex,
        ),
        maximumIndex: textQuestion ? bounds.endIndex : bounds.candidateEndIndex,
      }),
    );
    const matches = textQuestion
      ? [
          [...targetMatches].sort(
            (left, right) =>
              Number(right.exact) - Number(left.exact) || right.score - left.score,
          )[0],
        ]
      : targetMatches;
    const markerIndices = [];
    lines.forEach((line, lineIndex) => {
      const markerText = line[2];
      if (
        question.numbers.some((number) =>
          new RegExp(`\\(Q${number}(?:\\)|[-–—])`).test(markerText),
        )
      ) {
        markerIndices.push(lineIndex);
      }
    });
    const reviewed = reviewedIndices(exercise.id, question.id);
    const indices =
      reviewed ||
      (markerIndices.length > 0
        ? [...new Set(markerIndices)]
        : matches.map((match) => match.index));
    minimumIndex = Math.max(minimumIndex, Math.min(...indices));
    const exact = matches.every((match) => match.exact);
    const averageLexical =
      matches.reduce((sum, match) => sum + match.lexicalScore, 0) /
      Math.max(1, matches.length);
    const confidence =
      reviewed
        ? "reviewed"
        : markerIndices.length > 0
        ? "transcriptMarker"
        : exact
          ? "exact"
          : averageLexical >= 5
            ? "high"
            : averageLexical >= 2.5
              ? "medium"
              : "low";
    confidenceCounts[confidence] = (confidenceCounts[confidence] || 0) + 1;
    const evidenceIndices =
      reviewed
        ? reviewed
        : markerIndices.length > 0
        ? expandIndices(lines, indices, 1)
        : expandEvidenceIndices(lines, indices, 1, 5);
    const location = locationLabel(lines, evidenceIndices);
    const evidence = evidenceForIndices(lines, evidenceIndices);
    const keyQuote = keyQuoteForIndices(lines, evidenceIndices, question);
    page[question.id] = {
      numbers: question.numbers,
      answer: question.answerValues,
      answerText: answerText(question),
      location,
      evidence,
      keyQuote,
      reason: explanationReason(question, location, keyQuote),
      confidence,
      source: reviewedEvidenceRanges[exercise.id]
        ? "local-audio-transcript-reviewed"
        : "source-transcript",
    };
  });
  draft.exercises[exercise.id] = page;
}

const outputPath = join(projectRoot, "work", "explanation-draft.json");
const publicOutputPath = join(projectRoot, "public", "explanations.json");
mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(draft, null, 2)}\n`);
writeFileSync(publicOutputPath, `${JSON.stringify(draft, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      exercises: Object.keys(draft.exercises).length,
      explanationUnits: Object.values(draft.exercises).reduce(
        (sum, page) => sum + Object.keys(page).length,
        0,
      ),
      representedQuestionNumbers: Object.values(draft.exercises).reduce(
        (sum, page) =>
          sum +
          Object.values(page).reduce(
            (pageSum, item) => pageSum + item.numbers.length,
            0,
          ),
        0,
      ),
      confidenceCounts,
    },
    null,
    2,
  ),
);
console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${publicOutputPath}`);
