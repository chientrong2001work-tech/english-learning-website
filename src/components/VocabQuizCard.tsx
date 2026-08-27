import { useMemo, useState } from "react";
import { Check, Volume2 } from "lucide-react";
import { speak } from "../lib/speech";
import { sample, shuffle } from "../lib/array";

export interface QuizWord {
  id: string;
  word: string;
  meaning: string;
  ipa?: string;
  example?: string;
  exampleMeaning?: string;
}

interface VocabQuizCardProps {
  word: QuizWord;
  pool: QuizWord[];
  isKnown: boolean;
  onAnswered: (correct: boolean) => void;
  onNext: () => void;
}

// Replaces a self-reported "Đã thuộc" button with an actual recall check: the
// learner has to pick the word's meaning out of a few options before it gets
// marked known, so "known" reflects a real answer instead of a guess/click.
export default function VocabQuizCard({ word, pool, isKnown, onAnswered, onNext }: VocabQuizCardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const options = useMemo(() => {
    const decoyPool = pool.filter((w) => w.id !== word.id && w.meaning !== word.meaning);
    const decoys = sample(decoyPool, Math.min(3, decoyPool.length));
    return shuffle([word, ...decoys]);
  }, [word, pool]);

  const answered = selected !== null;
  const isCorrectPick = selected === word.id;

  function handlePick(optionId: string) {
    if (answered) return;
    setSelected(optionId);
    onAnswered(optionId === word.id);
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-3xl border border-brand-100 bg-white p-6 shadow-xl shadow-brand-900/5">
      <div className="relative flex flex-col items-center gap-2 text-center">
        {isKnown && (
          <span className="absolute right-0 top-0 rounded-full bg-brand-100 p-1.5 text-brand-600">
            <Check className="h-4 w-4" />
          </span>
        )}
        <h3 className="font-display text-4xl font-bold text-brand-900">{word.word}</h3>
        {word.ipa && <p className="text-brand-900/50">{word.ipa}</p>}
        <button
          onClick={() => speak(word.word)}
          className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100"
        >
          <Volume2 className="h-3.5 w-3.5" />
          Nghe phát âm
        </button>
      </div>

      <p className="mb-3 mt-6 text-center text-sm font-semibold text-brand-900/60">Chọn nghĩa đúng của từ này</p>
      <div className="space-y-2">
        {options.map((opt) => {
          const isThisCorrect = opt.id === word.id;
          const isPicked = opt.id === selected;
          let style = "border-brand-100 bg-white hover:border-brand-300";
          if (answered) {
            if (isThisCorrect) style = "border-green-400 bg-green-50 text-green-700";
            else if (isPicked) style = "border-red-300 bg-red-50 text-red-600";
            else style = "border-brand-100 bg-white opacity-50";
          }
          return (
            <button
              key={opt.id}
              onClick={() => handlePick(opt.id)}
              disabled={answered}
              className={`w-full rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${style}`}
            >
              {opt.meaning}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-4 text-center">
          <p className={`text-sm font-semibold ${isCorrectPick ? "text-green-600" : "text-red-500"}`}>
            {isCorrectPick ? "Chính xác! Đã đánh dấu Đã thuộc." : "Chưa đúng — đã đánh dấu Cần ôn lại."}
          </p>
          {word.example && (
            <div className="mt-3 rounded-xl bg-brand-50 p-3 text-left">
              <p className="text-sm italic text-brand-900/70">"{word.example}"</p>
              {word.exampleMeaning && <p className="mt-1 text-xs text-brand-900/50">{word.exampleMeaning}</p>}
            </div>
          )}
          <button
            onClick={onNext}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-2.5 font-semibold text-white transition hover:bg-brand-600"
          >
            Tiếp theo →
          </button>
        </div>
      )}
    </div>
  );
}
