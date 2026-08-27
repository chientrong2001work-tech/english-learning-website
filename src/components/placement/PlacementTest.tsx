import { useMemo, useState } from "react";
import { Award, BookOpen, Check, Headphones, Lock, Mic, PenLine, Rocket, RotateCcw, Unlock, Volume2, X } from "lucide-react";
import { levels } from "../../data/levels";
import { readingTests } from "../../data/readingTests";
import { placementReadingVariantB } from "../../data/placementReadingExtra";
import { placementListening } from "../../data/placementQuiz";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { normalizeText, speakDialogue, stopSpeech, type DialogueLine } from "../../lib/speech";
import { scoreToBand } from "../../lib/textScoring";
import type { CEFRLevel } from "../../types";
import PlacementWriting, { type WritingResult } from "./PlacementWriting";
import PlacementSpeaking, { type SpeakingRecording } from "./PlacementSpeaking";

const READING_QUESTIONS_PER_LEVEL = 2;
const LISTENING_QUESTIONS_PER_LEVEL = 2;

interface QuizItem {
  id: string;
  level: CEFRLevel;
  section: "reading" | "listening";
  passage?: string;
  passageTitle?: string;
  dialogue?: DialogueLine[];
  question: string;
  options: string[];
  correctAnswer: string;
  acceptedTextAnswers?: string[];
}

