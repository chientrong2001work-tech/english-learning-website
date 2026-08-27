import Anthropic from "@anthropic-ai/sdk";

export interface Env {
  ANTHROPIC_API_KEY: string;
  ALLOWED_ORIGIN: string;
}

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface ChatRequestBody {
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

  if (typeof candidate.topic !== "string" || candidate.topic.trim().length === 0 || candidate.topic.length > 200) {
    return null;
  }
  if (typeof candidate.level !== "string" || !CEFR_LEVELS.has(candidate.level)) return null;
  if (!Array.isArray(candidate.messages) || candidate.messages.length === 0) return null;
  if (!candidate.messages.every(isChatMessage)) return null;

  const lastMessage = candidate.messages[candidate.messages.length - 1] as ChatMessage;
  if (lastMessage.role !== "user") return null;

  return {
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
- After your English reply, add a new line. If and only if the learner's most recent message contains a clear grammar, verb tense, word choice, or sentence structure mistake, write a line starting with exactly "${CORRECTION_MARKER}" followed by a short, friendly correction written in Vietnamese: quote the learner's mistake, give the corrected version, and briefly explain why in one short sentence. If there is no clear mistake in the learner's most recent message, do NOT add this line at all — omit it entirely.`;
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

    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

    try {
      const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 500,
        system: buildSystemPrompt(parsed.topic, parsed.level),
        messages: recentMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      const textBlocks = response.content.filter(
        (block): block is Anthropic.TextBlock => block.type === "text",
      );
      const rawText = textBlocks.map((block) => block.text).join("\n");

      const { reply, correction } = splitReplyAndCorrection(rawText);
      return jsonResponse({ reply, correction }, 200, allowedOrigin);
    } catch (error) {
      console.error("Anthropic API error:", error);
      return jsonResponse({ error: "Failed to get a response from the AI" }, 502, allowedOrigin);
    }
  },
};
