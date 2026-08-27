export function speak(text: string, lang = "en-US") {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export interface DialogueLine {
  speaker: "A" | "B";
  text: string;
}

const FEMALE_VOICE_HINTS = ["female", "zira", "samantha", "victoria", "susan", "karen", "moira", "tessa", "fiona"];
const MALE_VOICE_HINTS = ["male", "david", "daniel", "alex", "fred", "george", "james", "arthur"];

// Best-effort: pick two distinct, common English system voices (ideally one
// male, one female) so a dialogue's two speakers actually sound different,
// not just the same voice at a different pitch. Falls back to undefined when
// the browser hasn't exposed any voices yet (speakDialogue then falls back
// to pitch-only differentiation on a single default voice).
function pickDialogueVoices(): { a?: SpeechSynthesisVoice; b?: SpeechSynthesisVoice } {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return {};
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  if (voices.length === 0) return {};
  const female = voices.find((v) => FEMALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h)));
  const male = voices.find((v) => MALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h)));
  if (female && male && female.name !== male.name) return { a: female, b: male };
  if (voices.length >= 2) return { a: voices[0], b: voices[1] };
  return { a: voices[0], b: voices[0] };
}

// Plays a short two-person dialogue as a queued sequence of utterances (the
// Web Speech API plays speak() calls back-to-back when cancel() isn't called
// in between). Uses two distinct system voices when available (common,
// clear, natural-sounding — not pitch-shifted) so the speakers are easy to
// tell apart, with a slightly slower rate for clarity.
export function speakDialogue(lines: DialogueLine[], lang = "en-US") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const { a, b } = pickDialogueVoices();
  const hasDistinctVoices = !!a && !!b && a.name !== b.name;
  for (const line of lines) {
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    const voice = line.speaker === "A" ? a : b;
    if (voice) utterance.voice = voice;
    // Only fall back to pitch-shifting when we couldn't find two distinct
    // system voices — a real voice difference sounds far more natural.
    utterance.pitch = hasDistinctVoices ? 1 : line.speaker === "A" ? 1 : 1.2;
    window.speechSynthesis.speak(utterance);
  }
}

export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

export interface MinimalSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: { [index: number]: { [index: number]: { transcript: string } } } }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => MinimalSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createSpeechRecognizer(): MinimalSpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  return recognition;
}

export interface ContinuousRecognitionResults {
  length: number;
  [index: number]: { [index: number]: { transcript: string } };
}

export interface ContinuousSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ContinuousRecognitionResults }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

// Used to transcribe a longer spoken answer (multiple sentences) as it's
// recorded, unlike createSpeechRecognizer() which only returns one short
// final result — needed to score speaking answers on actual content.
export function createContinuousRecognizer(): ContinuousSpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const recognition = new Ctor() as unknown as ContinuousSpeechRecognition;
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  return recognition;
}
