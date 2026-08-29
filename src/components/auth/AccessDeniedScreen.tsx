import { LogOut, ShieldAlert } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function AccessDeniedScreen() {
  const { user, logOut } = useAuth();
  const identifier = user?.email ?? user?.phoneNumber ?? "tài khoản của bạn";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7fbf9] px-6">
      <div className="max-w-md rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-lg shadow-brand-900/5">
        <ShieldAlert className="mx-auto mb-4 h-10 w-10 text-amber-500" />
        <h2 className="mb-2 font-display text-xl font-bold text-brand-900">Chưa được cấp quyền truy cập</h2>
        <p className="mb-6 text-sm text-brand-900/60">
          Tài khoản <span className="font-semibold">{identifier}</span> chưa được thêm vào danh sách học viên. Vui
          lòng liên hệ quản trị viên để được cấp quyền.
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
