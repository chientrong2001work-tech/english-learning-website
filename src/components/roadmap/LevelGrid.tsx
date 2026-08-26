import { Lock, CheckCircle2, Circle } from "lucide-react";
import { levels } from "../../data/levels";
import type { LevelProgress } from "../../hooks/useLevelProgress";
import type { CEFRLevel } from "../../types";

interface LevelGridProps {
  progress: LevelProgress[];
  activeLevel: CEFRLevel | null;
  onSelectLevel: (level: CEFRLevel) => void;
}

export default function LevelGrid({ progress, activeLevel, onSelectLevel }: LevelGridProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {levels.map((info) => {
        const p = progress.find((item) => item.level === info.id)!;
        const isActive = activeLevel === info.id;
        const percent = p.totalCount ? Math.round((p.knownCount / p.totalCount) * 100) : 0;

        return (
          <button
            key={info.id}
            onClick={() => p.unlocked && onSelectLevel(info.id)}
            disabled={!p.unlocked}
            className={`relative flex flex-col gap-3 rounded-2xl border p-5 text-left transition ${
              !p.unlocked
                ? "cursor-not-allowed border-brand-100 bg-brand-50/40 opacity-60"
                : isActive
                  ? "border-brand-500 bg-brand-500 text-white shadow-lg"
                  : "border-brand-100 bg-white hover:-translate-y-1 hover:shadow-md"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-display text-2xl font-bold ${isActive ? "text-white" : "text-brand-900"}`}>
                {info.id}
              </span>
              {!p.unlocked ? (
                <Lock className={`h-5 w-5 ${isActive ? "text-white/80" : "text-brand-900/30"}`} />
              ) : p.levelPassed ? (
                <CheckCircle2 className={`h-5 w-5 ${isActive ? "text-white" : "text-brand-500"}`} />
              ) : (
                <Circle className={`h-5 w-5 ${isActive ? "text-white/80" : "text-brand-900/20"}`} />
              )}
            </div>

            <p className={`text-sm font-semibold ${isActive ? "text-white" : "text-brand-700"}`}>{info.label}</p>
            <p className={`text-xs leading-relaxed ${isActive ? "text-white/85" : "text-brand-900/60"}`}>
              {info.description}
            </p>

            <div className="mt-auto space-y-1">
              <div className={`h-1.5 w-full overflow-hidden rounded-full ${isActive ? "bg-white/30" : "bg-brand-100"}`}>
                <div
                  className={`h-full rounded-full ${isActive ? "bg-white" : "bg-brand-500"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className={`text-xs ${isActive ? "text-white/80" : "text-brand-900/50"}`}>
                Từ vựng: {p.knownCount}/{p.totalCount}
                {" · "}
                {(["listening", "speaking", "reading", "writing"] as const).filter((s) => p.skillsPassed[s]).length}/4 kỹ năng đạt
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
