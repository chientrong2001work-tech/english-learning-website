export type CategoryId = "everyday" | "travel" | "work" | "food";

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
}

export interface GrammarTip {
  id: string;
  title: string;
  summary: string;
  structure: string;
  example: string;
}
