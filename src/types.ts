// Primary part of speech shown next to a word. WordNet only tags open-class
// content words (noun/verb/adjective/adverb); the rest were hand-curated
// since WordNet doesn't cover closed-class function words at all.
export type PosCode =
  | "n"
  | "v"
  | "adj"
  | "adv"
  | "prep"
  | "conj"
  | "pron"
  | "det"
  | "art"
  | "num"
  | "interj"
  | "phr"
  | "phrv";

export type CategoryId =
  | "everyday"
  | "travel"
  | "work"
  | "food"
  | "family"
  | "shopping"
  | "health"
  | "technology";

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
}

export interface VocabWord {
  id: string;
  category: CategoryId;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
  emoji?: string;
  pos?: PosCode;
}

export interface GrammarTip {
  id: string;
  title: string;
  summary: string;
  structure: string;
  example: string;
}

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface LevelInfo {
  id: CEFRLevel;
  label: string;
  description: string;
}

export interface LevelVocabWord {
  id: string;
  level: CEFRLevel;
  word: string;
  ipa?: string;
  meaning: string;
  example?: string;
  exampleMeaning?: string;
  emoji?: string;
  pos?: PosCode;
}

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ReadingTest {
  level: CEFRLevel;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
}

export type SkillId = "listening" | "speaking" | "reading" | "writing";

export interface LevelSkillScores {
  listening: number | null;
  speaking: number | null;
  reading: number | null;
  writing: number | null;
}

export type LevelScoresMap = Record<CEFRLevel, LevelSkillScores>;
