import { useMemo, useState } from "react";
import { Award, BookOpen, Check, Headphones, Lock, Mic, PenLine, Rocket, RotateCcw, Unlock, Volume2, X } from "lucide-react";
import { levels } from "../../data/levels";
import { readingTests } from "../../data/readingTests";
import { placementListening } from "../../data/placementQuiz";
import { SKILL_PASS_RATIO } from "../../hooks/useLevelProgress";
import { speak } from "../../lib/speech";
import type { CEFRLevel } from "../../types";
import PlacementWriting, { type WritingResult } from "./PlacementWriting";
import PlacementSpeaking, { type SpeakingRecording } from "./PlacementSpeaking";

const READING_QUESTIONS_PER_LEVEL = 2;
const QUESTIONS_PER_LEVEL = READING_QUESTIONS_PER_LEVEL + 2; // + 2 listening

interface QuizItem {
  id: string;
  level: CEFRLevel;
  section: "reading" | "listening";
  passage?: string;
  passageTitle?: string;
  audioWord?: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

function buildQuiz(): QuizItem[] {
  const reading: QuizItem[] = levels.flatMap((info) => {
    const test = readingTests.find((t) => t.level === info.id)!;
    return test.questions.slice(0, READING_QUESTIONS_PER_LEVEL).map((q) => ({
      id: q.id,
      level: info.id,
      section: "reading" as const,
      passage: test.passage,
      passageTitle: test.title,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
    }));
  });

  const listening: QuizItem[] = levels.flatMap((info) =>
    placementListening[info.id].map((item) => ({
      id: item.id,
      level: info.id,
      section: "listening" as const,
      audioWord: item.word,
      question: "Bạn vừa nghe từ này. Nó có nghĩa là gì?",
      options: item.options,
      correctAnswer: item.correctAnswer,
    })),
  );

  return [...reading, ...listening];
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

export default function PlacementTest({ placementLevel, onApplyPlacement }: PlacementTestProps) {
  const [stage, setStage] = useState<"intro" | "testing" | "writing" | "speaking" | "result">("intro");
  const [quiz] = useState<QuizItem[]>(() => buildQuiz());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correctByLevel, setCorrectByLevel] = useState<Record<CEFRLevel, number>>({} as Record<CEFRLevel, number>);
  const [finalLevel, setFinalLevel] = useState<CEFRLevel | null>(null);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [writingResult, setWritingResult] = useState<WritingResult | null>(null);
  const [speakingRecordings, setSpeakingRecordings] = useState<SpeakingRecording[]>([]);

  const currentItem = quiz[index];
  const sectionStartIndex = useMemo(
    () => quiz.findIndex((q) => q.section === currentItem?.section),
    [quiz, currentItem],
  );
  const sectionTotal = useMemo(
    () => quiz.filter((q) => q.section === currentItem?.section).length,
    [quiz, currentItem],
  );

  function startTest() {
    setIndex(0);
    setSelected(null);
    setCorrectByLevel({} as Record<CEFRLevel, number>);
    setFinalLevel(null);
    setLevelResults([]);
    setWritingResult(null);
    setSpeakingRecordings([]);
    setStage("testing");
  }

  function computeResult(tally: Record<CEFRLevel, number>) {
    const results: LevelResult[] = levels.map((info) => {
      const correct = tally[info.id] ?? 0;
      const total = QUESTIONS_PER_LEVEL;
      return { level: info.id, correct, total, passed: correct / total >= SKILL_PASS_RATIO };
    });
    setLevelResults(results);

    let best: CEFRLevel | null = null;
    for (const r of results) {
      if (r.passed) best = r.level;
      else break;
    }
    setFinalLevel(best);
    setStage("writing");
  }

  function handleWritingComplete(result: WritingResult) {
    setWritingResult(result);
    setStage("speaking");
  }

  function handleSpeakingComplete(recordings: SpeakingRecording[]) {
    setSpeakingRecordings(recordings);
    setStage("result");
  }

  function handleAnswer(option: string) {
    if (selected) return;
    setSelected(option);
    const isCorrect = option === currentItem.correctAnswer;
    const nextTally = { ...correctByLevel };
    if (isCorrect) {
      nextTally[currentItem.level] = (nextTally[currentItem.level] ?? 0) + 1;
      setCorrectByLevel(nextTally);
    }

    window.setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex < quiz.length) {
        setIndex(nextIndex);
        setSelected(null);
      } else {
        computeResult(nextTally);
      }
    }, 600);
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
            Bài test đầu vào đầy đủ 4 kỹ năng như một bài thi thử thật — Đọc, Nghe, Viết, và Nói (ghi âm giọng nói
            của bạn) — làm liền mạch và có báo cáo kết quả khi hoàn tất.
          </p>

          <div className="mx-auto mt-6 max-w-md space-y-2 rounded-2xl bg-brand-50 p-5 text-left text-sm text-brand-900/70">
            <p>
              📖 <strong>Phần 1 — Đọc hiểu:</strong> 12 câu trắc nghiệm dựa trên đoạn văn, độ khó tăng dần từ A1
              đến C2.
            </p>
            <p>
              🎧 <strong>Phần 2 — Nghe hiểu:</strong> 12 câu, nghe một từ và chọn đúng nghĩa, độ khó cũng tăng dần.
            </p>
            <p>
              ✍️ <strong>Phần 3 — Viết:</strong> viết một đoạn ngắn giới thiệu bản thân bằng tiếng Anh.
            </p>
            <p>
              🎤 <strong>Phần 4 — Nói:</strong> trả lời 3 câu hỏi bằng giọng nói thật của bạn (không đọc lại từ
              vựng) — trình duyệt sẽ ghi âm để bạn nghe lại.
            </p>
            <p>
              ✅ Trình độ CEFR được tính từ phần Đọc + Nghe: mỗi cấp có 4 câu, đạt{" "}
              <strong>{Math.round(SKILL_PASS_RATIO * 100)}%</strong> trở lên (từ 3/4 câu) ở tất cả các cấp liên
              tiếp từ A1 thì trình độ của bạn được tính đến cấp cao nhất đạt.
            </p>
            <p>
              🔓 Sau khi có kết quả, bạn có thể <strong>mở khóa lộ trình từ A1 đến cấp đó</strong> để học đúng ngay
              từ đầu.
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
            Bắt đầu test đầu vào
          </button>
        </div>
      </section>
    );
  }

  if (stage === "writing") {
    return <PlacementWriting onComplete={handleWritingComplete} />;
  }

  if (stage === "speaking") {
    return <PlacementSpeaking onComplete={handleSpeakingComplete} />;
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

          <div className="mx-auto mt-6 max-w-md space-y-4 text-left">
            <div className="rounded-xl border border-brand-100 p-4">
              <p className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-brand-900">
                  <PenLine className="h-4 w-4 text-brand-500" />
                  Phần Viết
                </span>
                {writingResult && (
                  <span className="text-sm font-semibold text-brand-600">
                    {writingResult.score}/100 · {writingResult.band}
                  </span>
                )}
              </p>
              {writingResult ? (
                <>
                  <p className="text-sm text-brand-900/70">{writingResult.answer}</p>
                  <ul className="mt-2 space-y-1 text-xs text-brand-900/50">
                    {writingResult.feedback.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-brand-900/40">Chưa có bài viết.</p>
              )}
            </div>

            <div className="rounded-xl border border-brand-100 p-4">
              <p className="mb-3 flex items-center gap-2 font-semibold text-brand-900">
                <Mic className="h-4 w-4 text-brand-500" />
                Phần Nói ({speakingRecordings.length}/3 câu đã ghi âm)
              </p>
              {speakingRecordings.length > 0 ? (
                <div className="space-y-4">
                  {speakingRecordings.map((rec) => (
                    <div key={rec.id} className="border-t border-brand-50 pt-3 first:border-0 first:pt-0">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-sm text-brand-900/70">{rec.prompt}</p>
                        {rec.score !== null && (
                          <span className="shrink-0 text-sm font-semibold text-brand-600">
                            {rec.score}/100 · {rec.band}
                          </span>
                        )}
                      </div>
                      <audio controls src={rec.audioUrl} className="w-full" />
                      {rec.transcript ? (
                        <p className="mt-1.5 text-xs italic text-brand-900/50">"{rec.transcript}"</p>
                      ) : (
                        <p className="mt-1.5 text-xs text-brand-900/40">
                          Không nhận diện được nội dung để chấm điểm tự động.
                        </p>
                      )}
                      {rec.feedback.length > 0 && (
                        <ul className="mt-1 space-y-0.5 text-xs text-brand-900/50">
                          {rec.feedback.map((f) => (
                            <li key={f}>• {f}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-brand-900/40">Chưa có bài ghi âm.</p>
              )}
            </div>
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

  const posInSection = index - sectionStartIndex + 1;
  const SectionIcon = currentItem.section === "reading" ? BookOpen : Headphones;

  return (
    <section id="placement" className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-6 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-500">
          <SectionIcon className="h-4 w-4" />
          Phần {currentItem.section === "reading" ? "1" : "2"}: {currentItem.section === "reading" ? "Đọc hiểu" : "Nghe hiểu"}
          {" · "}Câu {posInSection}/{sectionTotal}
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-900">Test trình độ tiếng Anh</h2>
      </div>

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${((index + (selected ? 1 : 0)) / quiz.length) * 100}%` }}
        />
      </div>

      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
        {currentItem.section === "reading" && currentItem.passage && (
          <div className="mb-5 rounded-2xl bg-brand-50 p-4">
            <p className="mb-2 font-display font-bold text-brand-900">{currentItem.passageTitle}</p>
            <p className="text-sm leading-relaxed text-brand-900/70">{currentItem.passage}</p>
          </div>
        )}

        {currentItem.section === "listening" && currentItem.audioWord && (
          <div className="mb-5 flex justify-center">
            <button
              onClick={() => speak(currentItem.audioWord!)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              <Volume2 className="h-5 w-5" />
              Nghe từ
            </button>
          </div>
        )}

        <p className="mb-5 text-center font-display text-xl font-bold text-brand-900">{currentItem.question}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {currentItem.options.map((option) => {
            const isSelected = selected === option;
            const isCorrectOption = option === currentItem.correctAnswer;
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
