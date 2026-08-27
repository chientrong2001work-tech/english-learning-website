import { useState } from "react";
import { AlertTriangle, Check, Mic, Play, RotateCcw, Square } from "lucide-react";
import { useAudioRecorder } from "../../lib/audioRecorder";
import { placementSpeakingQuestions } from "../../data/placementSpeaking";

export interface SpeakingRecording {
  id: string;
  prompt: string;
  audioUrl: string;
  durationSec: number;
}

interface PlacementSpeakingProps {
  onComplete: (recordings: SpeakingRecording[]) => void;
}

export default function PlacementSpeaking({ onComplete }: PlacementSpeakingProps) {
  const [index, setIndex] = useState(0);
  const [recordings, setRecordings] = useState<SpeakingRecording[]>([]);
  const recorder = useAudioRecorder();

  const question = placementSpeakingQuestions[index];

  function confirmAndContinue() {
    if (!recorder.audioUrl) return;
    const next = [
      ...recordings,
      { id: question.id, prompt: question.prompt, audioUrl: recorder.audioUrl, durationSec: recorder.durationSec },
    ];
    setRecordings(next);
    recorder.reset();
    if (index + 1 < placementSpeakingQuestions.length) {
      setIndex((i) => i + 1);
    } else {
      onComplete(next);
    }
  }

  function skipQuestion() {
    if (index + 1 < placementSpeakingQuestions.length) {
      setIndex((i) => i + 1);
    } else {
      onComplete(recordings);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <div className="mb-6 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-500">
          <Mic className="h-4 w-4" />
          Phần 4: Nói · Câu {index + 1}/{placementSpeakingQuestions.length}
        </p>
        <h2 className="font-display text-2xl font-bold text-brand-900">Trả lời câu hỏi bằng giọng nói</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-brand-900/60">
          Hãy trả lời trực tiếp bằng giọng nói của bạn (không đọc lại từ vựng). Bài ghi âm chỉ lưu tạm trong trình
          duyệt để bạn nghe lại, không được gửi lên máy chủ nào.
        </p>
      </div>

      <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-lg shadow-brand-900/5">
        <p className="mb-1 text-center font-display text-xl font-bold text-brand-900">{question.prompt}</p>
        <p className="mb-6 text-center text-sm text-brand-900/50">{question.hint}</p>

        <div className="flex flex-col items-center gap-4">
          {recorder.status === "unsupported" && (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Trình duyệt này không hỗ trợ ghi âm micro.
              </p>
              <button
                onClick={skipQuestion}
                className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-6 py-3 font-semibold text-brand-700 transition hover:bg-brand-50"
              >
                Bỏ qua câu này
              </button>
            </div>
          )}

          {recorder.status === "idle" && (
            <button
              onClick={recorder.start}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600"
            >
              <Mic className="h-5 w-5" />
              Bắt đầu ghi âm
            </button>
          )}

          {recorder.status === "requesting" && (
            <p className="text-sm text-brand-900/60">Đang xin quyền truy cập micro...</p>
          )}

          {recorder.status === "recording" && (
            <button
              onClick={recorder.stop}
              className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-600"
            >
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-white" />
              Đang ghi âm... Bấm để dừng
              <Square className="h-4 w-4" />
            </button>
          )}

          {recorder.status === "error" && (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-red-500">
                <AlertTriangle className="h-4 w-4" />
                {recorder.errorMessage}
              </p>
              <button
                onClick={recorder.start}
                className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
              >
                <Mic className="h-5 w-5" />
                Thử lại
              </button>
            </div>
          )}

          {recorder.status === "recorded" && recorder.audioUrl && (
            <div className="flex w-full flex-col items-center gap-4">
              <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                <Play className="h-4 w-4" />
                Đã ghi âm ({recorder.durationSec}s) — nghe lại bên dưới
              </p>
              <audio controls src={recorder.audioUrl} className="w-full max-w-sm" />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={recorder.reset}
                  className="inline-flex items-center gap-2 rounded-full border border-brand-200 px-5 py-2.5 font-semibold text-brand-700 transition hover:bg-brand-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ghi âm lại
                </button>
                <button
                  onClick={confirmAndContinue}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
                >
                  <Check className="h-4 w-4" />
                  Xác nhận & tiếp tục
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
