import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileCheck,
  LayoutGrid,
  Mic,
  Shuffle,
  Sparkles,
} from "lucide-react";
import PlacementTest from "../components/placement/PlacementTest";
import type { CEFRLevel } from "../types";

const GAUGE_LEVELS: CEFRLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

const STEPS = [
  {
    icon: ClipboardList,
    title: "1. Đọc, Nghe, Viết",
    desc: "Trắc nghiệm đọc/nghe theo từng cấp A1 → C2, rồi viết một đoạn ngắn giới thiệu bản thân.",
  },
  {
    icon: Mic,
    title: "2. Nói bằng giọng thật",
    desc: "Trả lời 3 câu hỏi bằng giọng nói của bạn (không đọc lại từ vựng) — trình duyệt ghi âm để bạn nghe lại.",
  },
  {
    icon: Sparkles,
    title: "3. Nhận báo cáo kết quả",
    desc: "Xem lại toàn bộ 4 kỹ năng và mở khóa lộ trình học từ A1 đến đúng trình độ của bạn.",
  },
];

const FEATURES = [
  {
    icon: LayoutGrid,
    title: "Đủ 4 kỹ năng trong một lượt",
    desc: "Đọc, Nghe (hội thoại 2 giọng thật), Viết và Nói (ghi âm giọng thật) — làm liền mạch như một bài thi thử, không cần quay lại nhiều lần.",
  },
  {
    icon: FileCheck,
    title: "Chấm theo nội dung thực tế",
    desc: "Bài Viết và Nói được chấm dựa trên nội dung bạn thực sự viết/nói (độ dài, từ vựng, có đúng trọng tâm câu hỏi) — không phải cứ nộp bài là tính đạt.",
  },
  {
    icon: Shuffle,
    title: "Không lặp đề khi làm lại",
    desc: "Mỗi lần bấm làm lại, toàn bộ câu hỏi Đọc và Nghe được đổi sang một bộ đề khác để bạn luyện tập thoải mái.",
  },
];

const FAQS = [
  {
    q: "Bài test này có mất phí không?",
    a: "Hoàn toàn miễn phí, không cần đăng ký tài khoản, và không giới hạn số lần làm lại.",
  },
  {
    q: "Kết quả có đáng tin cậy không?",
    a: "Phần Đọc và Nghe được chấm đúng/sai khách quan theo đáp án. Phần Viết và Nói dùng thuật toán tự động phân tích nội dung (độ dài, từ vựng, có đúng trọng tâm câu hỏi) — hữu ích để bạn tự đánh giá và định hướng học, nhưng không thay thế hoàn toàn một giám khảo thật.",
  },
  {
    q: "Tôi cần chuẩn bị gì trước khi làm bài?",
    a: "Chỉ cần trình duyệt hỗ trợ ghi âm (khuyên dùng Chrome hoặc Edge) và cho phép quyền truy cập micro khi đến phần Nói. Không cần tài khoản hay cài đặt gì thêm.",
  },
  {
    q: "Bài test kéo dài bao lâu?",
    a: "Khoảng 15–20 phút cho đủ cả 4 phần: Đọc, Nghe, Viết, Nói.",
  },
];

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {FAQS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q} className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-brand-900"
            >
              {item.q}
              <ChevronDown className={`h-5 w-5 shrink-0 text-brand-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && <p className="border-t border-brand-50 px-5 py-4 text-sm leading-relaxed text-brand-900/70">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

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
              Đủ 4 kỹ năng: Đọc, Nghe, Viết, Nói (có ghi âm giọng thật)
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

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center font-display text-2xl font-bold text-brand-900 sm:text-3xl">
          Vì sao nên làm bài test này
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-2xl border border-brand-100 bg-white p-6">
              <span className="inline-flex rounded-full bg-brand-50 p-3 text-brand-600">
                <feature.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display font-bold text-brand-900">{feature.title}</h3>
              <p className="mt-2 text-sm text-brand-900/60">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <PlacementTest placementLevel={placementLevel} onApplyPlacement={onApplyPlacement} />

      <section className="border-t border-brand-100 bg-white px-6 py-16">
        <h2 className="text-center font-display text-2xl font-bold text-brand-900 sm:text-3xl">
          Các câu hỏi thường gặp
        </h2>
        <div className="mt-10">
          <FaqAccordion />
        </div>
      </section>

      <footer className="border-t border-brand-100 py-8 text-center text-sm text-brand-900/50">
        <a href="#top" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Quay lại trang chủ EngUp
        </a>
      </footer>
    </div>
  );
}
