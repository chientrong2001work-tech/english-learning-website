import { useState } from "react";
import { BookOpen, Check, Headphones, Mic, PenLine, PartyPopper, X } from "lucide-react";
import VocabTab from "./VocabTab";
import ListeningTab from "./ListeningTab";
import SpeakingTab from "./SpeakingTab";
import ReadingTab from "./ReadingTab";
import WritingTab from "./WritingTab";
import { levels } from "../../data/levels";
import { readingTests } from "../../data/readingTests";
import { SKILL_PASS_RATIO, type LevelProgress } from "../../hooks/useLevelProgress";
import type { CEFRLevel, SkillId } from "../../types";

type TabId = "vocab" | "listening" | "speaking" | "reading" | "writing" | "summary";

const tabs: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "vocab", label: "Từ vựng", icon: BookOpen },
  { id: "listening", label: "Nghe", icon: Headphones },
  { id: "speaking", label: "Nói", icon: Mic },
  { id: "reading", label: "Đọc", icon: BookOpen },
  { id: "writing", label: "Viết", icon: PenLine },
  { id: "summary", label: "Tổng kết", icon: PartyPopper },
];

interface LevelWorkspaceProps {
  level: CEFRLevel;
  progress: LevelProgress;
  knownIds: string[];
  onToggleKnown: (id: string, known: boolean) => void;
  onRecordScore: (level: CEFRLevel, skill: SkillId, percent: number) => void;
}

const skillLabels: Record<SkillId, string> = {
  listening: "Nghe",
  speaking: "Nói",
  reading: "Đọc",
  writing: "Viết",
};

export default function LevelWorkspace({
  level,
  progress,
  knownIds,
  onToggleKnown,
  onRecordScore,
}: LevelWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<TabId>("vocab");
  const info = levels.find((l) => l.id === level)!;
  const readingTest = readingTests.find((t) => t.level === level)!;
  const nextLevel = levels[levels.findIndex((l) => l.id === level) + 1];

  return (
    <div id="level-workspace" className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold text-brand-900">{info.label}</h3>
          <p className="text-sm text-brand-900/60">{info.description}</p>
        </div>
        <div className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
          Từ vựng: {progress.knownCount}/{progress.vocabTarget} mục tiêu (kho {progress.totalCount} từ)
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-brand-100 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const passed =
            tab.id !== "vocab" && tab.id !== "summary" ? progress.skillsPassed[tab.id as SkillId] : false;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive ? "bg-brand-500 text-white" : "bg-brand-50 text-brand-700 hover:bg-brand-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {passed && <Check className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {activeTab === "vocab" && (
        <VocabTab key={level} words={progress.words} knownIds={knownIds} onToggleKnown={onToggleKnown} />
      )}
      {activeTab === "listening" && (
        <ListeningTab key={level} words={progress.words} onComplete={(pct) => onRecordScore(level, "listening", pct)} />
      )}
      {activeTab === "speaking" && (
        <SpeakingTab key={level} words={progress.words} onComplete={(pct) => onRecordScore(level, "speaking", pct)} />
      )}
      {activeTab === "reading" && (
        <ReadingTab key={level} test={readingTest} onComplete={(pct) => onRecordScore(level, "reading", pct)} />
      )}
      {activeTab === "writing" && (
        <WritingTab key={level} words={progress.words} onComplete={(pct) => onRecordScore(level, "writing", pct)} />
      )}
      {activeTab === "summary" && (
        <div className="mx-auto max-w-lg space-y-5 text-center">
          <p className="text-sm text-brand-900/60">
            Để mở khóa cấp tiếp theo, bạn cần thuộc ít nhất {progress.vocabTarget} từ (trong kho {progress.totalCount}
            {" "}từ của cấp này) và đạt tối thiểu {Math.round(SKILL_PASS_RATIO * 100)}% ở cả 4 kỹ năng.
          </p>

          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between rounded-xl border border-brand-100 p-3">
              <span className="font-medium text-brand-900">Từ vựng</span>
              <span className={`inline-flex items-center gap-1.5 font-semibold ${progress.vocabMet ? "text-brand-600" : "text-red-500"}`}>
                {progress.vocabMet ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                {progress.knownCount}/{progress.vocabTarget} ({Math.round(progress.vocabRatio * 100)}%)
              </span>
            </div>
            {(["listening", "speaking", "reading", "writing"] as SkillId[]).map((skill) => (
              <div key={skill} className="flex items-center justify-between rounded-xl border border-brand-100 p-3">
                <span className="font-medium text-brand-900">{skillLabels[skill]}</span>
                <span
                  className={`inline-flex items-center gap-1.5 font-semibold ${
                    progress.skillsPassed[skill] ? "text-brand-600" : "text-red-500"
                  }`}
                >
                  {progress.skillsPassed[skill] ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  {progress.scores[skill] === null ? "Chưa làm" : `${progress.scores[skill]}%`}
                </span>
              </div>
            ))}
          </div>

          {progress.levelPassed ? (
            <div className="rounded-2xl bg-brand-500 p-5 text-white">
              <PartyPopper className="mx-auto mb-2 h-8 w-8" />
              <p className="font-display text-lg font-bold">
                Chúc mừng! Bạn đã hoàn thành cấp {level}
                {nextLevel ? ` — cấp ${nextLevel.id} đã được mở khóa.` : " — cấp cao nhất!"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-brand-900/50">
              Hoàn thành các mục còn thiếu ở trên để mở khóa cấp tiếp theo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
