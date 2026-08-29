import { useState, type FormEvent } from "react";
import { GraduationCap, Loader2, Phone } from "lucide-react";
import type { ConfirmationResult } from "firebase/auth";
import { useAuth } from "../../contexts/AuthContext";

type Mode = "email" | "phone";
type EmailAction = "login" | "signup";

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.5 0-14 4.2-17.7 10.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 34.9 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.9 39.7 16.4 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.6 5.6C39.9 37.5 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}

function errorMessage(code: string): string {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không đúng.";
    case "auth/email-already-in-use":
      return "Email này đã được đăng ký, hãy đăng nhập thay vì đăng ký.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu (tối thiểu 6 ký tự).";
    case "auth/invalid-email":
      return "Email không hợp lệ.";
    case "auth/invalid-phone-number":
      return "Số điện thoại không hợp lệ. Nhập theo định dạng quốc tế, ví dụ +84912345678.";
    case "auth/invalid-verification-code":
      return "Mã OTP không đúng.";
    case "auth/code-expired":
      return "Mã OTP đã hết hạn, hãy gửi lại.";
    case "auth/too-many-requests":
      return "Quá nhiều yêu cầu, vui lòng thử lại sau.";
    case "auth/popup-closed-by-user":
      return "Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất.";
    default:
      return "Có lỗi xảy ra, vui lòng thử lại.";
  }
}

export default function LoginScreen() {
  const { configured, signInWithGoogle, signInWithEmail, signUpWithEmail, sendPhoneCode } = useAuth();
  const [mode, setMode] = useState<Mode>("email");
  const [emailAction, setEmailAction] = useState<EmailAction>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function runAction(action: () => Promise<void>) {
    setError("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      const code = err instanceof Error && "code" in err ? String((err as { code: string }).code) : "";
      setError(errorMessage(code));
    } finally {
      setBusy(false);
    }
  }

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (emailAction === "login") {
      runAction(() => signInWithEmail(email, password));
    } else {
      runAction(() => signUpWithEmail(email, password));
    }
  }

  function handleSendOtp(e: FormEvent) {
    e.preventDefault();
    runAction(async () => {
      const result = await sendPhoneCode(phone.trim(), RECAPTCHA_CONTAINER_ID);
      setConfirmation(result);
    });
  }

  function handleConfirmOtp(e: FormEvent) {
    e.preventDefault();
    runAction(async () => {
      if (!confirmation) return;
      await confirmation.confirm(otp.trim());
    });
  }

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7fbf9] px-6">
        <div className="max-w-md rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">
          <p className="font-semibold">Đăng nhập chưa được cấu hình.</p>
          <p className="mt-2 text-sm">
            Thiếu thông tin kết nối Firebase (biến môi trường VITE_FIREBASE_*). Vui lòng cấu hình rồi triển khai lại.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7fbf9] px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-brand-100 bg-white p-8 shadow-lg shadow-brand-900/5">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-2 flex items-center gap-2 font-display text-2xl font-bold text-brand-700">
            <GraduationCap className="h-8 w-8" />
            EngUp
          </div>
          <p className="text-sm text-brand-900/60">Đăng nhập để bắt đầu học tiếng Anh</p>
        </div>

        <div className="mb-5 flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => runAction(signInWithGoogle)}
            className="inline-flex items-center justify-center gap-3 rounded-full border border-brand-100 px-5 py-3 font-semibold text-brand-900 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon />
            Đăng nhập với Google
          </button>
        </div>

        <div className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-brand-900/40">
          <div className="h-px flex-1 bg-brand-100" />
          hoặc
          <div className="h-px flex-1 bg-brand-100" />
        </div>

        <div className="mb-5 flex rounded-full bg-brand-50 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setMode("email")}
            className={`flex-1 rounded-full py-2 transition ${mode === "email" ? "bg-white text-brand-700 shadow" : "text-brand-900/60"}`}
          >
            Email
          </button>
          <button
            type="button"
            onClick={() => setMode("phone")}
            className={`flex-1 rounded-full py-2 transition ${mode === "phone" ? "bg-white text-brand-700 shadow" : "text-brand-900/60"}`}
          >
            Số điện thoại
          </button>
        </div>

        {mode === "email" && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="rounded-full border border-brand-100 px-4 py-3 text-sm outline-none focus:border-brand-400"
            />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu"
              className="rounded-full border border-brand-100 px-4 py-3 text-sm outline-none focus:border-brand-400"
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {emailAction === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
            <button
              type="button"
              onClick={() => setEmailAction((a) => (a === "login" ? "signup" : "login"))}
              className="text-center text-sm font-semibold text-brand-600 hover:underline"
            >
              {emailAction === "login" ? "Chưa có tài khoản? Đăng ký" : "Đã có tài khoản? Đăng nhập"}
            </button>
          </form>
        )}

        {mode === "phone" && !confirmation && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-100 px-4 py-3">
              <Phone className="h-4 w-4 shrink-0 text-brand-500" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+84912345678"
                className="w-full text-sm outline-none"
              />
            </div>
            <p className="text-xs text-brand-900/40">Nhập số điện thoại theo định dạng quốc tế, có dấu +.</p>
            <button
              type="submit"
              disabled={busy}
              className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Gửi mã OTP
            </button>
          </form>
        )}

        {mode === "phone" && confirmation && (
          <form onSubmit={handleConfirmOtp} className="flex flex-col gap-3">
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Nhập mã OTP"
              className="rounded-full border border-brand-100 px-4 py-3 text-center text-sm tracking-widest outline-none focus:border-brand-400"
            />
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Xác nhận mã OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setConfirmation(null);
                setOtp("");
              }}
              className="text-center text-sm font-semibold text-brand-600 hover:underline"
            >
              Đổi số điện thoại
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-center text-sm font-semibold text-red-500">{error}</p>}

        <div id={RECAPTCHA_CONTAINER_ID} />
      </div>
    </div>
  );
}
