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

// Plays a short two-person dialogue as a queued sequence of utterances (the
// Web Speech API plays speak() calls back-to-back when cancel() isn't called
// in between), with a distinct pitch per speaker and a slightly slower rate
// so the exchange stays easy to follow — used for listening comprehension
// instead of a single isolated word.
export function speakDialogue(lines: DialogueLine[], lang = "en-US") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  for (const line of lines) {
    const utterance = new SpeechSynthesisUtterance(line.text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    utterance.pitch = line.speaker === "A" ? 1 : 1.3;
    window.speechSynthesis.speak(utterance);
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
