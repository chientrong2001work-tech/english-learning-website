import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import type { ReadingTest } from "../../types";

interface ReadingTabProps {
  test: ReadingTest;
  onComplete: (percent: number) => void;
}

export default function ReadingTab({ test, onComplete }: ReadingTabProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(questionId: string, option: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function submit() {
    setSubmitted(true);
    const correctCount = test.questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    onComplete(Math.round((correctCount / test.questions.length) * 100));
  }

  function restart() {
    setAnswers({});
    setSubmitted(false);
  }

  const correctCount = test.questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const allAnswered = test.questions.every((q) => answers[q.id]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="rounded-2xl border border-brand-100 bg-white p-6">
        <h3 className="mb-3 font-display text-xl font-bold text-brand-900">{test.title}</h3>
        <p className="whitespace-pre-line leading-relaxed text-brand-900/70">{test.passage}</p>
      </div>

      <div className="space-y-5">
        {test.questions.map((q, idx) => (
          <div key={q.id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="mb-3 font-semibold text-brand-900">
              {idx + 1}. {q.question}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((option) => {
                const isSelected = answers[q.id] === option;
                const isCorrectOption = option === q.correctAnswer;
                const showState = submitted;
                return (
                  <button
                    key={option}
                    onClick={() => selectAnswer(q.id, option)}
                    disabled={submitted}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition ${
                      showState && isCorrectOption
                        ? "border-brand-400 bg-brand-50 text-brand-700"
                        : showState && isSelected
                          ? "border-red-300 bg-red-50 text-red-600"
                          : isSelected
                            ? "border-brand-400 bg-brand-50"
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
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={submit}
          disabled={!allAnswered}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Nộp bài
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <h4 className="font-display text-xl font-bold text-brand-900">
            Kết quả: {correctCount}/{test.questions.length} (
            {Math.round((correctCount / test.questions.length) * 100)}%)
          </h4>
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <RotateCcw className="h-4 w-4" />
            Làm lại
          </button>
        </div>
      )}
    </div>
  );
}
