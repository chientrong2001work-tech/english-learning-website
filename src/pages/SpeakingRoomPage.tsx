import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Lightbulb,
  Loader2,
  Mic,
  MessageCircle,
  Send,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import type { CEFRLevel } from "../types";
import {
  createContinuousRecognizer,
  isSpeechRecognitionSupported,
  speak,
  stopSpeech,
  type ContinuousSpeechRecognition,
} from "../lib/speech";

const API_URL = import.meta.env.VITE_SPEAKING_ROOM_API_URL as string | undefined;

// How long to wait after the learner stops speaking before auto-sending
// their answer, so the conversation flows hands-free instead of requiring a
// manual "stop recording" tap every turn.
const SILENCE_AUTO_SEND_MS = 1500;

const TOPIC_PRESETS = ["Du lịch", "Công việc", "Sở thích", "Ẩm thực", "Công nghệ", "Cuộc sống hàng ngày"];

const LEVELS: { level: CEFRLevel; desc: string }[] = [
  { level: "A1", desc: "Mới bắt đầu" },
  { level: "A2", desc: "Cơ bản" },
  { level: "B1", desc: "Trung cấp" },
  { level: "B2", desc: "Trên trung cấp" },
  { level: "C1", desc: "Nâng cao" },
  { level: "C2", desc: "Thành thạo" },
];

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  correction?: string | null;
}

const KICKOFF_MESSAGE =
  "[The learner just joined the conversation. Greet them warmly in English in 1-2 sentences and ask an opening question related to the topic. This bracketed text is a system instruction, not something the learner said — do not add a correction for it.]";

