import { useMemo, useState } from "react";
import { Award, Check, RotateCcw, X } from "lucide-react";
import { vocabulary } from "../data/vocabulary";
import { useLocalStorage } from "../hooks/useLocalStorage";
import type { VocabWord } from "../types";

const QUESTIONS_PER_ROUND = 10;

interface Question {
  word: VocabWord;
  options: string[];
  correctAnswer: string;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(): Question[] {
  const pool = shuffle(vocabulary).slice(0, QUESTIONS_PER_ROUND);
  return pool.map((word) => {
    const distractors = shuffle(
      vocabulary.filter((w) => w.id !== word.id && w.meaning !== word.meaning),
    )
      .slice(0, 3)
      .map((w) => w.meaning);
    return {
      word,
      options: shuffle([word.meaning, ...distractors]),
      correctAnswer: word.meaning,
    };
  });
}

export default function Quiz() {
  const [questions, setQuestions] = useState<Question[]>(() => buildQuestions());
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [bestScore, setBestScore] = useLocalStorage<number>("engup-quiz-best", 0);

  const question = questions[current];
  const progress = useMemo(
    () => Math.round(((current + (finished ? 1 : 0)) / questions.length) * 100),
    [current, finished, questions.length],
  );

  function handleAnswer(option: string) {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === question.correctAnswer;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(nextScore);

    window.setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        setFinished(true);
        if (nextScore > bestScore) setBestScore(nextScore);
      }
    }, 700);
  }

  function restart() {
    setQuestions(buildQuestions());
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  return (
    <section id="quiz" className="bg-brand-50/60 py-20">
      <div className="mx-auto max-w-2xl px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold text-brand-900">
            Luyện tập với Quiz
          </h2>
          <p className="mt-2 text-brand-900/60">
            Chọn nghĩa tiếng Việt đúng của từ tiếng Anh trong {QUESTIONS_PER_ROUND} câu hỏi.
          </p>
        </div>

        <div className="rounded-3xl border border-brand-100 bg-white p-8 shadow-lg shadow-brand-900/5">
          {!finished ? (
            <>
              <div className="mb-6 flex items-center justify-between text-sm font-semibold text-brand-900/50">
                <span>
                  Câu {current + 1} / {questions.length}
                </span>
                <span>Điểm: {score}</span>
              </div>

              <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-brand-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="mb-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
                  Từ này nghĩa là gì?
                </p>
                <h3 className="mt-2 font-display text-4xl font-bold text-brand-900">
                  {question.word.word}
                </h3>
                <p className="text-brand-900/40">{question.word.ipa}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {question.options.map((option) => {
                  const isSelected = selected === option;
                  const isCorrectOption = option === question.correctAnswer;
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
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <span className="rounded-full bg-brand-100 p-4 text-brand-600">
                <Award className="h-10 w-10" />
              </span>
              <h3 className="font-display text-2xl font-bold text-brand-900">
                Bạn đạt {score}/{questions.length} điểm!
              </h3>
              <p className="text-brand-900/60">
                Điểm cao nhất của bạn: <span className="font-semibold text-brand-600">{bestScore}/{questions.length}</span>
              </p>
              <button
                onClick={restart}
                className="mt-2 inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
              >
                <RotateCcw className="h-4 w-4" />
                Làm lại
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
