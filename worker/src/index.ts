export interface Env {
  GEMINI_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

// Gemini model with a free tier as of this writing — check
// https://ai.google.dev/pricing for the current free-tier model lineup if
// this one stops being free or gets deprecated, and swap the string below.
const GEMINI_MODEL = "gemini-3.6-flash";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

type RequestMode = "chat" | "summary";

interface ChatRequestBody {
  mode: RequestMode;
  topic: string;
  level: string;
  messages: ChatMessage[];
}

const CEFR_LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const CORRECTION_MARKER = "SỬA LỖI:";
const MAX_HISTORY_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 2000;

function corsHeaders(allowedOrigin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body: unknown, status: number, allowedOrigin: string): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(allowedOrigin),
    },
  });
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0 &&
    candidate.content.length <= MAX_MESSAGE_LENGTH
  );
}

function parseRequestBody(body: unknown): ChatRequestBody | null {
  if (typeof body !== "object" || body === null) return null;
  const candidate = body as Record<string, unknown>;

  const mode: RequestMode = candidate.mode === "summary" ? "summary" : "chat";

  if (typeof candidate.topic !== "string" || candidate.topic.trim().length === 0 || candidate.topic.length > 200) {
    return null;
  }
  if (typeof candidate.level !== "string" || !CEFR_LEVELS.has(candidate.level)) return null;
  if (!Array.isArray(candidate.messages) || candidate.messages.length === 0) return null;
  if (!candidate.messages.every(isChatMessage)) return null;

  if (mode === "chat") {
    const lastMessage = candidate.messages[candidate.messages.length - 1] as ChatMessage;
    if (lastMessage.role !== "user") return null;
  }

  return {
    mode,
    topic: candidate.topic.trim(),
    level: candidate.level,
    messages: candidate.messages as ChatMessage[],
  };
}

function buildSystemPrompt(topic: string, level: string): string {
  return `You are a friendly, patient English conversation partner helping a Vietnamese learner practice free-form spoken English.

Conversation topic: "${topic}"
Learner's CEFR level: ${level}

Rules for every reply:
- Reply in English only, at a complexity appropriate for CEFR ${level} (very simple words and short sentences for A1/A2, more natural and varied language for B1/B2, near-native nuance for C1/C2).
- Keep it conversational: 1-3 sentences, and always end with a follow-up question to keep the conversation going naturally.
- Stay in character as a conversation partner. Never mention that you are an AI or that this is a test.
- After your English reply, add a new line. If and only if the learner's most recent message contains a clear grammar, verb tense, word choice, or sentence structure mistake, write a line starting with exactly "${CORRECTION_MARKER}" followed by a short, friendly correction written in Vietnamese: quote the learner's mistake, give the corrected version, and briefly explain why in one short sentence. If there is no clear mistake in the learner's most recent message, do NOT add this line at all — omit it entirely.

Special case — the learner asks for help instead of answering:
- If the learner's most recent message is written in Vietnamese (or mixed Vietnamese/English) and is clearly asking for help or guidance rather than attempting an English answer — for example "hướng dẫn tôi trả lời", "gợi ý câu trả lời", "tôi nên nói gì", "giúp tôi với" — do NOT treat it as an answer attempt and do NOT add a "${CORRECTION_MARKER}" line for it. Instead reply with: one or two short sentences in Vietnamese explaining how to structure a good answer to your last question, then on a new line write "Ví dụ:" followed by one natural example answer in English at the learner's level. After that, still end by inviting them to try answering in their own words.`;
}

function buildSummaryPrompt(topic: string, level: string): string {
  return `You just finished a spoken English practice conversation with a Vietnamese learner (CEFR level ${level}, topic: "${topic}"). You are given the full conversation as message history — the learner's own turns, and your previous replies as the conversation partner.

Write a short overall assessment IN VIETNAMESE, reviewing only the learner's own turns (use your own turns only as context, don't review them). Structure it as:
1. One or two sentences giving an honest but encouraging overall comment on how the learner did.
2. The recurring grammar, word-choice, or sentence-structure mistakes you noticed across their turns, if any — quote each mistake with its correction, in Vietnamese. If there were no clear mistakes, say so honestly instead of inventing any.
3. Two or three concrete example English sentences the learner could reuse next time to express similar ideas more naturally, appropriate for CEFR ${level}.

Keep the whole response under about 200 words, plain text (no markdown headers, a simple dash "-" for list items is fine). Do not use the marker "${CORRECTION_MARKER}" anywhere in this response.`;
}

function splitReplyAndCorrection(rawText: string): { reply: string; correction: string | null } {
  const markerIndex = rawText.indexOf(CORRECTION_MARKER);
  if (markerIndex === -1) {
    return { reply: rawText.trim(), correction: null };
  }
  const reply = rawText.slice(0, markerIndex).trim();
  const correction = rawText.slice(markerIndex + CORRECTION_MARKER.length).trim();
  return { reply, correction: correction.length > 0 ? correction : null };
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

async function callGemini(apiKey: string, systemPrompt: string, messages: ChatMessage[]): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    generationConfig: { maxOutputTokens: 500 },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error ${res.status}: ${await res.text()}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const parts = data.candidates?.[0]?.content?.parts ?? [];
  return parts.map((p) => p.text ?? "").join("");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigin = env.ALLOWED_ORIGIN;

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
    }

    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, allowedOrigin);
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400, allowedOrigin);
    }

    const parsed = parseRequestBody(rawBody);
    if (!parsed) {
      return jsonResponse({ error: "Invalid request: expected { topic, level, messages }" }, 400, allowedOrigin);
    }

    const recentMessages = parsed.messages.slice(-MAX_HISTORY_MESSAGES);

    try {
      if (parsed.mode === "summary") {
        const rawText = await callGemini(
          env.GEMINI_API_KEY,
          buildSummaryPrompt(parsed.topic, parsed.level),
          recentMessages,
        );
        return jsonResponse({ summary: rawText.trim() }, 200, allowedOrigin);
      }

      const rawText = await callGemini(
        env.GEMINI_API_KEY,
        buildSystemPrompt(parsed.topic, parsed.level),
        recentMessages,
      );

      const { reply, correction } = splitReplyAndCorrection(rawText);
      return jsonResponse({ reply, correction }, 200, allowedOrigin);
    } catch (error) {
      console.error("Gemini API error:", error);
      return jsonResponse({ error: "Failed to get a response from the AI" }, 502, allowedOrigin);
    }
  },
};
