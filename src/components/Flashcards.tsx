import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, RotateCcw, Shuffle, Volume2, X } from "lucide-react";
import { categories } from "../data/categories";
import { vocabulary } from "../data/vocabulary";
import type { CategoryId } from "../types";

interface FlashcardsProps {
  knownIds: string[];
  onToggleKnown: (id: string, known: boolean) => void;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Flashcards({ knownIds, onToggleKnown }: FlashcardsProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [order, setOrder] = useState<string[]>(() => shuffle(vocabulary.map((w) => w.id)));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const filteredIds = useMemo(() => {
    return order.filter((id) => {
      if (activeCategory === "all") return true;
      const word = vocabulary.find((w) => w.id === id);
      return word?.category === activeCategory;
    });
  }, [order, activeCategory]);

  const currentId = filteredIds[index % filteredIds.length];
  const currentWord = vocabulary.find((w) => w.id === currentId);
  const isKnown = currentWord ? knownIds.includes(currentWord.id) : false;

  function goToNext() {
    setFlipped(false);
    setIndex((prev) => (prev + 1) % filteredIds.length);
  }

  function handleCategoryChange(category: CategoryId | "all") {
    setActiveCategory(category);
    setIndex(0);
    setFlipped(false);
  }

  function handleShuffle() {
    setOrder(shuffle(vocabulary.map((w) => w.id)));
    setIndex(0);
    setFlipped(false);
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  if (!currentWord) return null;

  return (
    <section id="flashcards" className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold text-brand-900">
          Flashcard từ vựng
        </h2>
        <p className="mt-2 text-brand-900/60">
          Bấm vào thẻ để xem nghĩa, rồi đánh dấu bạn đã thuộc từ đó chưa.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={() => handleCategoryChange("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
            activeCategory === "all"
              ? "bg-brand-500 text-white"
              : "bg-brand-50 text-brand-700 hover:bg-brand-100"
          }`}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              activeCategory === cat.id
                ? "bg-brand-500 text-white"
                : "bg-brand-50 text-brand-700 hover:bg-brand-100"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="perspective mx-auto h-72 w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="preserve-3d relative h-full w-full cursor-pointer"
            onClick={() => setFlipped((f) => !f)}
          >
            <motion.div
              className="preserve-3d relative h-full w-full"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Front */}
              <div className="backface-hidden absolute flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border border-brand-100 bg-white p-8 text-center shadow-xl shadow-brand-900/5">
                {isKnown && (
                  <span className="absolute right-4 top-4 rounded-full bg-brand-100 p-1.5 text-brand-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
                  {categories.find((c) => c.id === currentWord.category)?.label}
                </p>
                <h3 className="font-display text-4xl font-bold text-brand-900">
                  {currentWord.word}
                </h3>
                <p className="text-brand-900/50">{currentWord.ipa}</p>
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

              {/* Back */}
              <div className="backface-hidden rotate-y-180 absolute flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl border border-brand-200 bg-brand-500 p-8 text-center text-white shadow-xl">
                <h3 className="font-display text-3xl font-bold">{currentWord.meaning}</h3>
                <p className="text-white/90">“{currentWord.example}”</p>
                <p className="text-sm text-white/70">{currentWord.exampleMeaning}</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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

      <p className="mt-4 text-center text-sm text-brand-900/40">
        Thẻ {(index % filteredIds.length) + 1} / {filteredIds.length}
      </p>

      {filteredIds.length > 0 && knownIds.length > 0 && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => setIndex(0)}
            className="inline-flex items-center gap-1 text-xs text-brand-900/40 hover:text-brand-600"
          >
            <RotateCcw className="h-3 w-3" />
            Quay lại thẻ đầu
          </button>
        </div>
      )}
    </section>
  );
}
