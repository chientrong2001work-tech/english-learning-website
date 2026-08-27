import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import { categories } from "../data/categories";
import { vocabulary } from "../data/vocabulary";
import { shuffle } from "../lib/array";
import VocabQuizCard from "./VocabQuizCard";
import type { CategoryId } from "../types";

interface FlashcardsProps {
  knownIds: string[];
  onToggleKnown: (id: string, known: boolean) => void;
}

export default function Flashcards({ knownIds, onToggleKnown }: FlashcardsProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [order, setOrder] = useState<string[]>(() => shuffle(vocabulary.map((w) => w.id)));
  const [index, setIndex] = useState(0);

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

  const quizPool = useMemo(
    () => vocabulary.filter((w) => activeCategory === "all" || w.category === activeCategory),
    [activeCategory],
  );

  function goToNext() {
    setIndex((prev) => (filteredIds.length ? (prev + 1) % filteredIds.length : 0));
  }

  function handleCategoryChange(category: CategoryId | "all") {
    setActiveCategory(category);
    setIndex(0);
  }

  function handleShuffle() {
    setOrder(shuffle(vocabulary.map((w) => w.id)));
    setIndex(0);
  }

  if (!currentWord) return null;

  return (
    <section id="flashcards" className="mx-auto max-w-4xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold text-brand-900">
          Flashcard từ vựng
        </h2>
        <p className="mt-2 text-brand-900/60">
          Chọn đúng nghĩa của từ để đánh dấu bạn đã thuộc từ đó chưa.
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

      <p className="mb-3 text-center text-sm font-semibold uppercase tracking-wide text-brand-500">
        {categories.find((c) => c.id === currentWord.category)?.label}
      </p>

      <VocabQuizCard
        key={currentWord.id}
        word={currentWord}
        pool={quizPool}
        isKnown={isKnown}
        onAnswered={(correct) => onToggleKnown(currentWord.id, correct)}
        onNext={goToNext}
      />

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
    </section>
  );
}
