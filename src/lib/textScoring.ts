export interface TextScoreResult {
  score: number; // 0-100
  band: "Chưa đạt" | "A2" | "B1" | "B2" | "C1+";
  feedback: string[];
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

// Heuristic, rule-based scorer — not a real grammar/content examiner. It
// checks observable signals (length, sentence count, vocabulary variety,
// use of connectors) so a submitted answer earns a score reflecting its
// actual quality instead of just being marked "done" for being non-empty.
export function scoreEnglishResponse(rawText: string, minWordsForFullLength: number): TextScoreResult {
  const text = rawText.trim();
  const words = text.length ? text.split(/\s+/) : [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return { score: 0, band: "Chưa đạt", feedback: ["Chưa có nội dung để đánh giá."] };
  }
  if (!isMostlyEnglish(text)) {
    return { score: 0, band: "Chưa đạt", feedback: ["Câu trả lời cần được viết/nói bằng tiếng Anh."] };
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

  const feedback: string[] = [];
  let score = 0;

  const lengthScore = Math.min(40, (wordCount / minWordsForFullLength) * 40);
  score += lengthScore;
  if (wordCount < minWordsForFullLength * 0.6) {
    feedback.push("Câu trả lời còn ngắn — hãy nói/viết chi tiết hơn.");
  }

  const sentenceScore = Math.min(20, sentenceCount * 5);
  score += sentenceScore;
  if (sentenceCount < 2) {
    feedback.push("Hãy chia ý thành nhiều câu rõ ràng hơn.");
  }

  const diversityScore = Math.min(20, lexicalDiversity * 28);
  score += diversityScore;
  if (lexicalDiversity < 0.55) {
    feedback.push("Hãy dùng từ vựng đa dạng hơn, tránh lặp lại cùng một từ nhiều lần.");
  }

  const connectorScore = Math.min(20, connectorHits * 10);
  score += connectorScore;
  if (connectorHits === 0) {
    feedback.push("Hãy thử dùng từ nối (because, however, for example...) để câu trả lời mạch lạc hơn.");
  }

  score = Math.round(Math.min(100, score));

  let band: TextScoreResult["band"];
  if (score < 25) band = "Chưa đạt";
  else if (score < 45) band = "A2";
  else if (score < 65) band = "B1";
  else if (score < 82) band = "B2";
  else band = "C1+";

  if (feedback.length === 0) {
    feedback.push("Câu trả lời rõ ràng, đủ ý và có từ vựng đa dạng.");
  }

  return { score, band, feedback };
}