export default function SpeakingRoomPage() {
  const [phase, setPhase] = useState<"setup" | "chat" | "summary">("setup");
  const [topic, setTopic] = useState(TOPIC_PRESETS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [level, setLevel] = useState<CEFRLevel>("B1");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const recognizerRef = useRef<ContinuousSpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  // Guards the hands-free auto-listen chain (speak -> onEnd -> mic) so it
  // doesn't keep firing after the learner has already ended the session.
  const isConversationActiveRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const effectiveTopic = customTopic.trim() || topic;
  const speechSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    return () => {
      recognizerRef.current?.stop();
      stopSpeech();
      clearSilenceTimer();
    };
  }, []);

  function clearSilenceTimer() {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  // Best-effort: request mic permission directly inside the "Bắt đầu trò
  // chuyện" click so the browser treats it as a user gesture. Without this,
  // the first auto-start of the recognizer (which happens later, inside a
  // TTS onEnd callback) can silently fail to prompt for permission.
  async function primeMicPermission() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      // Ignore — the learner can still use the mic button manually, or type.
    }
  }

  async function sendToApi(history: ChatMessage[]) {
    if (!API_URL) {
      setError("Chưa cấu hình API cho Phòng Speaking ảo.");
      return;
    }
    setIsSending(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          topic: effectiveTopic,
          level,
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = (await res.json()) as { reply: string; correction: string | null };
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, correction: data.correction }]);
      speak(data.reply, "en-US", () => {
        if (isConversationActiveRef.current && speechSupported) startRecording();
      });
    } catch {
      setError("Không thể kết nối tới AI ngay lúc này. Vui lòng thử lại.");
    } finally {
      setIsSending(false);
    }
  }

  function startConversation() {
    void primeMicPermission();
    setMessages([]);
    setError(null);
    setPhase("chat");
    isConversationActiveRef.current = true;
    if (!API_URL) {
      setError("Chưa cấu hình API cho Phòng Speaking ảo.");
      return;
    }
    void sendToApi([{ role: "user", content: KICKOFF_MESSAGE }]);
  }

  async function endConversation() {
    recognizerRef.current?.stop();
    stopSpeech();
    clearSilenceTimer();
    setIsRecording(false);
    isConversationActiveRef.current = false;

    if (!API_URL || messagesRef.current.length === 0) {
      setPhase("setup");
      return;
    }

    setPhase("summary");
    setSummary(null);
    setSummaryError(null);
    setIsSummaryLoading(true);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "summary",
          topic: effectiveTopic,
          level,
          messages: messagesRef.current.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = (await res.json()) as { summary: string };
      setSummary(data.summary);
    } catch {
      setSummaryError("Không thể tạo nhận xét lúc này. Vui lòng thử lại sau.");
    } finally {
      setIsSummaryLoading(false);
    }
  }

  function backToSetup() {
    setPhase("setup");
    setMessages([]);
    setSummary(null);
    setSummaryError(null);
  }

  function startRecording() {
    const recognizer = createContinuousRecognizer();
    recognizerRef.current = recognizer;
    if (!recognizer) return;
    setDraft("");
    clearSilenceTimer();
    recognizer.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript + " ";
      }
      const trimmed = text.trim();
      setDraft(trimmed);

      clearSilenceTimer();
      if (trimmed) {
        silenceTimerRef.current = window.setTimeout(() => {
          handleSend(trimmed);
        }, SILENCE_AUTO_SEND_MS);
      }
    };
    recognizer.onerror = () => setIsRecording(false);
    recognizer.onend = () => setIsRecording(false);
    try {
      recognizer.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  }

  function stopRecording() {
    recognizerRef.current?.stop();
    clearSilenceTimer();
    setIsRecording(false);
  }

  function handleSend(overrideText?: string) {
    const text = (overrideText ?? draft).trim();
    if (!text || isSending) return;
    stopRecording();
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setDraft("");
    void sendToApi(nextMessages);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f7fbf9]">
      <header className="border-b border-brand-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a
            href="#top"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Về trang chủ EngUp
          </a>
          {phase === "chat" && (
            <button
              onClick={() => void endConversation()}
              className="rounded-full border border-brand-200 px-4 py-1.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
            >
              Kết thúc trò chuyện
            </button>
          )}
        </div>
      </header>

      {phase === "setup" ? (
        <section className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
          <div className="mb-10 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
              <MessageCircle className="h-4 w-4" />
              Trò chuyện trực tiếp với AI
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-brand-900 sm:text-4xl">
              Phòng Speaking ảo
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-brand-900/70">
              Nói chuyện tự do bằng tiếng Anh với AI theo chủ đề bạn chọn — AI tự nghe, tự trả lời liên tục như một
              cuộc gọi thật, không cần bấm nút mỗi lượt. AI sẽ chỉ ra lỗi ngữ pháp hoặc cấu trúc câu nếu bạn nói
              sai, kèm gợi ý sửa bằng tiếng Việt. Nếu bí câu trả lời, cứ gõ hoặc nói "hướng dẫn tôi trả lời" là AI
              sẽ gợi ý cho bạn.
            </p>
          </div>

          {!API_URL && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Chưa cấu hình API cho Phòng Speaking ảo, nên tính năng trò chuyện với AI hiện chưa hoạt động. Đây
                là tính năng cần một backend riêng (xem thư mục <code className="font-mono">worker/</code> trong
                dự án) để kết nối tới Gemini API một cách an toàn.
              </p>
            </div>
          )}

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-500">Chủ đề</p>
            <div className="flex flex-wrap gap-2">
              {TOPIC_PRESETS.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTopic(t);
                    setCustomTopic("");
                  }}
                  className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                    !customTopic.trim() && topic === t
                      ? "bg-brand-500 text-white"
                      : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Hoặc nhập chủ đề khác..."
              className="mt-3 w-full rounded-xl border border-brand-200 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
            />

            <p className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wide text-brand-500">Trình độ CEFR</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {LEVELS.map((l) => (
                <button
                  key={l.level}
                  onClick={() => setLevel(l.level)}
                  className={`rounded-xl px-2 py-2.5 text-center text-sm font-semibold transition ${
                    level === l.level
                      ? "bg-brand-500 text-white"
                      : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                  }`}
                  title={l.desc}
                >
                  {l.level}
                </button>
              ))}
            </div>

            <button
              onClick={startConversation}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
            >
              <MessageCircle className="h-5 w-5" />
              Bắt đầu trò chuyện
            </button>
          </div>
        </section>
      ) : phase === "summary" ? (
        <section className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
          <div className="mb-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
              <Sparkles className="h-4 w-4" />
              Nhận xét buổi luyện nói
            </span>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-brand-900 sm:text-4xl">
              Kết quả buổi trò chuyện
            </h1>
          </div>

          <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
            {isSummaryLoading && (
              <div className="flex items-center justify-center gap-2 py-10 text-brand-600">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tổng hợp nhận xét...
              </div>
            )}
            {summaryError && <p className="text-center text-sm font-semibold text-red-500">{summaryError}</p>}
            {summary && <div className="whitespace-pre-line text-sm leading-relaxed text-brand-900/80">{summary}</div>}
          </div>

          <button
            onClick={backToSetup}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
          >
            <MessageCircle className="h-5 w-5" />
            Luyện chủ đề khác
          </button>
        </section>
      ) : (
        <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6">
          <div className="mb-4 flex items-center justify-center gap-2 text-sm font-semibold text-brand-700">
            <span className="rounded-full bg-brand-50 px-3 py-1">{effectiveTopic}</span>
            <span className="rounded-full bg-brand-50 px-3 py-1">{level}</span>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pb-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-brand-500 text-white"
                      : "border border-brand-100 bg-white text-brand-900"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{m.content}</p>
                  {m.role === "assistant" && (
                    <button
                      onClick={() => speak(m.content)}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-500 hover:text-brand-700"
                    >
                      <Volume2 className="h-3 w-3" />
                      Nghe lại
                    </button>
                  )}
                  {m.correction && (
                    <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                      <p className="flex items-center gap-1 font-semibold">
                        <Lightbulb className="h-3.5 w-3.5" />
                        Gợi ý sửa lỗi
                      </p>
                      <p className="mt-1 leading-relaxed">{m.correction}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-brand-100 bg-white px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="sticky bottom-0 rounded-2xl border border-brand-100 bg-white p-4 shadow-lg shadow-brand-900/5">
            {error && <p className="mb-2 text-center text-sm font-semibold text-red-500">{error}</p>}
            <div className="flex items-end gap-3">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  speechSupported ? "Bấm micro để nói, hoặc gõ câu trả lời..." : "Gõ câu trả lời bằng tiếng Anh..."
                }
                rows={2}
                className="flex-1 resize-none rounded-2xl border border-brand-200 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none"
              />
              {speechSupported &&
                (isRecording ? (
                  <button
                    onClick={stopRecording}
                    className="shrink-0 rounded-full bg-red-500 p-3.5 text-white shadow-lg shadow-red-500/30"
                    aria-label="Dừng ghi âm"
                  >
                    <Square className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    onClick={startRecording}
                    className="shrink-0 rounded-full bg-brand-100 p-3.5 text-brand-600 transition hover:bg-brand-200"
                    aria-label="Bắt đầu nói"
                  >
                    <Mic className="h-5 w-5" />
                  </button>
                ))}
              <button
                onClick={() => handleSend()}
                disabled={!draft.trim() || isSending}
                className="shrink-0 rounded-full bg-brand-500 p-3.5 text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Gửi"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {isRecording && (
              <p className="mt-2 text-center text-xs text-brand-900/40">
                Đang nghe... nói xong, dừng lại một chút sẽ tự động gửi
              </p>
            )}
          </div>
        </section>
      )}

      <footer className="border-t border-brand-100 py-8 text-center text-sm text-brand-900/50">
        <a href="#top" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Quay lại trang chủ EngUp
        </a>
      </footer>
    </div>
  );
}
