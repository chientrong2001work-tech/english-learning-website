import { GraduationCap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-brand-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center text-sm text-brand-900/60">
        <div className="flex items-center gap-2 font-display text-lg font-bold text-brand-700">
          <GraduationCap className="h-5 w-5" />
          EngUp
        </div>
        <p>Học một chút mỗi ngày, tiến bộ mỗi tuần. Chúc bạn học vui!</p>
      </div>
    </footer>
  );
}
