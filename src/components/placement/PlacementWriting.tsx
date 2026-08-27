import { useState } from "react";
import { PenLine } from "lucide-react";

const MIN_WORDS = 20;
const PROMPT =
  "Write a short paragraph about yourself: your name, what you do (work or study), and why you are learning English.";

interface PlacementWritingProps {
  onComplete: (answer: string) => void;
}

export default function PlacementWriting({ onComplete }: PlacementWritingProps) {
  const [answer, setAnswer] = useState("");

  const wordCount = answer.trim().length ? answer.trim().split(/\s+/).length : 0;
  const canContinue = wordCount >= MIN_WORDS;

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
          rows={6}
          placeholder="Write your answer in English here..."
          className="w-full resize-none rounded-2xl border border-brand-100 p-4 text-sm outline-none focus:border-brand-400"
        />
        <div className="mt-3 flex items-center justify-between text-sm text-brand-900/50">
          <span>
            {wordCount}/{MIN_WORDS} từ tối thiểu
          </span>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => onComplete(answer)}
            disabled={!canContinue}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </section>
  );
}
