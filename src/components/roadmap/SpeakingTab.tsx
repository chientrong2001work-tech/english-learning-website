import { useEffect, useRef, useState } from "react";
import { Check, Mic, RotateCcw, Volume2, X } from "lucide-react";
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  normalizeText,
  speak,
  type MinimalSpeechRecognition,
} from "../../lib/speech";
import { sample } from "../../lib/array";
import type { LevelVocabWord } from "../../types";

const ITEM_COUNT = 5;

interface SpeakingTabProps {
  words: LevelVocabWord[];
  onComplete: (percent: number) => void;
}

type ItemResult = "correct" | "incorrect" | null;

export default function SpeakingTab({ words, onComplete }: SpeakingTabProps) {
  const supported = isSpeechRecognitionSupported();
  const [items, setItems] = useState<LevelVocabWord[]>(() => sample(words, Math.min(ITEM_COUNT, words.length)));
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState<ItemResult>(null);
  const [finished, setFinished] = useState(false);
  const recognizerRef = useRef<MinimalSpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      recognizerRef.current?.stop();
    };
  }, []);

  const item = items[current];

  function goNext(nextScore: number) {
    window.setTimeout(() => {
      if (current + 1 < items.length) {
        setCurrent((c) => c + 1);
        setResult(null);
        setTranscript("");
      } else {
        setFinished(true);
        onComplete(Math.round((nextScore / items.length) * 100));
      }
    }, 900);
  }

  function startListening() {
    if (!supported || listening) return;
    const recognizer = createSpeechRecognizer();
    if (!recognizer) return;
    recognizerRef.current = recognizer;
    setListening(true);
    setResult(null);

    recognizer.onresult = (event) => {
      const heard = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(heard);
      const isCorrect = normalizeText(heard).includes(normalizeText(item.word));
      const nextScore = isCorrect ? score + 1 : score;
      if (isCorrect) setScore(nextScore);
      setResult(isCorrect ? "correct" : "incorrect");
      setListening(false);
      goNext(nextScore);
    };
    recognizer.onerror = () => {
      setListening(false);
    };
    recognizer.onend = () => {
      setListening(false);
    };
    recognizer.start();
  }

  function markManually(correct: boolean) {
    const nextScore = correct ? score + 1 : score;
    if (correct) setScore(nextScore);
    setResult(correct ? "correct" : "incorrect");
    goNext(nextScore);
  }

  function restart() {
    setItems(sample(words, Math.min(ITEM_COUNT, words.length)));
    setCurrent(0);
    setScore(0);
    setResult(null);
    setTranscript("");
    setFinished(false);
  }

  if (words.length === 0) {
    return <p className="text-sm text-brand-900/60">Chưa có từ vựng cho cấp độ này.</p>;
  }

  return (
    <div className="mx-auto max-w-xl">
      {!finished ? (
        <>
          <div className="mb-4 flex items-center justify-between text-sm font-semibold text-brand-900/50">
            <span>Từ {current + 1} / {items.length}</span>
            <span>Điểm: {score}</span>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-100 bg-white p-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-500">Hãy phát âm từ này</p>
            <div className="flex items-center gap-3">
              <h3 className="font-display text-4xl font-bold text-brand-900">{item.word}</h3>
              <button
                onClick={() => speak(item.word)}
                className="rounded-full bg-brand-50 p-2 text-brand-600 hover:bg-brand-100"
                aria-label="Nghe mẫu"
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            {item.ipa && <p className="text-brand-900/40">{item.ipa}</p>}

            {supported ? (
              <>
                <button
                  onClick={startListening}
                  disabled={listening}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition ${
                    listening ? "bg-red-500" : "bg-brand-500 hover:bg-brand-600"
                  }`}
                >
                  <Mic className="h-5 w-5" />
                  {listening ? "Đang nghe..." : "Bắt đầu nói"}
                </button>
                {transcript && <p className="text-sm text-brand-900/60">Bạn đã nói: "{transcript}"</p>}
              </>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-brand-900/60">
                  Trình duyệt này chưa hỗ trợ nhận diện giọng nói. Hãy tự đọc to từ trên và tự đánh giá.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => markManually(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 font-semibold text-white hover:bg-brand-600"
                  >
                    <Check className="h-4 w-4" />
                    Tôi phát âm đúng
                  </button>
                  <button
                    onClick={() => markManually(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-red-50 px-5 py-2.5 font-semibold text-red-600 hover:bg-red-100"
                  >
                    <X className="h-4 w-4" />
                    Chưa chuẩn
                  </button>
                </div>
              </div>
            )}

            {result && (
              <p className={`font-semibold ${result === "correct" ? "text-brand-600" : "text-red-500"}`}>
                {result === "correct" ? "Chính xác!" : "Chưa đúng, thử lại ở từ tiếp theo nhé."}
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <h3 className="font-display text-2xl font-bold text-brand-900">
            Kết quả: {score}/{items.length} ({Math.round((score / items.length) * 100)}%)
          </h3>
          <button
            onClick={restart}
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3 font-semibold text-white transition hover:bg-brand-600"
          >
            <RotateCcw className="h-4 w-4" />
            Làm lại
          </button>
        </div>
      )}
    </div>
  );
}
