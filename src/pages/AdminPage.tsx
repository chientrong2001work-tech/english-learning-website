import { useEffect, useState } from "react";
import { ArrowLeft, Ban, CheckCircle2, Loader2, LogOut, Mail, Phone, UserCog } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  blockIdentifier,
  listBlocked,
  listLoginRecords,
  unblockIdentifier,
  type BlockedEntry,
  type LoginRecord,
} from "../lib/members";

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

function formatProgress(p: LoginRecord["progress"]): string {
  if (!p) return "Chưa có dữ liệu";
  const levelPart = !p.currentLevel
    ? "Chưa bắt đầu"
    : p.currentLevelPassed
      ? `Đã hoàn thành ${p.currentLevel}`
      : `Đang học ${p.currentLevel} (${p.currentLevelKnown}/${p.currentLevelTarget} từ)`;
  return `${p.knownCount}/${p.totalVocab} từ · ${levelPart}`;
}

type IdentifierFilter = "all" | "email" | "phone";

export default function AdminPage() {
  const { logOut } = useAuth();
  const [logins, setLogins] = useState<LoginRecord[]>([]);
  const [blocked, setBlocked] = useState<BlockedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const [filter, setFilter] = useState<IdentifierFilter>("all");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [l, b] = await Promise.all([listLoginRecords(), listBlocked()]);
      l.sort((a, c) => (c.lastLoginAt?.toMillis() ?? 0) - (a.lastLoginAt?.toMillis() ?? 0));
      setLogins(l);
      setBlocked(b);
    } catch {
      setError("Không tải được dữ liệu. Kiểm tra lại Firestore đã bật và đã dán đúng quy tắc bảo mật chưa.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const blockedIds = new Set(blocked.map((b) => b.id));

  const filteredLogins = logins.filter((row) => {
    if (filter === "email") return row.email !== null;
    if (filter === "phone") return row.phoneNumber !== null;
    return true;
  });

  function isRowBlocked(row: LoginRecord): boolean {
    return (row.email !== null && blockedIds.has(row.email)) || (row.phoneNumber !== null && blockedIds.has(row.phoneNumber));
  }

  async function toggleBlock(row: LoginRecord) {
    setBusyUid(row.uid);
    setError("");
    try {
      if (isRowBlocked(row)) {
        if (row.email && blockedIds.has(row.email)) await unblockIdentifier(row.email);
        if (row.phoneNumber && blockedIds.has(row.phoneNumber)) await unblockIdentifier(row.phoneNumber);
      } else {
        const identifier = row.email ?? row.phoneNumber;
        if (identifier) await blockIdentifier(identifier, row.email ? "email" : "phone");
      }
      await refresh();
    } catch {
      setError("Không thực hiện được thao tác. Thử lại sau.");
    } finally {
      setBusyUid(null);
    }
  }

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

        <div className="mb-2 flex items-center gap-3">
          <UserCog className="h-7 w-7 text-brand-600" />
          <h1 className="font-display text-2xl font-bold text-brand-900">Trang quản trị học viên</h1>
        </div>
        <p className="mb-6 text-sm text-brand-900/60">
          Ai cũng có thể tự đăng nhập vào EngUp bằng Google, Email hoặc Số điện thoại. Dưới đây là toàn bộ học viên
          đã từng đăng nhập — bạn có thể chặn (hoặc bỏ chặn) bất kỳ ai.
        </p>

        {error && <p className="mb-4 text-sm font-semibold text-red-500">{error}</p>}

        <div className="mb-4 inline-flex rounded-full bg-brand-50 p-1 text-sm font-semibold">
          {(
            [
              { key: "all", label: "Tất cả" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Số điện thoại" },
            ] as { key: IdentifierFilter; label: string }[]
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`rounded-full px-4 py-2 transition ${
                filter === opt.key ? "bg-white text-brand-700 shadow" : "text-brand-900/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
          </div>
        ) : filteredLogins.length === 0 ? (
          <p className="rounded-2xl border border-brand-100 bg-white p-6 text-center text-sm text-brand-900/60">
            {logins.length === 0 ? "Chưa có ai đăng nhập vào EngUp." : "Không có học viên nào khớp với bộ lọc."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-brand-100 bg-white">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead className="border-b border-brand-100 text-xs font-semibold uppercase tracking-wide text-brand-900/40">
                <tr>
                  <th className="px-4 py-3">STT</th>
                  <th className="px-4 py-3">Email / Số điện thoại</th>
                  <th className="px-4 py-3">Đăng nhập bằng</th>
                  <th className="px-4 py-3">Tiến độ</th>
                  <th className="px-4 py-3">Lần đầu đăng nhập</th>
                  <th className="px-4 py-3">Lần cuối đăng nhập</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filteredLogins.map((row, index) => {
                  const rowBlocked = isRowBlocked(row);
                  return (
                    <tr key={row.uid} className="border-b border-brand-50 last:border-0">
                      <td className="px-4 py-3 text-brand-900/60">{index + 1}</td>
                      <td className="px-4 py-3 font-medium text-brand-900">
                        <span className="inline-flex items-center gap-2">
                          {row.email ? (
                            <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                          ) : (
                            <Phone className="h-4 w-4 shrink-0 text-brand-400" />
                          )}
                          {row.email ?? row.phoneNumber ?? row.displayName ?? row.uid}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-brand-900/70">{formatProviders(row.providers)}</td>
                      <td className="px-4 py-3 text-brand-900/70">{formatProgress(row.progress)}</td>
                      <td className="px-4 py-3 text-brand-900/70">{formatTimestamp(row.firstLoginAt)}</td>
                      <td className="px-4 py-3 text-brand-900/70">{formatTimestamp(row.lastLoginAt)}</td>
                      <td className="px-4 py-3">
                        {rowBlocked ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                            <Ban className="h-3.5 w-3.5" />
                            Đã chặn
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleBlock(row)}
                          disabled={busyUid === row.uid}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            rowBlocked
                              ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                              : "bg-red-50 text-red-600 hover:bg-red-100"
                          }`}
                        >
                          {rowBlocked ? "Bỏ chặn" : "Chặn"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-brand-900/40">
          Chặn một người sẽ ngăn họ đăng nhập ở lần tiếp theo. Nếu họ đang mở sẵn trang web, phiên đăng nhập hiện tại
          của họ có thể vẫn còn hoạt động cho tới khi họ tải lại trang.
        </p>
      </div>
    </div>
  );
}
