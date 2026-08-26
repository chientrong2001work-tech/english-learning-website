import { useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { normalizeText } from "../../lib/speech";
import { sample } from "../../lib/array";
import type { LevelVocabWord } from "../../types";

const PROMPT_COUNT = 3;
const MIN_WORDS = 3;

interface WritingTabProps {
  words: LevelVocabWord[];
  onComplete: (percent: number) => void;
}

export default function WritingTab({ words, onComplete }: WritingTabProps) {
  const [prompts, setPrompts] = useState<LevelVocabWord[]>(() =>
    sample(words, Math.min(PROMPT_COUNT, words.length)),
  );
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function checkAnswer(word: LevelVocabWord) {
    const answer = answers[word.id] ?? "";
    const normalized = normalizeText(answer);
    const wordCount = normalized.length ? normalized.split(" ").length : 0;
    const containsTarget = normalized.includes(normalizeText(word.word));
    return containsTarget && wordCount >= MIN_WORDS;
  }

  function submit() {
    setSubmitted(true);
    const passedCount = prompts.filter((word) => checkAnswer(word)).length;
    onComplete(Math.round((passedCount / prompts.length) * 100));
  }

  function restart() {
    setPrompts(sample(words, Math.min(PROMPT_COUNT, words.length)));
    setAnswers({});
    setSubmitted(false);
  }

  const allFilled = prompts.every((word) => (answers[word.id] ?? "").trim().length > 0);
  const passedCount = prompts.filter((word) => checkAnswer(word)).length;

  if (words.length === 0) {
    return <p className="text-sm text-brand-900/60">Chưa có từ vựng cho cấp độ này.</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <p className="text-center text-sm text-brand-900/60">
        Viết một câu tiếng Anh hoàn chỉnh (tối thiểu {MIN_WORDS} từ) có sử dụng từ được cho. Hệ thống kiểm tra đơn
        giản: câu phải chứa đúng từ mục tiêu và đủ độ dài.
      </p>

      {prompts.map((word) => {
        const passed = submitted ? checkAnswer(word) : null;
        return (
          <div key={word.id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <p className="mb-2 font-semibold text-brand-900">
              Dùng từ: <span className="text-brand-600">{word.word}</span>{" "}
              <span className="font-normal text-brand-900/40">({word.meaning})</span>
            </p>
            <textarea
              value={answers[word.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [word.id]: e.target.value }))}
              disabled={submitted}
              rows={2}
              placeholder={`Viết một câu có từ "${word.word}"...`}
              className="w-full resize-none rounded-xl border border-brand-100 p-3 text-sm outline-none focus:border-brand-400 disabled:bg-brand-50/50"
            />
            {submitted && (
              <p className={`mt-2 flex items-center gap-1.5 text-sm font-semibold ${passed ? "text-brand-600" : "text-red-500"}`}>
                {passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {passed ? "Đạt yêu cầu" : `Câu cần chứa từ "${word.word}" và có ít nhất ${MIN_WORDS} từ.`}
              </p>
            )}
          </div>
        );
      })}

      {!submitted ? (
        <button
          onClick={submit}
          disabled={!allFilled}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Nộp bài
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <h4 className="font-display text-xl font-bold text-brand-900">
            Kết quả: {passedCount}/{prompts.length} ({Math.round((passedCount / prompts.length) * 100)}%)
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
