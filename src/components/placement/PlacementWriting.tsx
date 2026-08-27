import { useState } from "react";
import { Check, PenLine, RotateCcw } from "lucide-react";
import { scoreEnglishResponse } from "../../lib/textScoring";

const MIN_WORDS_TO_SUBMIT = 15;
const MIN_WORDS_FOR_FULL_SCORE = 60;
const PROMPT =
  "Write a short paragraph about yourself: your name, what you do (work or study), and why you are learning English.";

export interface WritingResult {
  answer: string;
  score: number;
  band: string;
  feedback: string[];
}

interface PlacementWritingProps {
  onComplete: (result: WritingResult) => void;
}

export default function PlacementWriting({ onComplete }: PlacementWritingProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<WritingResult | null>(null);

  const wordCount = answer.trim().length ? answer.trim().split(/\s+/).length : 0;
  const canSubmit = wordCount >= MIN_WORDS_TO_SUBMIT;

  function submit() {
    const scored = scoreEnglishResponse(answer, {
      promptText: PROMPT,
      minWordsForFullLength: MIN_WORDS_FOR_FULL_SCORE,
      keywordGroups: [
        ["my name", "i am", "i'm", "call me"],
        ["work", "job", "study", "studying", "student", "university", "college", "school"],
        ["learning english", "learn english", "study english", "improve my english", "improve english", "my english"],
      ],
    });
    setResult({ answer, ...scored });
  }

  function rewrite() {
    setResult(null);
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-6 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-500">
          <PenLine className="h-4 w-4" />
          Phần 3: Viết
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-900">Viết một đoạn ngắn bằng tiếng Anh</h2>
      </div>

      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
        <p className="mb-4 text-center font-medium text-brand-900">{PROMPT}</p>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={result !== null}
          rows={6}
          placeholder="Write your answer in English here..."
          className="w-full resize-none rounded-2xl border border-brand-100 p-4 text-sm outline-none focus:border-brand-400 disabled:bg-brand-50/50"
        />
        <div className="mt-3 flex items-center justify-between text-sm text-brand-900/50">
          <span>
            {wordCount}/{MIN_WORDS_TO_SUBMIT} từ tối thiểu để nộp bài
          </span>
        </div>

        {!result ? (
          <div className="mt-6 flex justify-center">
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nộp bài & chấm điểm
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl bg-brand-50 p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-xl font-bold text-brand-900">
                Điểm: {result.score}/100 · Mức: {result.band}
              </p>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm text-brand-900/70">
              {result.feedback.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-brand-900/40">
              Chấm điểm tự động dựa trên độ dài, số câu, độ đa dạng từ vựng và từ nối — không thay thế giám khảo
              thật.
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={rewrite}
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                <RotateCcw className="h-4 w-4" />
                Viết lại
              </button>
              <button
                onClick={() => onComplete(result)}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
