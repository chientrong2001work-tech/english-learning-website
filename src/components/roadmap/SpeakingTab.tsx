import { useRef, useState } from "react";
import { AlertTriangle, Check, Mic, Play, RotateCcw, Square } from "lucide-react";
import { useAudioRecorder } from "../../lib/audioRecorder";
import { createContinuousRecognizer, type ContinuousSpeechRecognition } from "../../lib/speech";
import { scoreEnglishResponse } from "../../lib/textScoring";
import { placementSpeakingQuestions } from "../../data/placementSpeaking";

const MIN_WORDS_FOR_FULL_SCORE = 25;

interface SpeakingTabProps {
  onComplete: (percent: number) => void;
}

interface RecordedAnswer {
  id: string;
  score: number | null;
}

// Same format as the placement test's Speaking section: answer a personal
// question out loud, get it transcribed and scored — instead of the old
// "say this single vocabulary word" mic check.
export default function SpeakingTab({ onComplete }: SpeakingTabProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<RecordedAnswer[]>([]);
  const [transcript, setTranscript] = useState("");
  const [finished, setFinished] = useState(false);
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

  function finishAll(finalAnswers: RecordedAnswer[]) {
    setFinished(true);
    const avg =
      finalAnswers.length > 0
        ? Math.round(finalAnswers.reduce((sum, r) => sum + (r.score ?? 0), 0) / finalAnswers.length)
        : 0;
    onComplete(avg);
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
    const next = [...answers, { id: question.id, score: finalScore?.score ?? null }];
    setAnswers(next);
    recorder.reset();
    setTranscript("");
    if (index + 1 < placementSpeakingQuestions.length) {
      setIndex((i) => i + 1);
    } else {
      finishAll(next);
    }
  }

  function reRecord() {
    recorder.reset();
    setTranscript("");
  }

  function skipQuestion() {
    const next = [...answers, { id: question.id, score: 0 }];
    setAnswers(next);
    if (index + 1 < placementSpeakingQuestions.length) {
      setIndex((i) => i + 1);
    } else {
      finishAll(next);
    }
  }

  function restart() {
    setIndex(0);
    setAnswers([]);
    setTranscript("");
    setFinished(false);
    recorder.reset();
  }

  if (finished) {
    const avg =
      answers.length > 0 ? Math.round(answers.reduce((sum, r) => sum + (r.score ?? 0), 0) / answers.length) : 0;
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 py-6 text-center">
        <h3 className="font-display text-2xl font-bold text-brand-900">Kết quả: {avg}/100</h3>
        <button
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
        >
          <RotateCcw className="h-4 w-4" />
          Làm lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between text-sm font-semibold text-brand-900/50">
        <span>
          Câu {index + 1} / {placementSpeakingQuestions.length}
        </span>
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
    </div>
  );
}
