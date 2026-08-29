import { useState } from "react";
import { GraduationCap, Flame, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { href: "#/kiem-tra-dau-vao", label: "Test trình độ" },
  { href: "#/phong-speaking-ao", label: "Phòng Speaking ảo" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logOut } = useAuth();
  const userLabel = user?.email ?? user?.phoneNumber ?? user?.displayName ?? "Học viên";

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

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 sm:px-4 sm:text-sm">
            <Flame className="h-4 w-4 shrink-0 text-orange-500" />
            <span className="whitespace-nowrap">
              {knownCount}/{totalCount} từ đã thuộc
            </span>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <span className="max-w-[10rem] truncate text-sm font-medium text-brand-900/70" title={userLabel}>
              {userLabel}
            </span>
            <button
              onClick={() => logOut()}
              aria-label="Đăng xuất"
              title="Đăng xuất"
              className="inline-flex items-center justify-center rounded-full p-2 text-brand-700 hover:bg-brand-50"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex items-center justify-center rounded-full p-2 text-brand-700 hover:bg-brand-50 md:hidden"
            aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-brand-100 bg-white px-6 py-3 text-sm font-medium text-brand-900/80 md:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-2 py-2.5 transition hover:bg-brand-50 hover:text-brand-600"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={() => {
              setMobileOpen(false);
              logOut();
            }}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-2.5 text-left text-red-500 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất ({userLabel})
          </button>
        </nav>
      )}
    </header>
  );
}
