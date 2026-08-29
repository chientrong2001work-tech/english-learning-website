// Known-good, standard-accent, clearly-enunciating system voices, ordered by
// preference. Browsers otherwise fall back to whatever voice happens to be
// first/default, which is often a lower-quality or oddly-accented one —
// picking from this list is what actually fixes "khó nghe, hay bị vấp".
const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Microsoft Ava Online (Natural)",
  "Microsoft Aria Online (Natural)",
  "Microsoft Emma Online (Natural)",
  "Microsoft Guy Online (Natural)",
  "Microsoft Andrew Online (Natural)",
  "Samantha",
  "Daniel",
  "Microsoft Zira",
  "Microsoft David",
  "Google UK English Female",
  "Google UK English Male",
];

const FEMALE_VOICE_HINTS = ["female", "zira", "samantha", "victoria", "susan", "karen", "moira", "tessa", "fiona", "aria", "ava", "emma"];
const MALE_VOICE_HINTS = ["male", "david", "daniel", "alex", "fred", "george", "james", "arthur", "guy", "andrew"];

function getEnglishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
}

// Voices often load asynchronously after the page becomes interactive;
// touching getVoices() early nudges the browser to have them ready well
// before the learner clicks a play button.
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  window.speechSynthesis.getVoices();
}

function pickClearVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;
  for (const name of PREFERRED_VOICE_NAMES) {
    const match = voices.find((v) => v.name === name || v.name.includes(name));
    if (match) return match;
  }
  return voices.find((v) => v.default) ?? voices[0];
}

// Chrome can silently clip or drop an utterance spoken immediately after
// cancel() — a known Web Speech API quirk. A short delay before the actual
// speak() call is the standard workaround for that "vấp" (stutter/cut-off)
// at the start of playback.
const RESTART_DELAY_MS = 30;

// onEnd, when passed, fires once playback finishes (or immediately if TTS
// isn't supported, or if playback errors) — used to chain a follow-up action
// like re-opening the mic for a hands-free back-and-forth conversation.
export function speak(text: string, lang = "en-US", onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  const voice = pickClearVoice(getEnglishVoices());
  if (voice) utterance.voice = voice;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.setTimeout(() => window.speechSynthesis.speak(utterance), RESTART_DELAY_MS);
}

export interface DialogueLine {
  speaker: "A" | "B";
  text: string;
}

// Best-effort: pick two distinct, clear English system voices (ideally one
// male, one female, both from the preferred/clear list) so a dialogue's two
// speakers actually sound different, not just the same voice at a different
// pitch. Falls back to undefined when the browser hasn't exposed any voices
// yet (speakDialogue then falls back to pitch-only differentiation).
function pickDialogueVoices(): { a?: SpeechSynthesisVoice; b?: SpeechSynthesisVoice } {
  const voices = getEnglishVoices();
  if (voices.length === 0) return {};
  const female = voices.find((v) => FEMALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h)));
  const male = voices.find((v) => MALE_VOICE_HINTS.some((h) => v.name.toLowerCase().includes(h)));
  if (female && male && female.name !== male.name) return { a: female, b: male };
  const primary = pickClearVoice(voices);
  const secondary = voices.find((v) => v.name !== primary?.name) ?? primary;
  return { a: primary, b: secondary };
}

// Plays a short two-person dialogue as a queued sequence of utterances (the
// Web Speech API plays speak() calls back-to-back when cancel() isn't called
// in between). Uses two distinct, clear system voices when available (not
// pitch-shifted) so the speakers are easy to tell apart, with a slightly
// slower rate for clarity.
export function speakDialogue(lines: DialogueLine[], lang = "en-US") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const { a, b } = pickDialogueVoices();
  const hasDistinctVoices = !!a && !!b && a.name !== b.name;
  window.setTimeout(() => {
    for (const line of lines) {
      const utterance = new SpeechSynthesisUtterance(line.text);
      utterance.lang = lang;
      utterance.rate = 0.92;
      const voice = line.speaker === "A" ? a : b;
      if (voice) utterance.voice = voice;
      // Only fall back to pitch-shifting when we couldn't find two distinct
      // system voices — a real voice difference sounds far more natural.
      utterance.pitch = hasDistinctVoices ? 1 : line.speaker === "A" ? 1 : 1.2;
      window.speechSynthesis.speak(utterance);
    }
  }, RESTART_DELAY_MS);
}

export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// Only the 5 Vietnamese *tone* marks (sắc, huyền, hỏi, ngã, nặng) — not the
// vowel-shape diacritics (breve/circumflex/horn for ă, â, ê, ô, ơ, ư). Those
// change which vowel a word actually is, so stripping them collapses
// distinct words together: "mưa" (rain), "mùa" (season) and "mua" (buy) all
// used to normalize to the same "mua", making search match all three for
// any one of them.
const COMBINING_TONE_MARKS = /[\u0300\u0301\u0303\u0309\u0323]/g;
// After stripping tone marks, re-compose so ư/ơ/â/ê/ô/ă go back to a single
// codepoint (NFC) instead of staying as base+combining-mark pairs — the
// final character filter below only keeps ASCII a-z/0-9 plus these specific
// Vietnamese vowel letters, so a decomposed "u" + combining horn would
// otherwise have its horn silently dropped by that filter, undoing the
// distinction this whole function exists to preserve.
const ALLOWED_CHARS = /[^a-z0-9\săâêôơư]/g;

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(COMBINING_TONE_MARKS, "")
    .normalize("NFC")
    .replace(ALLOWED_CHARS, "")
    .trim()
    .replace(/\s+/g, " ");
}

// Case-fold and Unicode-normalize only — every tone mark and vowel-shape
// diacritic is kept as typed. Use this (not normalizeText) when matching
// Vietnamese meaning text the user is expected to type correctly, e.g. the
// vocabulary search: typing "nắng" should only match "nắng", not also
// "năng" (as in "kỹ năng") just because they share the same letters once
// tones are dropped.
export function normalizeExact(text: string): string {
  return text.toLowerCase().normalize("NFC").trim().replace(/\s+/g, " ");
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
