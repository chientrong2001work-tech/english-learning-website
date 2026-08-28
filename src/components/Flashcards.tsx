import { useMemo, useState } from "react";
import { Shuffle, X } from "lucide-react";
import { categories } from "../data/categories";
import { vocabulary } from "../data/vocabulary";
import { levelVocabulary } from "../data/levelVocabulary";
import { shuffle } from "../lib/array";
import VocabQuizCard from "./VocabQuizCard";
import MarqueeAlongSvgPath from "./fancy/blocks/marquee-along-svg-path";
import type { CategoryId } from "../types";

interface FlashcardsProps {
  knownIds: string[];
  onToggleKnown: (id: string, known: boolean) => void;
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const LETTER_COLORS = [
  "bg-brand-500",
  "bg-emerald-500",
  "bg-teal-500",
  "bg-cyan-600",
  "bg-sky-500",
  "bg-indigo-500",
  "bg-violet-500",
  "bg-fuchsia-500",
  "bg-pink-500",
  "bg-rose-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-lime-600",
];
const ALPHABET_PATH_D =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

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

  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [letterOrder, setLetterOrder] = useState<string[]>([]);
  const [letterIndex, setLetterIndex] = useState(0);

  const letterPool = useMemo(() => {
    if (!letterFilter) return [];
    return levelVocabulary.filter((w) => w.word.trim()[0]?.toUpperCase() === letterFilter);
  }, [letterFilter]);

  const currentLetterId = letterOrder[letterIndex % letterOrder.length];
  const currentLetterWord = letterPool.find((w) => w.id === currentLetterId);

  function handleLetterClick(letter: string) {
    const pool = levelVocabulary.filter((w) => w.word.trim()[0]?.toUpperCase() === letter);
    setLetterFilter(letter);
    setLetterOrder(shuffle(pool.map((w) => w.id)));
    setLetterIndex(0);
  }

  function handleLetterNext() {
    setLetterIndex((prev) => (letterOrder.length ? (prev + 1) % letterOrder.length : 0));
  }

  function handleLetterShuffle() {
    setLetterOrder(shuffle(letterPool.map((w) => w.id)));
    setLetterIndex(0);
  }

  function closeLetterReview() {
    setLetterFilter(null);
  }

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
      </div>

      <div className="mb-14">
        <div className="mb-1 text-center">
          <p className="font-display text-xl font-bold text-brand-900">Học từ vựng theo chữ cái</p>
          <p className="text-sm text-brand-900/60">Bấm vào chữ cái bạn muốn học</p>
        </div>
        <div className="mx-auto h-44 w-full max-w-4xl sm:h-56">
          <MarqueeAlongSvgPath
            path={ALPHABET_PATH_D}
            viewBox="0 0 996 330"
            baseVelocity={16}
            slowdownOnHover
            draggable
            repeat={1}
            dragSensitivity={0.6}
            className="h-full w-full"
            responsive
            grabCursor
          >
            {ALPHABET.map((letter, i) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleLetterClick(letter)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white shadow-md transition duration-300 ease-in-out hover:scale-150 sm:h-12 sm:w-12 sm:rounded-xl sm:text-lg ${LETTER_COLORS[i % LETTER_COLORS.length]}`}
              >
                {letter}
              </button>
            ))}
          </MarqueeAlongSvgPath>
        </div>

        {letterFilter && (
          <div className="mt-6">
            {currentLetterWord ? (
              <>
                <VocabQuizCard
                  key={currentLetterWord.id}
                  word={currentLetterWord}
                  pool={letterPool}
                  isKnown={knownIds.includes(currentLetterWord.id)}
                  onAnswered={(correct) => onToggleKnown(currentLetterWord.id, correct)}
                  onNext={handleLetterNext}
                />
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleLetterShuffle}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    <Shuffle className="h-4 w-4" />
                    Xáo trộn
                  </button>
                  <button
                    onClick={closeLetterReview}
                    className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
                  >
                    <X className="h-4 w-4" />
                    Đóng ôn theo chữ cái
                  </button>
                </div>
                <p className="mt-4 text-center text-sm text-brand-900/40">
                  Chữ {letterFilter}: {(letterIndex % letterOrder.length) + 1} / {letterOrder.length} từ
                </p>
              </>
            ) : (
              <div className="text-center">
                <p className="text-brand-900/60">
                  Không có từ nào trong bộ Oxford 3000 bắt đầu bằng chữ "{letterFilter}".
                </p>
                <button
                  onClick={closeLetterReview}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  <X className="h-4 w-4" />
                  Đóng
                </button>
              </div>
            )}
          </div>
        )}
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
