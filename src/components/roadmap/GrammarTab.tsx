import { useState } from "react";
import { BookText, Check, RotateCcw, X } from "lucide-react";
import { sample } from "../../lib/array";
import { levelGrammar } from "../../data/levelGrammar";
import { levelGrammarQuiz } from "../../data/levelGrammarQuiz";
import type { CEFRLevel } from "../../types";

interface GrammarTabProps {
  level: CEFRLevel;
  onComplete: (percent: number) => void;
}

const QUESTIONS_PER_ROUND = 8;

// Grammar content for the level (cards, same info the old standalone
// "Ngữ pháp" homepage section used to show) followed by a repeatable
// fill-in-the-blank quiz over that same content — same submit/score pattern
// as ReadingTab/ListeningTab, so a grammar score contributes to the level's
// skillsPassed like every other skill.
export default function GrammarTab({ level, onComplete }: GrammarTabProps) {
  const points = levelGrammar[level];
  const pool = levelGrammarQuiz[level];
  const [questions, setQuestions] = useState(() => sample(pool, Math.min(QUESTIONS_PER_ROUND, pool.length)));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(questionId: string, option: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  }

  function submit() {
    setSubmitted(true);
    const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
    onComplete(Math.round((correctCount / questions.length) * 100));
  }

  function restart() {
    setQuestions(sample(pool, Math.min(QUESTIONS_PER_ROUND, pool.length)));
    setAnswers({});
    setSubmitted(false);
  }

  const correctCount = questions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h3 className="mb-4 text-center font-display text-xl font-bold text-brand-900">
          Ngữ pháp cấp {level}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {points.map((point) => (
            <div
              key={point.id}
              className="rounded-2xl border border-brand-100 bg-white p-5 shadow-sm shadow-brand-900/5"
            >
              <div className="mb-2 inline-flex rounded-xl bg-brand-50 p-2 text-brand-600">
                <BookText className="h-4 w-4" />
              </div>
              <h4 className="font-display text-base font-bold text-brand-900">{point.title}</h4>
              <p className="mt-1 text-sm text-brand-900/60">{point.summary}</p>
              <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 font-mono text-xs text-brand-700">
                {point.structure}
              </p>
              <p className="mt-3 text-sm italic text-brand-900/50">{point.example}</p>
              <p className="mt-1 text-xs text-brand-900/40">{point.exampleMeaning}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="text-center font-display text-xl font-bold text-brand-900">Kiểm tra ngữ pháp</h3>
        {questions.map((q, idx) => (
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

        {!submitted ? (
          <div className="text-center">
            <button
              onClick={submit}
              disabled={!allAnswered}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nộp bài
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center">
            <h4 className="font-display text-xl font-bold text-brand-900">
              Kết quả: {correctCount}/{questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
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
    </div>
  );
}
