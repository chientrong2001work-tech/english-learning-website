import { useState } from "react";
import { Award, Check, Lock, Rocket, RotateCcw, Unlock, X } from "lucide-react";
import { levels } from "../../data/levels";
import { levelVocabulary } from "../../data/levelVocabulary";
import { placementGrammar } from "../../data/placementGrammar";
import { readingTests } from "../../data/readingTests";
import { sample, shuffle } from "../../lib/array";
import type { CEFRLevel } from "../../types";

const PASS_THRESHOLD = 0.7;
const VOCAB_QUESTION_COUNT = 5;

interface Step {
  kind: "grammar" | "reading" | "vocab";
  passage?: string;
  passageTitle?: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

function buildLevelSteps(level: CEFRLevel): Step[] {
  const grammarSteps: Step[] = placementGrammar[level].map((q) => ({
    kind: "grammar",
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  }));

  const readingTest = readingTests.find((t) => t.level === level)!;
  const readingSteps: Step[] = readingTest.questions.map((q) => ({
    kind: "reading",
    passage: readingTest.passage,
    passageTitle: readingTest.title,
    question: q.question,
    options: q.options,
    correctAnswer: q.correctAnswer,
  }));

  const levelWords = levelVocabulary.filter((w) => w.level === level);
  const vocabPool = sample(levelWords, Math.min(VOCAB_QUESTION_COUNT, levelWords.length));
  const vocabSteps: Step[] = vocabPool.map((word) => {
    const distractorPool = levelWords.filter((w) => w.id !== word.id && w.meaning !== word.meaning);
    const distractors = sample(distractorPool, Math.min(3, distractorPool.length)).map((w) => w.meaning);
    return {
      kind: "vocab",
      question: `Từ "${word.word}" có nghĩa là gì?`,
      options: shuffle([word.meaning, ...distractors]),
      correctAnswer: word.meaning,
    };
  });

  return [...grammarSteps, ...readingSteps, ...vocabSteps];
}

interface LevelResult {
  level: CEFRLevel;
  correct: number;
  total: number;
  passed: boolean;
}

interface PlacementTestProps {
  placementLevel: CEFRLevel | null;
  onApplyPlacement: (level: CEFRLevel) => void;
}

const sectionLabel: Record<Step["kind"], string> = {
  grammar: "Ngữ pháp",
  reading: "Đọc hiểu",
  vocab: "Từ vựng",
};

export default function PlacementTest({ placementLevel, onApplyPlacement }: PlacementTestProps) {
  const [stage, setStage] = useState<"intro" | "testing" | "result">("intro");
  const [levelIdx, setLevelIdx] = useState(0);
  const [steps, setSteps] = useState<Step[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [finalLevel, setFinalLevel] = useState<CEFRLevel | null>(null);

  function startTest() {
    setLevelIdx(0);
    setSteps(buildLevelSteps(levels[0].id));
    setStepIndex(0);
    setCorrectInLevel(0);
    setSelected(null);
    setLevelResults([]);
    setFinalLevel(null);
    setStage("testing");
  }

  function finishTest(results: LevelResult[]) {
    // Levels are tested in order (A1 -> C2) and the test stops at the first
    // failure, so the last passed entry is always the highest level reached.
    const passedLevels = results.filter((r) => r.passed).map((r) => r.level);
    const best = passedLevels.length > 0 ? passedLevels[passedLevels.length - 1] : null;
    setFinalLevel(best);
    setStage("result");
  }

  function handleAnswer(option: string) {
    if (selected) return;
    setSelected(option);
    const step = steps[stepIndex];
    const isCorrect = option === step.correctAnswer;
    const nextCorrect = isCorrect ? correctInLevel + 1 : correctInLevel;
    if (isCorrect) setCorrectInLevel(nextCorrect);

    window.setTimeout(() => {
      const nextStepIndex = stepIndex + 1;
      if (nextStepIndex < steps.length) {
        setStepIndex(nextStepIndex);
        setSelected(null);
        return;
      }

      const level = levels[levelIdx].id;
      const total = steps.length;
      const passed = nextCorrect / total >= PASS_THRESHOLD;
      const result: LevelResult = { level, correct: nextCorrect, total, passed };
      const nextResults = [...levelResults, result];
      setLevelResults(nextResults);

      const nextLevelIdx = levelIdx + 1;
      if (passed && nextLevelIdx < levels.length) {
        setLevelIdx(nextLevelIdx);
        setSteps(buildLevelSteps(levels[nextLevelIdx].id));
        setStepIndex(0);
        setCorrectInLevel(0);
        setSelected(null);
      } else {
        finishTest(nextResults);
      }
    }, 700);
  }

  function handleUnlock() {
    if (finalLevel) onApplyPlacement(finalLevel);
  }

  if (stage === "intro") {
    return (
      <section id="placement" className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-brand-100 bg-white p-8 text-center shadow-lg shadow-brand-900/5">
          <span className="mx-auto mb-4 inline-flex rounded-full bg-brand-100 p-3 text-brand-600">
            <Rocket className="h-7 w-7" />
          </span>
          <h2 className="font-display text-3xl font-bold text-brand-900">Test trình độ tiếng Anh</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-900/60">
            Đã có nền tảng từ trước? Làm bài test nhanh để xác định đúng trình độ CEFR thực tế của bạn — không cần
            học lại từ A1 nếu bạn đã giỏi hơn.
          </p>

          <div className="mx-auto mt-6 max-w-md space-y-2 rounded-2xl bg-brand-50 p-5 text-left text-sm text-brand-900/70">
            <p>
              📝 Bài test gồm 3 phần theo từng cấp (<strong>Ngữ pháp</strong>, <strong>Đọc hiểu</strong>,{" "}
              <strong>Từ vựng</strong>) — bắt đầu từ A1.
            </p>
            <p>
              ✅ Đạt <strong>{Math.round(PASS_THRESHOLD * 100)}%</strong> trở lên ở một cấp thì tiếp tục lên cấp
              kế tiếp; không đạt thì bài test dừng lại.
            </p>
            <p>
              🔓 Trình độ cao nhất bạn vượt qua sẽ <strong>mở khóa toàn bộ lộ trình từ A1 đến cấp đó</strong>, để bạn
              vào học đúng ngay từ đầu.
            </p>
          </div>

          {placementLevel && (
            <p className="mt-4 text-sm text-brand-600">
              Trình độ đã xác định trước đó: <strong>{placementLevel}</strong>
            </p>
          )}

          <button
            onClick={startTest}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
          >
            <Rocket className="h-5 w-5" />
            Bắt đầu test
          </button>
        </div>
      </section>
    );
  }

  if (stage === "result") {
    return (
      <section id="placement" className="mx-auto max-w-3xl px-6 py-20">
        <div className="rounded-3xl border border-brand-100 bg-white p-8 text-center shadow-lg shadow-brand-900/5">
          <span className="mx-auto mb-4 inline-flex rounded-full bg-brand-100 p-3 text-brand-600">
            <Award className="h-8 w-8" />
          </span>
          <h2 className="font-display text-2xl font-bold text-brand-900">
            {finalLevel ? (
              <>
                Trình độ của bạn: <span className="text-brand-500">{finalLevel}</span>
              </>
            ) : (
              "Bạn chưa đạt trình độ A1 trong bài test này"
            )}
          </h2>
          <p className="mt-2 text-brand-900/60">
            {finalLevel
              ? `Bạn có thể mở khóa lộ trình từ A1 đến ${finalLevel} để vào học ngay đúng trình độ.`
              : "Không sao cả — hãy bắt đầu học từ cấp A1 trong Lộ trình CEFR để xây nền tảng vững chắc."}
          </p>

          <div className="mx-auto mt-6 max-w-md space-y-2 text-left">
            {levelResults.map((r) => (
              <div key={r.level} className="flex items-center justify-between rounded-xl border border-brand-100 p-3">
                <span className="font-medium text-brand-900">Cấp {r.level}</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${r.passed ? "text-brand-600" : "text-red-500"}`}
                >
                  {r.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {r.correct}/{r.total} ({Math.round((r.correct / r.total) * 100)}%)
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {finalLevel && (
              <button
                onClick={handleUnlock}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
              >
                <Unlock className="h-5 w-5" />
                Mở khóa lộ trình đến cấp {finalLevel}
              </button>
            )}
            <button
              onClick={startTest}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              <RotateCcw className="h-4 w-4" />
              Làm lại
            </button>
          </div>

          {placementLevel && (
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-brand-900/40">
              <Lock className="h-3.5 w-3.5" />
              Trình độ đã mở khóa hiện tại: {placementLevel}
            </p>
          )}
        </div>
      </section>
    );
  }

  const step = steps[stepIndex];
  const level = levels[levelIdx];

  return (
    <section id="placement" className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">
          Đang test cấp {level.id} · {sectionLabel[step.kind]}
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-900">Test trình độ tiếng Anh</h2>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm font-semibold text-brand-900/50">
        <span>
          Câu {stepIndex + 1}/{steps.length}
        </span>
        <span>Đúng: {correctInLevel}</span>
      </div>
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${((stepIndex + (selected ? 1 : 0)) / steps.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
        {step.kind === "reading" && step.passage && (
          <div className="mb-5 rounded-2xl bg-brand-50 p-4">
            <p className="mb-2 font-display font-bold text-brand-900">{step.passageTitle}</p>
            <p className="text-sm leading-relaxed text-brand-900/70">{step.passage}</p>
          </div>
        )}

        <p className="mb-5 text-center font-display text-xl font-bold text-brand-900">{step.question}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {step.options.map((option) => {
            const isSelected = selected === option;
            const isCorrectOption = option === step.correctAnswer;
            const showState = selected !== null;
            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={selected !== null}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left font-medium transition ${
                  showState && isCorrectOption
                    ? "border-brand-400 bg-brand-50 text-brand-700"
                    : showState && isSelected
                      ? "border-red-300 bg-red-50 text-red-600"
                      : "border-brand-100 hover:border-brand-300 hover:bg-brand-50"
                }`}
              >
                {option}
                {showState && isCorrectOption && <Check className="h-4 w-4" />}
                {showState && isSelected && !isCorrectOption && <X className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
