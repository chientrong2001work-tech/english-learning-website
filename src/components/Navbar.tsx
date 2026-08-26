import { GraduationCap, Flame } from "lucide-react";

const navLinks = [
  { href: "#placement", label: "Test trình độ" },
  { href: "#roadmap", label: "Lộ trình CEFR" },
  { href: "#flashcards", label: "Từ vựng" },
  { href: "#quiz", label: "Luyện tập" },
  { href: "#grammar", label: "Ngữ pháp" },
];

interface NavbarProps {
  knownCount: number;
  totalCount: number;
}

export default function Navbar({ knownCount, totalCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2 font-display text-xl font-bold text-brand-700">
          <GraduationCap className="h-7 w-7" />
          EngUp
        </a>

        <nav className="hidden items-center gap-8 text-sm font-medium text-brand-900/80 md:flex">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-brand-600">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
          <Flame className="h-4 w-4 text-orange-500" />
          {knownCount}/{totalCount} từ đã thuộc
        </div>
      </div>
    </header>
  );
}
