import { useState } from "react";
import { Check, RotateCcw, Volume2, X } from "lucide-react";
import { normalizeText, speakDialogue, stopSpeech } from "../../lib/speech";
import { sample } from "../../lib/array";
import { levelListening, type LevelListeningItem } from "../../data/levelListening";
import type { CEFRLevel } from "../../types";

const QUESTIONS_PER_ATTEMPT = 4;

interface ListeningTabProps {
  level: CEFRLevel;
  onComplete: (percent: number) => void;
}

// Same format as the placement test's Listening section: listen to a short
// two-person dialogue, then answer a comprehension question about it. Draws
// from a larger per-level pool (levelListening) and samples a random subset
// each attempt, so a "Làm lại" shows genuinely different dialogues, not just
// the same fixed set reordered.
export default function ListeningTab({ level, onComplete }: ListeningTabProps) {
  const pool = levelListening[level];
  const [items, setItems] = useState<LevelListeningItem[]>(() =>
    sample(pool, Math.min(QUESTIONS_PER_ATTEMPT, pool.length)),
  );
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [textAnswerFeedback, setTextAnswerFeedback] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  if (pool.length === 0) {
    return <p className="text-sm text-brand-900/60">Chưa có bài nghe cho cấp độ này.</p>;
  }

  const item = items[current];
  const progress = Math.round(((current + (finished ? 1 : 0)) / items.length) * 100);
  const isTextAnswer = selected !== null && !item.options.includes(selected);

  function submitAnswer(isCorrect: boolean, chosenLabel: string) {
    if (selected) return;
    setSelected(chosenLabel);
    stopSpeech();
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(nextScore);

    window.setTimeout(() => {
      if (current + 1 < items.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setTextAnswer("");
        setTextAnswerFeedback(null);
      } else {
        setFinished(true);
        onComplete(Math.round((nextScore / items.length) * 100));
      }
    }, 600);
  }

  function handleAnswer(option: string) {
    submitAnswer(option === item.correctAnswer, option);
  }

  function handleTextSubmit() {
    if (selected || !textAnswer.trim()) return;
    const normalized = normalizeText(textAnswer);
    const isCorrect = item.acceptedTextAnswers.some((a) => normalized.includes(normalizeText(a)));
    setTextAnswerFeedback(isCorrect);
    submitAnswer(isCorrect, textAnswer.trim());
  }

  function restart() {
    setItems(sample(pool, Math.min(QUESTIONS_PER_ATTEMPT, pool.length)));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setTextAnswer("");
    setTextAnswerFeedback(null);
    setFinished(false);
  }

  return (
    <div className="mx-auto max-w-xl">
      {!finished ? (
        <>
          <div className="mb-4 flex items-center justify-between text-sm font-semibold text-brand-900/50">
            <span>
              Câu {current + 1} / {items.length}
            </span>
            <span>Điểm: {score}</span>
          </div>
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
            <div className="mb-5 flex justify-center">
              <button
                onClick={() => speakDialogue(item.dialogue)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
              >
                <Volume2 className="h-5 w-5" />
                Nghe hội thoại
              </button>
            </div>

            <p className="mb-5 text-center font-display text-xl font-bold text-brand-900">{item.question}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              {item.options.map((option) => {
                const isSelected = selected === option;
                const isCorrectOption = option === item.correctAnswer;
                const showState = selected !== null;
                return (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    disabled={selected !== null}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left font-medium transition ${
                      showState && isCorrectOption
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : showState && isSelected
                          ? "border-red-300 bg-red-50 text-red-600"
                          : "border-brand-100 hover:border-brand-300 hover:bg-brand-50"
                    }`}
                  >
                    {option}
                    {showState && isCorrectOption && <Check className="h-4 w-4" />}
                    {showState && isSelected && !isCorrectOption && <X className="h-4 w-4" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 border-t border-brand-50 pt-4">
              <p className="mb-2 text-center text-xs text-brand-900/40">Hoặc gõ câu trả lời của bạn</p>
              <div className="flex gap-2">
                <input
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  disabled={selected !== null}
                  placeholder="Type your answer..."
                  className="flex-1 rounded-full border border-brand-100 px-4 py-2 text-sm outline-none focus:border-brand-400 disabled:bg-brand-50/50"
                />
                <button
                  onClick={handleTextSubmit}
                  disabled={selected !== null || !textAnswer.trim()}
                  className="shrink-0 rounded-full bg-brand-100 px-5 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trả lời
                </button>
              </div>
              {isTextAnswer && textAnswerFeedback !== null && (
                <p
                  className={`mt-2 text-center text-sm font-semibold ${textAnswerFeedback ? "text-brand-600" : "text-red-500"}`}
                >
                  {textAnswerFeedback ? "Chính xác!" : `Chưa đúng — đáp án: ${item.correctAnswer}`}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <h3 className="font-display text-2xl font-bold text-brand-900">
            Kết quả: {score}/{items.length} ({Math.round((score / items.length) * 100)}%)
          </h3>
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            <RotateCcw className="h-4 w-4" />
            Làm lại
          </button>
        </div>
      )}
    </div>
  );
}
