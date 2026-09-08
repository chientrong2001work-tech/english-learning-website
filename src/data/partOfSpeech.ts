import type { PosCode } from "../types";

interface PosLabel {
  vi: string;
  en: string;
  abbr: string;
}

export const POS_LABELS: Record<PosCode, PosLabel> = {
  n: { vi: "Danh từ", en: "Noun", abbr: "n" },
  v: { vi: "Động từ", en: "Verb", abbr: "v" },
  adj: { vi: "Tính từ", en: "Adjective", abbr: "adj" },
  adv: { vi: "Trạng từ", en: "Adverb", abbr: "adv" },
  prep: { vi: "Giới từ", en: "Preposition", abbr: "prep" },
  conj: { vi: "Liên từ", en: "Conjunction", abbr: "conj" },
  pron: { vi: "Đại từ", en: "Pronoun", abbr: "pron" },
  det: { vi: "Từ hạn định", en: "Determiner", abbr: "det" },
  art: { vi: "Mạo từ", en: "Article", abbr: "art" },
  num: { vi: "Số từ", en: "Numeral", abbr: "num" },
  interj: { vi: "Thán từ", en: "Interjection", abbr: "interj" },
  phr: { vi: "Cụm từ", en: "Phrase", abbr: "phr" },
  phrv: { vi: "Cụm động từ", en: "Phrasal verb", abbr: "phr.v" },
};

// e.g. "Động từ (Verb, v.)" — Vietnamese term, English term, and the
// abbreviation together, per how the site displays a word's part of speech.
export function formatPos(code: PosCode): string {
  const label = POS_LABELS[code];
  return `${label.vi} (${label.en}, ${label.abbr}.)`;
}
