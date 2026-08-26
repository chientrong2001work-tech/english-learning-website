import { Check, Volume2 } from "lucide-react";
import { speak } from "../../lib/speech";
import type { LevelVocabWord } from "../../types";

interface VocabTabProps {
  words: LevelVocabWord[];
  knownIds: string[];
  onToggleKnown: (id: string, known: boolean) => void;
}

export default function VocabTab({ words, knownIds, onToggleKnown }: VocabTabProps) {
  return (
    <div className="space-y-3">
      {words.map((word) => {
        const known = knownIds.includes(word.id);
        return (
          <div
            key={word.id}
            className={`flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
              known ? "border-brand-300 bg-brand-50" : "border-brand-100 bg-white"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                onClick={() => speak(word.word)}
                className="mt-1 rounded-full bg-brand-100 p-2 text-brand-600 hover:bg-brand-200"
                aria-label={`Nghe phát âm ${word.word}`}
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <div>
                <p className="font-display text-lg font-bold text-brand-900">
                  {word.word} <span className="font-sans text-sm font-normal text-brand-900/40">{word.ipa}</span>
                </p>
                <p className="text-sm text-brand-900/70">{word.meaning}</p>
                <p className="mt-1 text-xs italic text-brand-900/40">
                  {word.example} — {word.exampleMeaning}
                </p>
              </div>
            </div>

            <button
              onClick={() => onToggleKnown(word.id, !known)}
              className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-4 py-1.5 text-xs font-semibold transition sm:self-center ${
                known
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "bg-brand-50 text-brand-700 hover:bg-brand-100"
              }`}
            >
              <Check className="h-3.5 w-3.5" />
              {known ? "Đã thuộc" : "Đánh dấu đã thuộc"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
