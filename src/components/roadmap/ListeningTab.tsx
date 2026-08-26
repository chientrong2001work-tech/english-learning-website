import { useMemo, useState } from "react";
import { Check, RotateCcw, Volume2, X } from "lucide-react";
import { speak } from "../../lib/speech";
import { sample, shuffle } from "../../lib/array";
import { levelVocabulary } from "../../data/levelVocabulary";
import type { LevelVocabWord } from "../../types";

const QUESTION_COUNT = 5;

interface ListeningQuestion {
  word: LevelVocabWord;
  options: string[];
}

function buildQuestions(words: LevelVocabWord[]): ListeningQuestion[] {
  const picked = sample(words, Math.min(QUESTION_COUNT, words.length));
  return picked.map((word) => {
    const distractorPool = (words.length > 4 ? words : levelVocabulary).filter(
      (w) => w.id !== word.id && w.meaning !== word.meaning,
    );
    const distractors = sample(distractorPool, 3).map((w) => w.meaning);
    return { word, options: shuffle([word.meaning, ...distractors]) };
  });
}

interface ListeningTabProps {
  words: LevelVocabWord[];
  onComplete: (percent: number) => void;
}

export default function ListeningTab({ words, onComplete }: ListeningTabProps) {
  const [questions, setQuestions] = useState<ListeningQuestion[]>(() => buildQuestions(words));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const question = questions[current];
  const progress = useMemo(
    () => Math.round(((current + (finished ? 1 : 0)) / questions.length) * 100),
    [current, finished, questions.length],
  );

  function handleAnswer(option: string) {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === question.word.meaning;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(nextScore);

    window.setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
      } else {
        setFinished(true);
        onComplete(Math.round((nextScore / questions.length) * 100));
      }
    }, 600);
  }

  function restart() {
    setQuestions(buildQuestions(words));
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  }

  if (words.length === 0) {
    return <p className="text-sm text-brand-900/60">Chưa có từ vựng cho cấp độ này.</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      {!finished ? (
        <>
          <div className="mb-4 flex items-center justify-between text-sm font-semibold text-brand-900/50">
            <span>Câu {current + 1} / {questions.length}</span>
            <span>Điểm: {score}</span>
          </div>
          <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-brand-100">
            <div className="h-full rounded-full bg-brand-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>

          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Nghe và chọn nghĩa đúng</p>
            <button
              onClick={() => speak(question.word.word)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              <Volume2 className="h-5 w-5" />
              Nghe từ
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const isSelected = selected === option;
              const isCorrectOption = option === question.word.meaning;
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
          <h3 className="font-display text-2xl font-bold text-brand-900">
            Kết quả: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
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
