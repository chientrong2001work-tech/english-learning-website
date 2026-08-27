import { useCallback, useEffect, useRef, useState } from "react";

export type RecordingStatus = "idle" | "requesting" | "recording" | "recorded" | "error" | "unsupported";

function isRecordingSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== "undefined"
  );
}

export function useAudioRecorder() {
  const [status, setStatus] = useState<RecordingStatus>(() => (isRecordingSupported() ? "idle" : "unsupported"));
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef(0);
  const audioUrlRef = useRef<string | null>(null);

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  // Note: does not revoke audioUrlRef on unmount — a confirmed recording's
  // object URL may still be held (and played back) by the parent after this
  // hook instance resets for the next question.
  useEffect(() => stopTracks, [stopTracks]);

  const start = useCallback(async () => {
    if (!isRecordingSupported()) {
      setStatus("unsupported");
      return;
    }
    setErrorMessage(null);
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setAudioUrl(url);
        setDurationSec(Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)));
        stopTracks();
        setStatus("recorded");
      };

      startTimeRef.current = Date.now();
      recorder.start();
      setStatus("recording");
    } catch {
      setErrorMessage("Không thể truy cập micro. Hãy cho phép quyền micro trong trình duyệt rồi thử lại.");
      setStatus("error");
    }
  }, [stopTracks]);

  const stop = useCallback(() => {
    recorderRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    // Intentionally does not revoke audioUrlRef.current — the caller may
    // have kept a reference to play it back later (e.g. in a results screen).
    audioUrlRef.current = null;
    setAudioUrl(null);
    setDurationSec(0);
    setErrorMessage(null);
    setStatus(isRecordingSupported() ? "idle" : "unsupported");
  }, []);

  return { status, audioUrl, durationSec, errorMessage, start, stop, reset };
}
