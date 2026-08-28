import { Sparkles, Trophy, BookOpen } from "lucide-react";
import { LayoutGroup, motion } from "framer-motion";
import TextRotate from "./fancy/text/text-rotate";

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
          <Sparkles className="h-4 w-4" />
          Lộ trình CEFR từ A1 đến C2
        </span>

        <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-tight text-brand-900 sm:text-5xl">
          Chinh phục tiếng Anh cùng{" "}
          <span className="text-brand-500">EngUp</span>
        </h1>

        <p className="max-w-xl text-lg text-brand-900/70">
          Học từ vựng theo từng cấp độ CEFR, vượt qua bài kiểm tra Nghe - Nói -
          Đọc - Viết để mở khóa cấp tiếp theo — tất cả miễn phí, ngay trên
          trình duyệt.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="#roadmap"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
          >
            <Trophy className="h-5 w-5" />
            Bắt đầu lộ trình CEFR
          </a>
          <a
            href="#flashcards"
            className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white px-6 py-3 font-semibold text-brand-700 transition hover:border-brand-400"
          >
            <BookOpen className="h-5 w-5" />
            Luyện từ vựng tự do
          </a>
        </div>

        <LayoutGroup>
          <motion.p
            layout
            className="flex flex-wrap items-center justify-center whitespace-pre pt-4 text-xl font-semibold text-brand-900 sm:text-2xl"
          >
            <motion.span layout transition={{ type: "spring", damping: 30, stiffness: 400 }}>
              Học tiếng Anh{" "}
            </motion.span>
            <TextRotate
              texts={["hiệu quả!", "dễ dàng", "miễn phí", "mọi lúc, mọi nơi", "vui vẻ 🎉"]}
              mainClassName="justify-center overflow-hidden rounded-lg bg-brand-500 px-3 py-1 text-white"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </motion.p>
        </LayoutGroup>
      </div>
    </section>
  );
}
