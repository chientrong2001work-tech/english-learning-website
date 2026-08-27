import { useState } from "react";
import { Facebook, MessageCircle, Phone, X } from "lucide-react";

const FACEBOOK_URL = "https://www.facebook.com/trongchien.hiu";
const ZALO_URL = "https://zalo.me/0366648969";
const PHONE_TEL = "tel:+84366648969";
const PHONE_DISPLAY = "0366 648 969";

export default function ContactWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex flex-col items-end gap-3">
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Nhắn Zalo"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-lg transition hover:scale-105"
          >
            <MessageCircle className="h-6 w-6" />
          </a>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1877F2] text-white shadow-lg transition hover:scale-105"
          >
            <Facebook className="h-6 w-6" />
          </a>
          <a
            href={PHONE_TEL}
            aria-label={`Gọi điện ${PHONE_DISPLAY}`}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg transition hover:scale-105"
          >
            <Phone className="h-6 w-6" />
          </a>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Đóng liên hệ" : "Liên hệ"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl transition hover:bg-brand-700"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </button>
    </div>
  );
}
