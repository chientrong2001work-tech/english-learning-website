import { useState } from "react";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { useLocalStorage } from "../hooks/useLocalStorage";

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function InstallBanner() {
  const { canInstall, installed, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useLocalStorage("engup-install-banner-dismissed", false);
  const [iosHintOpen, setIosHintOpen] = useState(false);

  if (dismissed || installed || isStandalone()) return null;
  if (!canInstall && !isIos()) return null;

  return (
    <div className="border-b border-brand-100 bg-brand-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-2.5 text-sm">
        <span className="font-medium text-brand-900">
          📱 Cài EngUp làm ứng dụng để học nhanh hơn, không cần mở trình duyệt.
        </span>
        <div className="flex items-center gap-2">
          {canInstall ? (
            <button
              onClick={promptInstall}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 font-semibold text-white transition hover:bg-brand-600"
            >
              <Download className="h-4 w-4" />
              Cài đặt
            </button>
          ) : (
            <button
              onClick={() => setIosHintOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-4 py-1.5 font-semibold text-white transition hover:bg-brand-600"
            >
              <Download className="h-4 w-4" />
              Cách cài đặt
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Đóng"
            className="rounded-full p-1.5 text-brand-700 transition hover:bg-brand-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      {iosHintOpen && (
        <div className="border-t border-brand-100 bg-white px-6 py-3 text-sm text-brand-900/70">
          Trên iPhone/iPad: mở trang này bằng <strong>Safari</strong>, bấm nút <strong>Chia sẻ</strong> (hình vuông
          có mũi tên đi lên) ở thanh dưới, sau đó chọn <strong>"Thêm vào MH chính"</strong> (Add to Home Screen).
        </div>
      )}
    </div>
  );
}
