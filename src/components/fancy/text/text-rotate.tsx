import {
  AnimatePresence,
  motion,
  type AnimatePresenceProps,
  type MotionProps,
  type Transition,
} from "framer-motion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface TextRotateProps {
  texts: string[];
  rotationInterval?: number;
  initial?: MotionProps["initial"];
  animate?: MotionProps["animate"];
  exit?: MotionProps["exit"];
  animatePresenceMode?: AnimatePresenceProps["mode"];
  animatePresenceInitial?: boolean;
  staggerDuration?: number;
  staggerFrom?: "first" | "last" | "center" | number | "random";
  transition?: Transition;
  loop?: boolean;
  auto?: boolean;
  splitBy?: "words" | "characters" | "lines";
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
}

export interface TextRotateRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

function splitIntoCharacters(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (segment) => segment.segment);
  }
  return Array.from(text);
}

const TextRotate = forwardRef<TextRotateRef, TextRotateProps>(
  (
    {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      animatePresenceInitial = false,
      rotationInterval = 2000,
      staggerDuration = 0,
      staggerFrom = "first",
      loop = true,
      auto = true,
      splitBy = "characters",
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
    },
    ref,
  ) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const wordObjects = useMemo<WordObject[]>(() => {
      const currentText = texts[currentTextIndex] ?? "";
      if (splitBy === "characters") {
        const words = currentText.split(" ");
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      if (splitBy === "lines") {
        return currentText.split("\n").map((line, i, arr) => ({
          characters: [line],
          needsSpace: i !== arr.length - 1,
        }));
      }
      const words = currentText.split(" ");
      return words.map((word, i) => ({
        characters: [word],
        needsSpace: i !== words.length - 1,
      }));
    }, [texts, currentTextIndex, splitBy]);

    const totalCharacters = useMemo(
      () => wordObjects.reduce((sum, word) => sum + word.characters.length, 0),
      [wordObjects],
    );

    // Running character offset at the start of each word, so stagger delay
    // can be computed per-character without mutating state during render.
    const wordCharOffsets = useMemo(() => {
      const offsets: number[] = [];
      let offset = 0;
      for (const word of wordObjects) {
        offsets.push(offset);
        offset += word.characters.length;
      }
      return offsets;
    }, [wordObjects]);

    const getStaggerDelay = useCallback(
      (index: number) => {
        if (staggerFrom === "first") return index * staggerDuration;
        if (staggerFrom === "last") return (totalCharacters - 1 - index) * staggerDuration;
        if (staggerFrom === "center") {
          const center = Math.floor(totalCharacters / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === "random") {
          const randomIndex = Math.floor(Math.random() * totalCharacters);
          return Math.abs(randomIndex - index) * staggerDuration;
        }
        return Math.abs(staggerFrom - index) * staggerDuration;
      },
      [staggerFrom, staggerDuration, totalCharacters],
    );

    const handleIndexChange = useCallback(
      (newIndex: number) => {
        setCurrentTextIndex(newIndex);
        onNext?.(newIndex);
      },
      [onNext],
    );

    const next = useCallback(() => {
      setCurrentTextIndex((prev) => {
        const nextIndex = prev === texts.length - 1 ? (loop ? 0 : prev) : prev + 1;
        if (nextIndex !== prev) onNext?.(nextIndex);
        return nextIndex;
      });
    }, [texts.length, loop, onNext]);

    const previous = useCallback(() => {
      const prevIndex = currentTextIndex === 0 ? (loop ? texts.length - 1 : currentTextIndex) : currentTextIndex - 1;
      if (prevIndex !== currentTextIndex) handleIndexChange(prevIndex);
    }, [currentTextIndex, texts.length, loop, handleIndexChange]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        if (validIndex !== currentTextIndex) handleIndexChange(validIndex);
      },
      [texts.length, currentTextIndex, handleIndexChange],
    );

    const reset = useCallback(() => {
      if (currentTextIndex !== 0) handleIndexChange(0);
    }, [currentTextIndex, handleIndexChange]);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }), [next, previous, jumpTo, reset]);

    useEffect(() => {
      if (!auto) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [next, rotationInterval, auto]);

    return (
      <motion.span className={cx("flex flex-wrap whitespace-pre-wrap", mainClassName)} layout transition={transition}>
        <span className="sr-only">{texts[currentTextIndex]}</span>

        <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
          <motion.span
            key={currentTextIndex}
            className={cx("flex flex-wrap", splitBy === "lines" ? "w-full flex-col" : "flex-row")}
            layout
            aria-hidden="true"
          >
            {wordObjects.map((wordObj, wordIndex) => (
              <span key={wordIndex} className={cx("inline-flex", splitLevelClassName)}>
                {wordObj.characters.map((char, charIndex) => {
                  const delay = getStaggerDelay(wordCharOffsets[wordIndex] + charIndex);
                  return (
                    <motion.span
                      key={charIndex}
                      initial={initial}
                      animate={animate}
                      exit={exit}
                      transition={{ ...transition, delay }}
                      className={cx("inline-block", elementLevelClassName)}
                    >
                      {char}
                    </motion.span>
                  );
                })}
                {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
              </span>
            ))}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    );
  },
);

TextRotate.displayName = "TextRotate";

export default TextRotate;
