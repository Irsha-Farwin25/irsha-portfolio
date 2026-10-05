import { NextResponse } from "next/server";
import Groq, { APIError, AuthenticationError, RateLimitError } from "groq-sdk";
import { SYSTEM_PROMPT } from "@/lib/chat/knowledge";
import { checkRateLimit } from "@/lib/chat/rate-limit";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n/config";

/** Groq free-plan model (8K tokens/min, 200K tokens/day, shared by the whole account). */
const MODEL = "openai/gpt-oss-120b";
/** Only the latest turns are sent, keeping each request well under the per-minute token cap. */
const MAX_HISTORY = 6;
const MAX_MESSAGE_CHARS = 500;

/** Error messages in the visitor's language. */
const ERRORS: Record<Locale, Record<"unavailable" | "limit" | "invalid" | "tooLong" | "busy" | "failed" | "cutOff", string>> = {
  en: {
    unavailable: "The chat assistant isn't available right now.",
    limit: "You've reached the chat limit for now. Please try again later, or email Irsha directly.",
    invalid: "Invalid request body.",
    tooLong: `Please send a question of up to ${MAX_MESSAGE_CHARS} characters.`,
    busy: "The assistant is busy right now. Please try again in a minute.",
    failed: "Something went wrong. Please try again.",
    cutOff: "\n\n(The answer was cut off. Please try again.)",
  },
  ar: {
    unavailable: "المساعد الذكي غير متاح حاليًا.",
    limit: "لقد بلغت الحد المسموح من الأسئلة حاليًا. يُرجى المحاولة لاحقًا، أو مراسلة إرشا مباشرة عبر البريد الإلكتروني.",
    invalid: "الطلب غير صالح.",
    tooLong: `يُرجى إرسال سؤال لا يتجاوز ${MAX_MESSAGE_CHARS} حرف.`,
    busy: "المساعد مشغول حاليًا. يُرجى المحاولة بعد دقيقة.",
    failed: "حدث خطأ ما. يُرجى المحاولة مرة أخرى.",
    cutOff: "\n\n(انقطعت الإجابة. يُرجى المحاولة مرة أخرى.)",
  },
};

/**
 * For visitors browsing in Arabic: sent as the last system message, after the conversation, so it
 * outweighs the language of the question itself.
 */
const ARABIC_INSTRUCTION =
  "The visitor is browsing the site in Arabic. Write your whole reply in clear, professional Modern Standard Arabic (فصحى) suitable for a UAE hiring manager, even if the question is in English. Keep names, company names, technologies and URLs as written. Refer to Irsha as إرشا.";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

function parseMessages(body: unknown): ChatTurn[] | null {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 40) return null;

  const turns: ChatTurn[] = [];
  for (const m of raw) {
    const role = (m as ChatTurn)?.role;
    const content = (m as ChatTurn)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") return null;
    const text = content.trim();
    if (!text) continue;
    if (role === "user" && text.length > MAX_MESSAGE_CHARS) return null;
    // Earlier assistant replies are echoed back by the client; cap them so a tampered
    // history can't inflate the request.
    turns.push({ role, content: text.slice(0, 2000) });
  }

  const recent = turns.slice(-MAX_HISTORY);
  while (recent.length && recent[0].role !== "user") recent.shift();
  if (!recent.length || recent[recent.length - 1].role !== "user") return null;
  return recent;
}

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export async function POST(request: Request) {
  const locale = await getLocale();
  const errors = ERRORS[locale];
  if (!process.env.GROQ_API_KEY) {
    console.error("[chat] GROQ_API_KEY is not set");
    return NextResponse.json({ error: errors.unavailable }, { status: 503 });
  }

  const limit = checkRateLimit(clientKey(request));
  if (!limit.ok) {
    return NextResponse.json(
      { error: errors.limit },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: errors.invalid }, { status: 400 });
  }
  const messages = parseMessages(body);
  if (!messages) {
    return NextResponse.json({ error: errors.tooLong }, { status: 400 });
  }

  const groq = new Groq();
  let completion;
  try {
    completion = await groq.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
          ...(locale === "ar" ? [{ role: "system" as const, content: ARABIC_INSTRUCTION }] : []),
        ],
        stream: true,
        // Keep the model's hidden reasoning short and out of the visible reply.
        reasoning_effort: "low",
        include_reasoning: false,
        // Reasoning tokens share this budget; answers themselves are kept short by the prompt.
        max_completion_tokens: 800,
      },
      { signal: request.signal }
    );
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        { error: errors.busy },
        { status: 429, headers: { "Retry-After": err.headers?.get("retry-after") ?? "60" } }
      );
    }
    if (err instanceof AuthenticationError) {
      console.error("[chat] Groq rejected the API key");
      return NextResponse.json({ error: errors.unavailable }, { status: 503 });
    }
    if (err instanceof APIError) {
      console.error(`[chat] Groq API error ${err.status}:`, err.message);
    } else {
      console.error("[chat] Groq request failed:", err);
    }
    return NextResponse.json({ error: errors.failed }, { status: 502 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        if (!request.signal.aborted) {
          console.error("[chat] stream interrupted:", err);
          controller.enqueue(encoder.encode(errors.cutOff));
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      completion.controller.abort();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
