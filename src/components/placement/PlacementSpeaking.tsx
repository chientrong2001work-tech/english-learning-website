import { useRef, useState } from "react";
import { AlertTriangle, Check, Mic, Play, RotateCcw, Square } from "lucide-react";
import { useAudioRecorder } from "../../lib/audioRecorder";
import { createContinuousRecognizer, type ContinuousSpeechRecognition } from "../../lib/speech";
import { scoreEnglishResponse } from "../../lib/textScoring";
import { placementSpeakingQuestions } from "../../data/placementSpeaking";

const MIN_WORDS_FOR_FULL_SCORE = 25;

export interface SpeakingRecording {
  id: string;
  prompt: string;
  audioUrl: string;
  durationSec: number;
  transcript: string;
  score: number | null;
  band: string | null;
  feedback: string[];
}

interface PlacementSpeakingProps {
  onComplete: (recordings: SpeakingRecording[]) => void;
}

export default function PlacementSpeaking({ onComplete }: PlacementSpeakingProps) {
  const [index, setIndex] = useState(0);
  const [recordings, setRecordings] = useState<SpeakingRecording[]>([]);
  const [transcript, setTranscript] = useState("");
  const recorder = useAudioRecorder();
  const recognizerRef = useRef<ContinuousSpeechRecognition | null>(null);

  const question = placementSpeakingQuestions[index];
  const scored =
    recorder.status === "recorded" && transcript.trim()
      ? scoreEnglishResponse(transcript, {
          promptText: question.prompt,
          minWordsForFullLength: MIN_WORDS_FOR_FULL_SCORE,
          keywordGroups: question.keywordGroups,
        })
      : null;

  function startRecording() {
    setTranscript("");
    const recognizer = createContinuousRecognizer();
    recognizerRef.current = recognizer;
    if (recognizer) {
      recognizer.onresult = (event) => {
        let text = "";
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript + " ";
        }
        setTranscript(text.trim());
      };
      recognizer.onerror = () => {};
      recognizer.onend = () => {};
      try {
        recognizer.start();
      } catch {
        // ignore — recording still proceeds without a live transcript
      }
    }
    recorder.start();
  }

  function stopRecording() {
    recognizerRef.current?.stop();
    recorder.stop();
  }

  function confirmAndContinue() {
    if (!recorder.audioUrl) return;
    const finalScore = transcript.trim()
      ? scoreEnglishResponse(transcript, {
          promptText: question.prompt,
          minWordsForFullLength: MIN_WORDS_FOR_FULL_SCORE,
          keywordGroups: question.keywordGroups,
        })
      : null;
    const next = [
      ...recordings,
      {
        id: question.id,
        prompt: question.prompt,
        audioUrl: recorder.audioUrl,
        durationSec: recorder.durationSec,
        transcript: transcript.trim(),
        score: finalScore?.score ?? null,
        band: finalScore?.band ?? null,
        feedback: finalScore?.feedback ?? [],
      },
    ];
    setRecordings(next);
    recorder.reset();
    setTranscript("");
    if (index + 1 < placementSpeakingQuestions.length) {
      setIndex((i) => i + 1);
    } else {
      onComplete(next);
    }
  }

  function reRecord() {
    recorder.reset();
    setTranscript("");
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
          Phần 4: Speaking · Câu {index + 1}/{placementSpeakingQuestions.length}
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
              onClick={startRecording}
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
              onClick={stopRecording}
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
                onClick={startRecording}
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

              {scored ? (
                <div className="w-full rounded-2xl bg-brand-50 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                    Văn bản nhận diện được
                  </p>
                  <p className="mt-1 text-sm italic text-brand-900/70">"{transcript}"</p>
                  <p className="mt-3 font-display font-bold text-brand-900">
                    Điểm: {scored.score}/100 · Mức: {scored.band}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-brand-900/70">
                    {scored.feedback.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-brand-900/40">
                    Chấm điểm tự động dựa trên nội dung được nhận diện từ giọng nói — không thay thế giám khảo
                    thật.
                  </p>
                </div>
              ) : (
                <p className="max-w-sm text-center text-xs text-brand-900/40">
                  Trình duyệt này không nhận diện được nội dung giọng nói để chấm điểm tự động, nhưng bản ghi âm
                  vẫn được lưu để bạn tự nghe lại.
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={reRecord}
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
