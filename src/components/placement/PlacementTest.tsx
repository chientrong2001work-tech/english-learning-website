import { useState } from "react";
import { Award, Check, Headphones, Lock, Mic, PenLine, BookOpen, Rocket, RotateCcw, Unlock, X } from "lucide-react";
import { levels } from "../../data/levels";
import { levelVocabulary } from "../../data/levelVocabulary";
import { readingTests } from "../../data/readingTests";
import { SKILL_PASS_RATIO } from "../../hooks/useLevelProgress";
import ListeningTab from "../roadmap/ListeningTab";
import SpeakingTab from "../roadmap/SpeakingTab";
import ReadingTab from "../roadmap/ReadingTab";
import WritingTab from "../roadmap/WritingTab";
import type { CEFRLevel, SkillId } from "../../types";

const SKILL_ORDER: SkillId[] = ["listening", "reading", "writing", "speaking"];

const skillMeta: Record<SkillId, { label: string; icon: typeof Headphones }> = {
  listening: { label: "Nghe", icon: Headphones },
  reading: { label: "Đọc", icon: BookOpen },
  writing: { label: "Viết", icon: PenLine },
  speaking: { label: "Nói", icon: Mic },
};

interface SkillResult {
  skill: SkillId;
  percent: number;
  passed: boolean;
}

interface LevelResult {
  level: CEFRLevel;
  skills: SkillResult[];
  passed: boolean;
}

interface PlacementTestProps {
  placementLevel: CEFRLevel | null;
  onApplyPlacement: (level: CEFRLevel) => void;
}

export default function PlacementTest({ placementLevel, onApplyPlacement }: PlacementTestProps) {
  const [stage, setStage] = useState<"intro" | "testing" | "result">("intro");
  const [levelIdx, setLevelIdx] = useState(0);
  const [skillIdx, setSkillIdx] = useState(0);
  const [skillResults, setSkillResults] = useState<SkillResult[]>([]);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);
  const [finalLevel, setFinalLevel] = useState<CEFRLevel | null>(null);

  function startTest() {
    setLevelIdx(0);
    setSkillIdx(0);
    setSkillResults([]);
    setLevelResults([]);
    setFinalLevel(null);
    setStage("testing");
  }

  function finishTest(results: LevelResult[]) {
    const passedLevels = results.filter((r) => r.passed).map((r) => r.level);
    // Levels are tested in order (A1 -> C2) and the test stops at the first
    // failure, so the last passed entry is always the highest level reached.
    const best = passedLevels.length > 0 ? passedLevels[passedLevels.length - 1] : null;
    setFinalLevel(best);
    setStage("result");
  }

  function handleSkillComplete(percent: number) {
    const skill = SKILL_ORDER[skillIdx];
    const passed = percent >= SKILL_PASS_RATIO * 100;
    const nextSkillResults = [...skillResults, { skill, percent, passed }];

    const nextSkillIdx = skillIdx + 1;
    if (nextSkillIdx < SKILL_ORDER.length) {
      setSkillResults(nextSkillResults);
      setSkillIdx(nextSkillIdx);
      return;
    }

    const level = levels[levelIdx].id;
    const levelPassed = nextSkillResults.every((r) => r.passed);
    const result: LevelResult = { level, skills: nextSkillResults, passed: levelPassed };
    const nextLevelResults = [...levelResults, result];
    setLevelResults(nextLevelResults);

    const nextLevelIdx = levelIdx + 1;
    if (levelPassed && nextLevelIdx < levels.length) {
      setLevelIdx(nextLevelIdx);
      setSkillIdx(0);
      setSkillResults([]);
    } else {
      finishTest(nextLevelResults);
    }
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
            Đã có nền tảng từ trước? Làm bài test theo chuẩn 4 kỹ năng IELTS để xác định đúng trình độ CEFR thực tế
            của bạn — không cần học lại từ A1 nếu bạn đã giỏi hơn.
          </p>

          <div className="mx-auto mt-6 max-w-md space-y-2 rounded-2xl bg-brand-50 p-5 text-left text-sm text-brand-900/70">
            <p>
              🎧📖✍️🎤 Bài test theo <strong>4 kỹ năng IELTS</strong> — <strong>Nghe, Đọc, Viết, Nói</strong> — ở
              từng cấp CEFR, bắt đầu từ A1.
            </p>
            <p>
              ✅ Mỗi kỹ năng cần đạt <strong>{Math.round(SKILL_PASS_RATIO * 100)}%</strong> trở lên. Đạt đủ cả 4 kỹ
              năng thì tiếp tục lên cấp kế tiếp; không đạt thì bài test dừng lại.
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

          <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
            {levelResults.map((r) => (
              <div key={r.level} className="rounded-xl border border-brand-100 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-semibold text-brand-900">Cấp {r.level}</span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${r.passed ? "text-brand-600" : "text-red-500"}`}
                  >
                    {r.passed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    {r.passed ? "Đạt" : "Chưa đạt"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {r.skills.map((s) => {
                    const Icon = skillMeta[s.skill].icon;
                    return (
                      <div
                        key={s.skill}
                        className={`flex flex-col items-center gap-1 rounded-lg p-2 text-xs ${
                          s.passed ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {skillMeta[s.skill].label}
                        <span className="font-semibold">{Math.round(s.percent)}%</span>
                      </div>
                    );
                  })}
                </div>
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

  const level = levels[levelIdx];
  const skill = SKILL_ORDER[skillIdx];
  const levelWords = levelVocabulary.filter((w) => w.level === level.id);
  const readingTest = readingTests.find((t) => t.level === level.id)!;
  const SkillIcon = skillMeta[skill].icon;

  return (
    <section id="placement" className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-6 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-500">
          <SkillIcon className="h-4 w-4" />
          Đang test cấp {level.id} · Kỹ năng {skillIdx + 1}/4: {skillMeta[skill].label}
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-900">Test trình độ tiếng Anh</h2>
      </div>

      <div className="mb-6 flex items-center justify-center gap-2">
        {SKILL_ORDER.map((s, i) => {
          const Icon = skillMeta[s].icon;
          const done = i < skillIdx;
          const active = i === skillIdx;
          return (
            <span
              key={s}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                active
                  ? "bg-brand-500 text-white"
                  : done
                    ? "bg-brand-100 text-brand-700"
                    : "bg-brand-50 text-brand-900/40"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {skillMeta[s].label}
            </span>
          );
        })}
      </div>

      {skill === "listening" && (
        <ListeningTab key={`${level.id}-listening`} words={levelWords} onComplete={handleSkillComplete} />
      )}
      {skill === "reading" && (
        <ReadingTab key={`${level.id}-reading`} test={readingTest} onComplete={handleSkillComplete} />
      )}
      {skill === "writing" && (
        <WritingTab key={`${level.id}-writing`} words={levelWords} onComplete={handleSkillComplete} />
      )}
      {skill === "speaking" && (
        <SpeakingTab key={`${level.id}-speaking`} words={levelWords} onComplete={handleSkillComplete} />
      )}
    </section>
  );
}
