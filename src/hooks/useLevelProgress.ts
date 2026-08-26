import { useLocalStorage } from "./useLocalStorage";
import { levels } from "../data/levels";
import { levelVocabulary } from "../data/levelVocabulary";
import type { CEFRLevel, LevelScoresMap, LevelSkillScores, LevelVocabWord, SkillId } from "../types";

export const VOCAB_REQUIRED_RATIO = 0.7;
export const SKILL_PASS_RATIO = 0.6;

function emptySkillScores(): LevelSkillScores {
  return { listening: null, speaking: null, reading: null, writing: null };
}

function createEmptyScores(): LevelScoresMap {
  return {
    A1: emptySkillScores(),
    A2: emptySkillScores(),
    B1: emptySkillScores(),
    B2: emptySkillScores(),
    C1: emptySkillScores(),
    C2: emptySkillScores(),
  };
}

export interface LevelProgress {
  level: CEFRLevel;
  words: LevelVocabWord[];
  knownCount: number;
  totalCount: number;
  vocabRatio: number;
  vocabMet: boolean;
  scores: LevelSkillScores;
  skillsPassed: Record<SkillId, boolean>;
  allSkillsPassed: boolean;
  levelPassed: boolean;
  unlocked: boolean;
}

export function useLevelProgress() {
  const [knownIds, setKnownIds] = useLocalStorage<string[]>("engup-known-words", []);
  const [levelScores, setLevelScores] = useLocalStorage<LevelScoresMap>(
    "engup-level-scores",
    createEmptyScores(),
  );

  function toggleKnown(id: string, known: boolean) {
    setKnownIds((prev) => {
      if (known) {
        return prev.includes(id) ? prev : [...prev, id];
      }
      return prev.filter((wordId) => wordId !== id);
    });
  }

  function recordScore(level: CEFRLevel, skill: SkillId, percent: number) {
    setLevelScores((prev) => {
      const current = prev[level] ?? emptySkillScores();
      const previousBest = current[skill];
      const nextBest = previousBest === null ? percent : Math.max(previousBest, percent);
      return {
        ...prev,
        [level]: { ...current, [skill]: nextBest },
      };
    });
  }

  const progress: LevelProgress[] = [];
  let previousPassed = true;

  for (const info of levels) {
    const words = levelVocabulary.filter((w) => w.level === info.id);
    const knownCount = words.filter((w) => knownIds.includes(w.id)).length;
    const totalCount = words.length;
    const vocabRatio = totalCount ? knownCount / totalCount : 0;
    const vocabMet = vocabRatio >= VOCAB_REQUIRED_RATIO;
    const scores = levelScores[info.id] ?? emptySkillScores();

    const skillsPassed: Record<SkillId, boolean> = {
      listening: (scores.listening ?? 0) >= SKILL_PASS_RATIO * 100,
      speaking: (scores.speaking ?? 0) >= SKILL_PASS_RATIO * 100,
      reading: (scores.reading ?? 0) >= SKILL_PASS_RATIO * 100,
      writing: (scores.writing ?? 0) >= SKILL_PASS_RATIO * 100,
    };
    const allSkillsPassed = Object.values(skillsPassed).every(Boolean);
    const levelPassed = vocabMet && allSkillsPassed;
    const unlocked = previousPassed;

    progress.push({
      level: info.id,
      words,
      knownCount,
      totalCount,
      vocabRatio,
      vocabMet,
      scores,
      skillsPassed,
      allSkillsPassed,
      levelPassed,
      unlocked,
    });

    previousPassed = levelPassed;
  }

  return { knownIds, toggleKnown, recordScore, progress };
}
