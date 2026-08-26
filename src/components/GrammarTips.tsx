import { BookText } from "lucide-react";
import { grammarTips } from "../data/grammarTips";

export default function GrammarTips() {
  return (
    <section id="grammar" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold text-brand-900">
          Mẹo ngữ pháp cơ bản
        </h2>
        <p className="mt-2 text-brand-900/60">
          Ôn lại những cấu trúc ngữ pháp thường gặp nhất.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {grammarTips.map((tip) => (
          <div
            key={tip.id}
            className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm shadow-brand-900/5 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="mb-3 inline-flex rounded-xl bg-brand-50 p-2 text-brand-600">
              <BookText className="h-5 w-5" />
            </div>
            <h3 className="font-display text-lg font-bold text-brand-900">{tip.title}</h3>
            <p className="mt-1 text-sm text-brand-900/60">{tip.summary}</p>
            <p className="mt-3 rounded-lg bg-brand-50 px-3 py-2 font-mono text-xs text-brand-700">
              {tip.structure}
            </p>
            <p className="mt-3 text-sm italic text-brand-900/50">{tip.example}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
