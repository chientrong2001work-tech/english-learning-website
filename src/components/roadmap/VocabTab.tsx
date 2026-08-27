import { useMemo, useState } from "react";
import { Search, Shuffle } from "lucide-react";
import { normalizeText } from "../../lib/speech";
import { shuffle } from "../../lib/array";
import VocabQuizCard from "../VocabQuizCard";
import type { LevelVocabWord } from "../../types";

interface VocabTabProps {
  words: LevelVocabWord[];
  knownIds: string[];
  onToggleKnown: (id: string, known: boolean) => void;
}

export default function VocabTab({ words, knownIds, onToggleKnown }: VocabTabProps) {
  const [query, setQuery] = useState("");
  const [onlyUnknown, setOnlyUnknown] = useState(false);
  const [order, setOrder] = useState<string[]>(() => shuffle(words.map((w) => w.id)));
  const [index, setIndex] = useState(0);

  const wordById = useMemo(() => new Map(words.map((w) => [w.id, w])), [words]);

  const filteredIds = useMemo(() => {
    const q = normalizeText(query);
    return order.filter((id) => {
      const word = wordById.get(id);
      if (!word) return false;
      if (onlyUnknown && knownIds.includes(id)) return false;
      if (!q) return true;
      return normalizeText(word.word).includes(q) || normalizeText(word.meaning).includes(q);
    });
  }, [order, wordById, onlyUnknown, knownIds, query]);

  const currentId = filteredIds[index % filteredIds.length];
  const currentWord = currentId ? wordById.get(currentId) : undefined;
  const isKnown = currentWord ? knownIds.includes(currentWord.id) : false;

  function goToNext() {
    setIndex((prev) => (filteredIds.length ? (prev + 1) % filteredIds.length : 0));
  }

  function handleFilterChange(next: { query?: string; onlyUnknown?: boolean }) {
    if (next.query !== undefined) setQuery(next.query);
    if (next.onlyUnknown !== undefined) setOnlyUnknown(next.onlyUnknown);
    setIndex(0);
  }

  function handleShuffle() {
    setOrder(shuffle(words.map((w) => w.id)));
    setIndex(0);
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-900/30" />
          <input
            value={query}
            onChange={(e) => handleFilterChange({ query: e.target.value })}
            placeholder="Tìm từ hoặc nghĩa để nhảy đến..."
            className="w-full rounded-full border border-brand-100 py-2 pl-9 pr-4 text-sm outline-none focus:border-brand-400"
          />
        </div>
        <label className="inline-flex shrink-0 items-center gap-2 text-sm text-brand-900/60">
          <input
            type="checkbox"
            checked={onlyUnknown}
            onChange={(e) => handleFilterChange({ onlyUnknown: e.target.checked })}
            className="h-4 w-4 accent-brand-500"
          />
          Chỉ học từ chưa thuộc
        </label>
      </div>

      {!currentWord ? (
        <p className="py-10 text-center text-sm text-brand-900/50">
          Không có từ nào khớp với bộ lọc hiện tại.
        </p>
      ) : (
        <>
          <VocabQuizCard
            key={currentWord.id}
            word={currentWord}
            pool={words}
            isKnown={isKnown}
            onAnswered={(correct) => onToggleKnown(currentWord.id, correct)}
            onNext={goToNext}
          />

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleShuffle}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              <Shuffle className="h-4 w-4" />
              Xáo trộn
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-brand-900/40">
            Thẻ {(index % filteredIds.length) + 1}/{filteredIds.length}
            {filteredIds.length !== words.length && ` (lọc từ ${words.length} từ)`}
          </p>
        </>
      )}
    </div>
  );
}