// Two independent editions of the test (reading passages + listening
// dialogues) so a retake ("Làm lại") always shows a full set of different
// questions from the attempt right before it, instead of the exact same test.
function buildQuiz(variant: 0 | 1): QuizItem[] {
  const reading: QuizItem[] = levels.flatMap((info) => {
    const test = variant === 0 ? readingTests.find((t) => t.level === info.id)! : placementReadingVariantB[info.id];
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

  const listening: QuizItem[] = levels.flatMap((info) => {
    const pool = placementListening[info.id];
    const items =
      variant === 0
        ? pool.slice(0, LISTENING_QUESTIONS_PER_LEVEL)
        : pool.slice(LISTENING_QUESTIONS_PER_LEVEL, LISTENING_QUESTIONS_PER_LEVEL * 2);
    return items.map((item) => ({
      id: item.id,
      level: info.id,
      section: "listening" as const,
      dialogue: item.dialogue,
      question: item.question,
      options: item.options,
      correctAnswer: item.correctAnswer,
      acceptedTextAnswers: item.acceptedTextAnswers,
    }));
  });

  return [...reading, ...listening];
}

// Maps the combined Reading+Listening score directly to a CEFR level, so the
// headline result always agrees with the Reading/Listening score cards
// (previously a separate per-level "must pass every level in an unbroken
// streak from A1" rule could report a low level despite a high overall score).
function mapOverallScoreToLevel(score: number): CEFRLevel | null {
  if (score >= 85) return "C2";
  if (score >= 70) return "C1";
  if (score >= 55) return "B2";
  if (score >= 40) return "B1";
  if (score >= 25) return "A2";
  if (score >= 10) return "A1";
  return null;
}

interface SectionResult {
  correct: number;
  total: number;
  score: number;
  band: string;
}

interface PlacementTestProps {
  placementLevel: CEFRLevel | null;
  onApplyPlacement: (level: CEFRLevel) => void;
}

export default function PlacementTest({ placementLevel, onApplyPlacement }: PlacementTestProps) {
  const [attemptIndex, setAttemptIndex] = useLocalStorage("engup-placement-attempt-index", 0);
  const [stage, setStage] = useState<"intro" | "testing" | "writing" | "speaking" | "result">("intro");
  const [quiz, setQuiz] = useState<QuizItem[]>(() => buildQuiz((attemptIndex % 2) as 0 | 1));
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [textAnswerFeedback, setTextAnswerFeedback] = useState<boolean | null>(null);
  const [correctBySection, setCorrectBySection] = useState({ reading: 0, listening: 0 });
  const [finalLevel, setFinalLevel] = useState<CEFRLevel | null>(null);
  const [readingResult, setReadingResult] = useState<SectionResult | null>(null);
  const [listeningResult, setListeningResult] = useState<SectionResult | null>(null);
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
    const nextAttempt = attemptIndex + 1;
    setAttemptIndex(nextAttempt);
    setQuiz(buildQuiz((nextAttempt % 2) as 0 | 1));
    setIndex(0);
    setSelected(null);
    setTextAnswer("");
    setTextAnswerFeedback(null);
    setCorrectBySection({ reading: 0, listening: 0 });
    setFinalLevel(null);
    setReadingResult(null);
    setListeningResult(null);
    setWritingResult(null);
    setSpeakingRecordings([]);
    setStage("testing");
  }

  function computeResult(sectionTally: { reading: number; listening: number }) {
    const readingTotal = levels.length * READING_QUESTIONS_PER_LEVEL;
    const listeningTotal = levels.length * LISTENING_QUESTIONS_PER_LEVEL;
    const readingScore = Math.round((sectionTally.reading / readingTotal) * 100);
    const listeningScore = Math.round((sectionTally.listening / listeningTotal) * 100);
    setReadingResult({
      correct: sectionTally.reading,
      total: readingTotal,
      score: readingScore,
      band: scoreToBand(readingScore),
    });
    setListeningResult({
      correct: sectionTally.listening,
      total: listeningTotal,
      score: listeningScore,
      band: scoreToBand(listeningScore),
    });

    // The overall CEFR level isn't decided yet — it needs Writing and
    // Speaking too, which haven't happened. See handleSpeakingComplete().
    setStage("writing");
  }

  function handleWritingComplete(result: WritingResult) {
    setWritingResult(result);
    setStage("speaking");
  }

  function handleSpeakingComplete(recordings: SpeakingRecording[]) {
    setSpeakingRecordings(recordings);

    // Overall level = the average of all 4 skill scores, mirroring how IELTS
    // computes an Overall Band Score as the mean of Listening/Reading/
    // Writing/Speaking. A Speaking answer with no recognizable content
    // counts as 0 for this average — it can't be scored as done just
    // because a recording exists.
    const speakingScore =
      recordings.length > 0
        ? Math.round(recordings.reduce((sum, r) => sum + (r.score ?? 0), 0) / recordings.length)
        : 0;
    const skillScores = [readingResult?.score ?? 0, listeningResult?.score ?? 0, writingResult?.score ?? 0, speakingScore];
    const overallScore = Math.round(skillScores.reduce((a, b) => a + b, 0) / skillScores.length);
    setFinalLevel(mapOverallScoreToLevel(overallScore));

    setStage("result");
  }

  function submitAnswer(isCorrect: boolean, chosenLabel: string) {
    if (selected) return;
    setSelected(chosenLabel);
    // Stop any dialogue audio still playing from this question right away —
    // it shouldn't keep talking into the next question's screen.
    stopSpeech();
    const nextSectionTally = { ...correctBySection };
    if (isCorrect) {
      nextSectionTally[currentItem.section] = nextSectionTally[currentItem.section] + 1;
      setCorrectBySection(nextSectionTally);
    }

    window.setTimeout(() => {
      const nextIndex = index + 1;
      if (nextIndex < quiz.length) {
        setIndex(nextIndex);
        setSelected(null);
        setTextAnswer("");
        setTextAnswerFeedback(null);
      } else {
        computeResult(nextSectionTally);
      }
    }, 600);
  }

  function handleAnswer(option: string) {
    submitAnswer(option === currentItem.correctAnswer, option);
  }

  function handleTextSubmit() {
    if (selected || !textAnswer.trim()) return;
    const normalized = normalizeText(textAnswer);
    const isCorrect = (currentItem.acceptedTextAnswers ?? []).some((a) => normalized.includes(normalizeText(a)));
    setTextAnswerFeedback(isCorrect);
    submitAnswer(isCorrect, textAnswer.trim());
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
            Bài test đầu vào đầy đủ 4 kỹ năng như một bài thi thử thật — Reading, Listening, Writing, và Speaking
            (ghi âm giọng nói của bạn) — làm liền mạch và có báo cáo kết quả khi hoàn tất.
          </p>

          <div className="mx-auto mt-6 max-w-md space-y-2 rounded-2xl bg-brand-50 p-5 text-left text-sm text-brand-900/70">
            <p>
              📖 <strong>Phần 1 — Reading:</strong> 12 câu trắc nghiệm dựa trên đoạn văn, độ khó tăng dần từ A1 đến
              C2.
            </p>
            <p>
              🎧 <strong>Phần 2 — Listening:</strong> 12 câu, nghe một đoạn hội thoại ngắn rồi trả lời câu hỏi (chọn
              đáp án hoặc gõ câu trả lời), độ khó tăng dần.
            </p>
            <p>
              ✍️ <strong>Phần 3 — Writing:</strong> viết một đoạn ngắn giới thiệu bản thân bằng tiếng Anh.
            </p>
            <p>
              🎤 <strong>Phần 4 — Speaking:</strong> trả lời 3 câu hỏi bằng giọng nói thật của bạn (không đọc lại từ
              vựng) — trình duyệt sẽ ghi âm để bạn nghe lại.
            </p>
            <p>
              ✅ Trình độ CEFR cuối cùng = <strong>trung bình cộng điểm cả 4 kỹ năng</strong> (Reading, Listening,
              Writing, Speaking) — giống cách IELTS tính Overall Band Score bằng trung bình 4 kỹ năng — rồi quy đổi
              sang thang CEFR. Câu Speaking không nhận diện được nội dung sẽ tính 0 điểm khi gộp vào điểm tổng.
            </p>
            <p>🔁 Mỗi lần làm lại, toàn bộ câu hỏi Reading và Listening sẽ được đổi khác so với lần trước.</p>
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

          <div className="mx-auto mt-6 max-w-md space-y-4 text-left">
            <div className="rounded-xl border border-brand-100 p-4">
              <p className="mb-1 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-brand-900">
                  <BookOpen className="h-4 w-4 text-brand-500" />
                  Reading
                </span>
                {readingResult && (
                  <span className="text-sm font-semibold text-brand-600">
                    {readingResult.score}/100 · {readingResult.band}
                  </span>
                )}
              </p>
              {readingResult && (
                <p className="text-sm text-brand-900/50">Đúng {readingResult.correct}/{readingResult.total} câu.</p>
              )}
            </div>

            <div className="rounded-xl border border-brand-100 p-4">
              <p className="mb-1 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-brand-900">
                  <Headphones className="h-4 w-4 text-brand-500" />
                  Listening
                </span>
                {listeningResult && (
                  <span className="text-sm font-semibold text-brand-600">
                    {listeningResult.score}/100 · {listeningResult.band}
                  </span>
                )}
              </p>
              {listeningResult && (
                <p className="text-sm text-brand-900/50">
                  Đúng {listeningResult.correct}/{listeningResult.total} câu.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-brand-100 p-4">
              <p className="mb-2 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-semibold text-brand-900">
                  <PenLine className="h-4 w-4 text-brand-500" />
                  Writing
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
                Speaking ({speakingRecordings.length}/3 câu đã ghi âm)
              </p>
              {speakingRecordings.length > 0 ? (
                <div className="space-y-4">
                  {speakingRecordings.map((rec) => (
                    <div key={rec.id} className="border-t border-brand-50 pt-3 first:border-0 first:pt-0">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <p className="text-sm text-brand-900/70">{rec.prompt}</p>
                        <span className="shrink-0 text-sm font-semibold text-brand-600">
                          {rec.score !== null ? `${rec.score}/100 · ${rec.band}` : "0/100"}
                        </span>
                      </div>
                      <audio controls src={rec.audioUrl} className="w-full" />
                      {rec.transcript ? (
                        <p className="mt-1.5 text-xs italic text-brand-900/50">"{rec.transcript}"</p>
                      ) : (
                        <p className="mt-1.5 text-xs text-brand-900/40">
                          Không nhận diện được nội dung — tính 0 điểm khi gộp vào điểm tổng.
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
  const isTextAnswer = selected !== null && !currentItem.options.includes(selected);

  return (
    <section id="placement" className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-6 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-500">
          <SectionIcon className="h-4 w-4" />
          Phần {currentItem.section === "reading" ? "1" : "2"}: {currentItem.section === "reading" ? "Reading" : "Listening"}
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

        {currentItem.section === "listening" && currentItem.dialogue && (
          <div className="mb-5 flex justify-center">
            <button
              onClick={() => speakDialogue(currentItem.dialogue!)}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              <Volume2 className="h-5 w-5" />
              Nghe hội thoại
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

        {currentItem.section === "listening" && (
          <div className="mt-5 border-t border-brand-50 pt-4">
            <p className="mb-2 text-center text-xs text-brand-900/40">Hoặc gõ câu trả lời của bạn</p>
            <div className="flex gap-2">
              <input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                disabled={selected !== null}
                placeholder="Type your answer..."
                className="flex-1 rounded-full border border-brand-100 px-4 py-2 text-sm outline-none focus:border-brand-400 disabled:bg-brand-50/50"
              />
              <button
                onClick={handleTextSubmit}
                disabled={selected !== null || !textAnswer.trim()}
                className="shrink-0 rounded-full bg-brand-100 px-5 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trả lời
              </button>
            </div>
            {isTextAnswer && textAnswerFeedback !== null && (
              <p className={`mt-2 text-center text-sm font-semibold ${textAnswerFeedback ? "text-brand-600" : "text-red-500"}`}>
                {textAnswerFeedback ? "Chính xác!" : `Chưa đúng — đáp án: ${currentItem.correctAnswer}`}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
