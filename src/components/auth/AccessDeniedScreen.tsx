import { Ban, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function AccessDeniedScreen() {
  const { user, logOut } = useAuth();
  const identifier = user?.email ?? user?.phoneNumber ?? "tài khoản của bạn";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7fbf9] px-6">
      <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-lg shadow-brand-900/5">
        <Ban className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h2 className="mb-2 font-display text-xl font-bold text-brand-900">Tài khoản đã bị chặn</h2>
        <p className="mb-6 text-sm text-brand-900/60">
          Tài khoản <span className="font-semibold">{identifier}</span> đã bị quản trị viên chặn truy cập. Vui lòng
          liên hệ quản trị viên nếu bạn cho rằng đây là nhầm lẫn.
        </p>
        <button
          onClick={() => logOut()}
          className="mx-auto inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất, thử tài khoản khác
        </button>
      </div>
    </div>
  );
}
