import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, LogOut, Mail, Phone, Plus, Trash2, UserCog } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { addMember, listLoginRecords, listMembers, removeMember, type LoginRecord, type MemberEntry } from "../lib/members";

const PROVIDER_LABELS: Record<string, string> = {
  "google.com": "Google",
  "facebook.com": "Facebook",
  password: "Email/Mật khẩu",
  phone: "Số điện thoại",
};

function formatProviders(providers: string[]): string {
  if (providers.length === 0) return "—";
  return providers.map((p) => PROVIDER_LABELS[p] ?? p).join(", ");
}

function formatTimestamp(ts: LoginRecord["firstLoginAt"]): string {
  if (!ts) return "—";
  return ts.toDate().toLocaleString("vi-VN");
}

interface MergedRow {
  identifier: string;
  type: "email" | "phone";
  addedAt: MemberEntry["addedAt"];
  login: LoginRecord | null;
}

export default function AdminPage() {
  const { logOut } = useAuth();
  const [members, setMembers] = useState<MemberEntry[]>([]);
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newIdentifier, setNewIdentifier] = useState("");
  const [newType, setNewType] = useState<"email" | "phone">("email");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [m, l] = await Promise.all([listMembers(), listLoginRecords()]);
      setMembers(m);
      setLogins(l);
    } catch {
      setError("Không tải được dữ liệu. Kiểm tra lại Firestore đã bật và đã dán đúng quy tắc bảo mật chưa.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const value = newIdentifier.trim();
    if (!value) return;
    setBusy(true);
    setError("");
    try {
      await addMember(newType === "email" ? value.toLowerCase() : value, newType);
      setNewIdentifier("");
      await refresh();
    } catch {
      setError("Không thêm được. Thử lại sau.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(identifier: string) {
    setBusy(true);
    setError("");
    try {
      await removeMember(identifier);
      await refresh();
    } catch {
      setError("Không xóa được. Thử lại sau.");
    } finally {
      setBusy(false);
    }
  }

  const rows: MergedRow[] = members.map((m) => ({
    identifier: m.id,
    type: m.type,
    addedAt: m.addedAt,
    login: logins.find((l) => l.email === m.id || l.phoneNumber === m.id) ?? null,
  }));

  return (
    <div className="min-h-screen bg-[#f7fbf9]">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <a
            href="#top"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ
          </a>
          <button
            onClick={() => logOut()}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>

        <div className="mb-8 flex items-center gap-3">
          <UserCog className="h-7 w-7 text-brand-600" />
          <h1 className="font-display text-2xl font-bold text-brand-900">Trang quản trị học viên</h1>
        </div>

        <form
          onSubmit={handleAdd}
          className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4"
        >
          <div className="flex rounded-full bg-brand-50 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setNewType("email")}
              className={`rounded-full px-4 py-2 transition ${newType === "email" ? "bg-white text-brand-700 shadow" : "text-brand-900/60"}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setNewType("phone")}
              className={`rounded-full px-4 py-2 transition ${newType === "phone" ? "bg-white text-brand-700 shadow" : "text-brand-900/60"}`}
            >
              Số điện thoại
            </button>
          </div>
          <input
            value={newIdentifier}
            onChange={(e) => setNewIdentifier(e.target.value)}
            placeholder={newType === "email" ? "email@vidu.com" : "+84912345678"}
            className="min-w-[220px] flex-1 rounded-full border border-brand-100 px-4 py-2.5 text-sm outline-none focus:border-brand-400"
          />
          <button
            type="submit"
            disabled={busy || !newIdentifier.trim()}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Thêm học viên
          </button>
        </form>

        {error && <p className="mb-4 text-sm font-semibold text-red-500">{error}</p>}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : rows.length === 0 ? (
          <p className="rounded-2xl border border-brand-100 bg-white p-6 text-center text-sm text-brand-900/60">
            Chưa có học viên nào trong danh sách. Thêm email hoặc số điện thoại ở trên.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-brand-100 text-xs font-semibold uppercase tracking-wide text-brand-900/40">
                <tr>
                  <th className="px-4 py-3">Email / Số điện thoại</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Đăng nhập bằng</th>
                  <th className="px-4 py-3">Lần đầu đăng nhập</th>
                  <th className="px-4 py-3">Lần cuối đăng nhập</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.identifier} className="border-b border-brand-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-brand-900">
                      <span className="inline-flex items-center gap-2">
                        {row.type === "email" ? (
                          <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                        ) : (
                          <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                        )}
                        {row.identifier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.login ? (
                        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                          Đã đăng nhập
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                          Chưa đăng nhập
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-brand-900/70">
                      {row.login ? formatProviders(row.login.providers) : "—"}
                    </td>
                    <td className="px-4 py-3 text-brand-900/70">
                      {row.login ? formatTimestamp(row.login.firstLoginAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-brand-900/70">
                      {row.login ? formatTimestamp(row.login.lastLoginAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(row.identifier)}
                        disabled={busy}
                        title="Xóa quyền truy cập"
                        aria-label="Xóa quyền truy cập"
                        className="inline-flex items-center justify-center rounded-full p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-brand-900/40">
          Xóa một người khỏi danh sách sẽ chặn họ đăng nhập ở lần tiếp theo. Nếu họ đang mở sẵn trang web, phiên đăng
          nhập hiện tại của họ có thể vẫn còn hoạt động cho tới khi họ tải lại trang.
        </p>
      </div>
    </div>
  );
}
