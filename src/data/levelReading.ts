import type { CEFRLevel, ReadingTest } from "../types";
import { readingTests } from "./readingTests";
import { placementReadingVariantB } from "./placementReadingExtra";
import { levelReadingVariantC } from "./levelReadingVariantC";

// A per-level pool of reading passages for the roadmap's repeatable Reading
// practice tab, combining the original passage (readingTests.ts), the
// placement test's second variant (placementReadingExtra.ts — reused here,
// not just for placement), and a third passage authored for this pool
// (levelReadingVariantC.ts). Each "Làm lại" samples one at random, so a
// retake usually shows a different passage instead of the same one every time.
export const levelReading: Record<CEFRLevel, ReadingTest[]> = (() => {
  const byLevel: Record<CEFRLevel, ReadingTest[]> = { A1: [], A2: [], B1: [], B2: [], C1: [], C2: [] };
  for (const test of readingTests) {
    byLevel[test.level].push(test);
  }
  for (const level of Object.keys(placementReadingVariantB) as CEFRLevel[]) {
    byLevel[level].push(placementReadingVariantB[level]);
  }
  for (const level of Object.keys(levelReadingVariantC) as CEFRLevel[]) {
    byLevel[level].push(levelReadingVariantC[level]);
  }
  return byLevel;
})();
