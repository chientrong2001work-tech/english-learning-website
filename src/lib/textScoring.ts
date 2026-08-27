export interface TextScoreResult {
  score: number; // 0-100
  band: "Chưa đạt" | "A2" | "B1" | "B2" | "C1+";
  feedback: string[];
}

export interface ScoringOptions {
  // The question/prompt text — used to reject answers that just echo it back.
  promptText?: string;
  minWordsForFullLength: number;
  // Groups of synonyms; an answer that actually addresses the question is
  // expected to hit most groups (e.g. [["my name", "i am"], ["from", "i live in"]]).
  keywordGroups?: string[][];
}

const CONNECTORS = [
  "because",
  "although",
  "however",
  "therefore",
  "moreover",
  "furthermore",
  "in addition",
  "for example",
  "despite",
  "while",
  "since",
  "so that",
  "but also",
];

function isMostlyEnglish(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 3) return false;
  let nonAsciiCount = 0;
  for (const ch of text) {
    if (ch.charCodeAt(0) > 127) nonAsciiCount++;
  }
  return nonAsciiCount / Math.max(1, text.length) < 0.15;
}

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
}

// Catches the "just copy the question into the answer box" case: if most of
// the answer's words come straight from the prompt and it isn't meaningfully
// longer than the prompt, it isn't a real answer.
function isEchoOfPrompt(promptText: string | undefined, answerText: string): boolean {
  if (!promptText) return false;
  const promptWords = normalizeWords(promptText);
  const answerWords = normalizeWords(answerText);
  if (promptWords.length === 0 || answerWords.length === 0) return false;
  const promptSet = new Set(promptWords);
  const overlap = answerWords.filter((w) => promptSet.has(w)).length;
  const overlapRatio = overlap / answerWords.length;
  return overlapRatio > 0.6 && answerWords.length <= promptWords.length * 1.5;
}

function relevanceScore(text: string, keywordGroups: string[][] | undefined): number | null {
  if (!keywordGroups || keywordGroups.length === 0) return null;
  const lower = text.toLowerCase();
  const hits = keywordGroups.filter((group) => group.some((kw) => lower.includes(kw))).length;
  return hits / keywordGroups.length;
}

// Heuristic, rule-based scorer — not a real grammar/content examiner. It
// rejects answers that just echo the question, then checks observable
// signals (length, sentence count, vocabulary variety, connectors, and —
// when keywordGroups are given — whether the answer actually addresses what
// was asked) so the score reflects real answer quality, not just completion.
export function scoreEnglishResponse(rawText: string, options: ScoringOptions): TextScoreResult {
  const { promptText, minWordsForFullLength, keywordGroups } = options;
  const text = rawText.trim();
  const words = text.length ? text.split(/\s+/) : [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return { score: 0, band: "Chưa đạt", feedback: ["Chưa có nội dung để đánh giá."] };
  }
  if (!isMostlyEnglish(text)) {
    return { score: 0, band: "Chưa đạt", feedback: ["Câu trả lời cần được viết/nói bằng tiếng Anh."] };
  }
  if (isEchoOfPrompt(promptText, text)) {
    return {
      score: 0,
      band: "Chưa đạt",
      feedback: ["Câu trả lời đang lặp lại đề bài — hãy tự trả lời bằng lời của chính bạn."],
    };
  }

  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const sentenceCount = Math.max(1, sentences.length);
  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[^a-z']/g, "")).filter(Boolean),
  );
  const lexicalDiversity = wordCount ? uniqueWords.size / wordCount : 0;
  const lowerText = text.toLowerCase();
  const connectorHits = CONNECTORS.filter((c) => lowerText.includes(c)).length;
  const relevance = relevanceScore(text, keywordGroups);

  const weights =
    relevance === null
      ? { length: 40, sentence: 20, diversity: 20, connector: 20, relevance: 0 }
      : { length: 25, sentence: 15, diversity: 15, connector: 15, relevance: 30 };

  const feedback: string[] = [];
  let score = 0;

  const lengthScore = Math.min(weights.length, (wordCount / minWordsForFullLength) * weights.length);
  score += lengthScore;
  if (wordCount < minWordsForFullLength * 0.6) {
    feedback.push("Câu trả lời còn ngắn — hãy nói/viết chi tiết hơn.");
  }

  const sentenceScore = Math.min(weights.sentence, sentenceCount * (weights.sentence / 4));
  score += sentenceScore;
  if (sentenceCount < 2) {
    feedback.push("Hãy chia ý thành nhiều câu rõ ràng hơn.");
  }

  const diversityScore = Math.min(weights.diversity, lexicalDiversity * (weights.diversity * 1.4));
  score += diversityScore;
  if (lexicalDiversity < 0.55) {
    feedback.push("Hãy dùng từ vựng đa dạng hơn, tránh lặp lại cùng một từ nhiều lần.");
  }

  const connectorScore = Math.min(weights.connector, connectorHits * (weights.connector / 2));
  score += connectorScore;
  if (connectorHits === 0) {
    feedback.push("Hãy thử dùng từ nối (because, however, for example...) để câu trả lời mạch lạc hơn.");
  }

  if (relevance !== null) {
    score += relevance * weights.relevance;
    if (relevance < 0.5) {
      feedback.push("Câu trả lời chưa đề cập đủ các ý mà câu hỏi yêu cầu.");
    }
  }

  score = Math.round(Math.min(100, score));

  if (feedback.length === 0) {
    feedback.push("Câu trả lời rõ ràng, đủ ý và có từ vựng đa dạng.");
  }

  return { score, band: scoreToBand(score), feedback };
}

// Shared score->band mapping, also used to present objective Reading/Listening
// percentages with the same band labels as the heuristic Writing/Speaking scores.
export function scoreToBand(score: number): TextScoreResult["band"] {
  if (score < 25) return "Chưa đạt";
  if (score < 45) return "A2";
  if (score < 65) return "B1";
  if (score < 82) return "B2";
  return "C1+";
}
