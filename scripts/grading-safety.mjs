const ANSWER_GROUPS = ["text", "single", "matching", "multiple"];

function answerKeyBody(html) {
  const match = /\banswerKey\s*:\s*\{/.exec(html);
  if (!match) return "";
  const start = match.index + match[0].lastIndexOf("{");
  let depth = 0;
  let quote = "";
  let escaped = false;

  for (let index = start; index < html.length; index += 1) {
    const char = html[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return html.slice(start + 1, index);
    }
  }
  return "";
}

export function answerKeySafetyIssues(html) {
  const body = answerKeyBody(html);
  if (!body) return [];
  return ANSWER_GROUPS.filter((group) => {
    const isDefined = new RegExp(`\\b${group}\\s*:`).test(body);
    const isReadDirectly = new RegExp(`answerKey\\.${group}\\s*\\[`).test(html);
    return isReadDirectly && !isDefined;
  });
}

export function normalizeAnswerKeyCollections(html) {
  const missing = answerKeySafetyIssues(html);
  if (!missing.length) return html;
  return html.replace(
    /\banswerKey\s*:\s*\{/,
    (opening) => `${opening}\n    /* tingjian-safe-answer-key */\n    ${missing.map((group) => `${group}: {},`).join("\n    ")}`,
  );
}
