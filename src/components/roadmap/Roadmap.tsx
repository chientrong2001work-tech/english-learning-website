import { useState } from "react";
import LevelGrid from "./LevelGrid";
import LevelWorkspace from "./LevelWorkspace";
import type { LevelProgress } from "../../hooks/useLevelProgress";
import type { CEFRLevel, SkillId } from "../../types";

interface RoadmapProps {
  progress: LevelProgress[];
  knownIds: string[];
  onToggleKnown: (id: string, known: boolean) => void;
  onRecordScore: (level: CEFRLevel, skill: SkillId, percent: number) => void;
}

export default function Roadmap({ progress, knownIds, onToggleKnown, onRecordScore }: RoadmapProps) {
  const [activeLevel, setActiveLevel] = useState<CEFRLevel | null>(null);

  const activeProgress = activeLevel ? progress.find((p) => p.level === activeLevel) ?? null : null;

  function handleSelectLevel(level: CEFRLevel) {
    setActiveLevel(level);
    window.setTimeout(() => {
      document.getElementById("level-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }

  return (
    <section id="roadmap" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-bold text-brand-900">Lộ trình học theo trình độ CEFR</h2>
        <p className="mx-auto mt-2 max-w-2xl text-brand-900/60">
          Chinh phục 6 cấp độ A1 → C2. Ở mỗi cấp, học đủ từ vựng và vượt qua bài kiểm tra 4 kỹ năng Nghe - Nói -
          Đọc - Viết để mở khóa cấp tiếp theo.
        </p>
      </div>

      <LevelGrid progress={progress} activeLevel={activeLevel} onSelectLevel={handleSelectLevel} />

      {activeProgress && (
        <div className="mt-10">
          <LevelWorkspace
            level={activeProgress.level}
            progress={activeProgress}
            knownIds={knownIds}
            onToggleKnown={onToggleKnown}
            onRecordScore={onRecordScore}
          />
        </div>
      )}
    </section>
  );
}
