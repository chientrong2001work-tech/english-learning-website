import type { PosCode } from "../types";
import { formatPos } from "../data/partOfSpeech";

interface PosTagProps {
  pos?: PosCode;
  className?: string;
}

export default function PosTag({ pos, className = "" }: PosTagProps) {
  if (!pos) return null;
  return (
    <span
      className={`inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-600 ${className}`}
    >
      {formatPos(pos)}
    </span>
  );
}
