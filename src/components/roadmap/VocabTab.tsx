import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, Shuffle, Volume2, X } from "lucide-react";
import { normalizeText, speak } from "../../lib/speech";
import { shuffle } from "../../lib/array";
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
  const [flipped, setFlipped] = useState(false);

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
    setFlipped(false);
    setIndex((prev) => (filteredIds.length ? (prev + 1) % filteredIds.length : 0));
  }

  function handleFilterChange(next: { query?: string; onlyUnknown?: boolean }) {
    if (next.query !== undefined) setQuery(next.query);
    if (next.onlyUnknown !== undefined) setOnlyUnknown(next.onlyUnknown);
    setIndex(0);
    setFlipped(false);
  }

  function handleShuffle() {
    setOrder(shuffle(words.map((w) => w.id)));
    setIndex(0);
    setFlipped(false);
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
          <div className="perspective mx-auto h-64 w-full max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentWord.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="preserve-3d relative h-full w-full cursor-pointer"
                onClick={() => setFlipped((f) => !f)}
              >
                <motion.div
                  className="preserve-3d relative h-full w-full"
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="backface-hidden absolute flex h-full w-full flex-col items-center justify-center gap-2 rounded-3xl border border-brand-100 bg-white p-6 text-center shadow-xl shadow-brand-900/5">
                    {isKnown && (
                      <span className="absolute right-4 top-4 rounded-full bg-brand-100 p-1.5 text-brand-600">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                    <h3 className="font-display text-4xl font-bold text-brand-900">{currentWord.word}</h3>
                    {currentWord.ipa && <p className="text-brand-900/50">{currentWord.ipa}</p>}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(currentWord.word);
                      }}
                      className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Nghe phát âm
                    </button>
                    <p className="mt-4 text-xs text-brand-900/40">Bấm để xem nghĩa</p>
                  </div>

                  <div className="backface-hidden rotate-y-180 absolute flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border border-brand-200 bg-brand-500 p-6 text-center text-white shadow-xl">
                    <h3 className="font-display text-3xl font-bold">{currentWord.meaning}</h3>
                    {currentWord.example && (
                      <>
                        <p className="text-white/90">"{currentWord.example}"</p>
                        {currentWord.exampleMeaning && (
                          <p className="text-sm text-white/70">{currentWord.exampleMeaning}</p>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                onToggleKnown(currentWord.id, false);
                goToNext();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-100"
            >
              <X className="h-4 w-4" />
              Cần ôn lại
            </button>
            <button
              onClick={() => {
                onToggleKnown(currentWord.id, true);
                goToNext();
              }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 font-semibold text-white transition hover:bg-brand-600"
            >
              <Check className="h-4 w-4" />
              Đã thuộc
            </button>
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
