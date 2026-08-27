import { ArrowLeft, CheckCircle2, ClipboardList, Headphones, Sparkles } from "lucide-react";
import PlacementTest from "../components/placement/PlacementTest";
import type { CEFRLevel } from "../types";

const GAUGE_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Làm bài trắc nghiệm",
    desc: "24 câu: đọc hiểu rồi đến nghe hiểu, độ khó tăng dần qua từng cấp A1 → C2.",
  },
  {
    icon: Headphones,
    title: "2. Nộp bài một lần",
    desc: "Không dừng giữa chừng, không chấm theo từng phần — giống các bài quick-check thực tế.",
  },
  {
    icon: Sparkles,
    title: "3. Nhận kết quả CEFR",
    desc: "Biết ngay trình độ hiện tại và có thể mở khóa lộ trình học từ A1 đến đúng cấp đó.",
  },
];

interface EntryTestPageProps {
  placementLevel: CEFRLevel | null;
  onApplyPlacement: (level: CEFRLevel) => void;
}

export default function EntryTestPage({ placementLevel, onApplyPlacement }: EntryTestPageProps) {
  return (
    <div className="min-h-screen bg-[#f7fbf9]">
      <header className="border-b border-brand-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-600">
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ EngUp
          </a>
          {placementLevel && (
            <span className="rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700">
              Trình độ đã lưu: {placementLevel}
            </span>
          )}
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
            <Sparkles className="h-4 w-4" />
            Miễn phí · Làm ngay trên trình duyệt
          </span>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight text-brand-900 sm:text-5xl">
            Test trình độ tiếng Anh của bạn
          </h1>
          <p className="mt-4 max-w-lg text-lg text-brand-900/70">
            Đừng học lại từ A1 nếu bạn đã giỏi hơn thế. Làm bài test nhanh theo chuẩn CEFR để biết chính xác
            trình độ hiện tại, rồi mở khóa lộ trình học đúng ngay từ đầu.
          </p>
          <ul className="mt-6 space-y-2 text-brand-900/70">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-500" />
              24 câu, khoảng 10 phút
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-500" />
              Kết quả theo 6 cấp độ CEFR (A1–C2)
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-500" />
              Mở khóa lộ trình học ngay sau khi có kết quả
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-wide text-brand-500">
            Thang trình độ CEFR
          </p>
          <div className="space-y-2">
            {GAUGE_LEVELS.map((level, i) => (
              <div key={level} className="flex items-center gap-3">
                <span className="w-8 text-sm font-semibold text-brand-900/60">{level}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-brand-50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-300 to-brand-500"
                    style={{ width: `${((i + 1) / GAUGE_LEVELS.length) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-brand-900/40">
            Bài test sẽ xác định bạn đang ở đâu trên thang này.
          </p>
        </div>
      </section>

      <section className="border-y border-brand-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-12 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.title} className="flex flex-col items-center gap-3 text-center">
              <span className="inline-flex rounded-full bg-brand-50 p-3 text-brand-600">
                <step.icon className="h-6 w-6" />
              </span>
              <h3 className="font-display font-bold text-brand-900">{step.title}</h3>
              <p className="text-sm text-brand-900/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <PlacementTest placementLevel={placementLevel} onApplyPlacement={onApplyPlacement} />

      <footer className="border-t border-brand-100 py-8 text-center text-sm text-brand-900/50">
        <a href="#top" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Quay lại trang chủ EngUp
        </a>
      </footer>
    </div>
  );
}
