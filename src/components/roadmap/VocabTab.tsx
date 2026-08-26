import { useMemo, useState } from "react";
import { Check, Search, Volume2 } from "lucide-react";
import { normalizeText, speak } from "../../lib/speech";
import type { LevelVocabWord } from "../../types";

const PAGE_SIZE = 40;

interface VocabTabProps {
  words: LevelVocabWord[];
  knownIds: string[];
  onToggleKnown: (id: string, known: boolean) => void;
}

export default function VocabTab({ words, knownIds, onToggleKnown }: VocabTabProps) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [onlyUnknown, setOnlyUnknown] = useState(false);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    return words.filter((word) => {
      if (onlyUnknown && knownIds.includes(word.id)) return false;
      if (!q) return true;
      return normalizeText(word.word).includes(q) || normalizeText(word.meaning).includes(q);
    });
  }, [words, query, onlyUnknown, knownIds]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/30" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder="Tìm từ hoặc nghĩa..."
            className="w-full rounded-full border border-brand-100 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-400"
          />
        </div>
        <label className="inline-flex shrink-0 items-center gap-2 text-sm text-brand-900/60">
          <input
            type="checkbox"
            checked={onlyUnknown}
            onChange={(e) => {
              setOnlyUnknown(e.target.checked);
              setVisibleCount(PAGE_SIZE);
            }}
            className="h-4 w-4 accent-brand-500"
          />
          Chỉ hiện từ chưa thuộc
        </label>
      </div>

      <p className="mb-3 text-xs text-brand-900/40">
        Hiển thị {Math.min(visible.length, filtered.length)}/{filtered.length} từ (tổng {words.length} từ ở cấp
        này)
      </p>

      <div className="space-y-3">
        {visible.map((word) => {
          const known = knownIds.includes(word.id);
          return (
            <div
              key={word.id}
              className={`flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                known ? "border-brand-300 bg-brand-50" : "border-brand-100 bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => speak(word.word)}
                  className="mt-1 rounded-full bg-brand-100 p-2 text-brand-600 hover:bg-brand-200"
                  aria-label={`Nghe phát âm ${word.word}`}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
                <div>
                  <p className="font-display text-lg font-bold text-brand-900">
                    {word.word}
                    {word.ipa && (
                      <span className="font-sans text-sm font-normal text-brand-900/40"> {word.ipa}</span>
                    )}
                  </p>
                  <p className="text-sm text-brand-900/70">{word.meaning}</p>
                  {word.example && (
                    <p className="mt-1 text-xs italic text-brand-900/40">
                      {word.example}
                      {word.exampleMeaning && <> — {word.exampleMeaning}</>}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => onToggleKnown(word.id, !known)}
                className={`inline-flex shrink-0 items-center gap-1.5 self-start rounded-full px-4 py-1.5 text-xs font-semibold transition sm:self-center ${
                  known
                    ? "bg-brand-500 text-white hover:bg-brand-600"
                    : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                {known ? "Đã thuộc" : "Đánh dấu đã thuộc"}
              </button>
            </div>
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-6 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Xem thêm ({filtered.length - visibleCount} từ)
          </button>
        </div>
      )}
    </div>
  );
}
