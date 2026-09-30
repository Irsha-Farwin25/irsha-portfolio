"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUp, RotateCcw, XIcon } from "lucide-react";
import { site } from "@/data/site";
import type { ChatMessage, ChatStatus } from "@/components/assistant/use-chat";

const MAX_CHARS = 500;
const SUGGESTIONS = [
  "What does Irsha work on?",
  "Tell me about her research",
  "What are her strongest skills?",
  "How can I contact her?",
];
const GREETING =
  "Hi! I'm Irsha's AI assistant. Ask me about her experience, projects, research or how to get in touch.";

/** Turns URLs and email addresses in an answer into links. */
function linkify(text: string): ReactNode[] {
  const pattern = /(https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;
  return text.split(pattern).map((part, i) => {
    if (i % 2 === 0) return part;
    const clean = part.replace(/[.,;:!?]+$/, "");
    const trailing = part.slice(clean.length);
    const href = clean.includes("@") && !clean.startsWith("http") ? `mailto:${clean}` : clean;
    return (
      <span key={i}>
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="break-all font-medium text-primary underline underline-offset-2"
        >
          {clean}
        </a>
        {trailing}
      </span>
    );
  });
}

/**
 * Her side of the conversation: a speech bubble with its tail pointing right, toward the avatar
 * standing beside the card.
 */
function SpeechBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex justify-end pr-1.5">
      <div className="relative max-w-[88%] rounded-2xl rounded-br-sm border border-border bg-secondary px-3.5 pt-2 pb-2.5 text-secondary-foreground">
        <span
          aria-hidden
          className="absolute -right-1.5 bottom-2.5 size-3 rotate-45 border-t border-r border-border bg-secondary"
        />
        <p className="font-mono text-[9.5px] uppercase tracking-[0.15em] text-primary">Irsha&apos;s AI assistant</p>
        <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

/**
 * Types text out letter by letter with a blinking caret, pausing a beat after punctuation, as if
 * she's saying it. The full text reserves the bubble's size up front (no growing line by line),
 * screen readers get it all at once, and reduced motion shows it straight away.
 */
export function Typewriter({ text, delay = 450, speed = 20 }: { text: string; delay?: number; speed?: number }) {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) return;
    let typed = 0;
    let timer: number | undefined;
    const tick = () => {
      typed += 1;
      setCount(typed);
      if (typed < text.length) timer = window.setTimeout(tick, /[.,!?]/.test(text[typed - 1]) ? speed * 6 : speed);
    };
    timer = window.setTimeout(tick, delay);
    return () => window.clearTimeout(timer);
  }, [text, delay, speed, reduce]);

  const shown = reduce ? text.length : count;
  const typing = shown < text.length;
  return (
    <span className="relative block">
      <span className="sr-only">{text}</span>
      <span aria-hidden className="invisible">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0">
        {text.slice(0, shown)}
        {typing && (
          <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.15em] animate-pulse rounded-full bg-primary" />
        )}
      </span>
    </span>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-1 py-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

interface ChatViewProps {
  messages: ChatMessage[];
  status: ChatStatus;
  error: string | null;
  onSend: (text: string) => void;
  onRetry: () => void;
  onClose: () => void;
  /** Reports the height the chat needs, so the card can shrink to fit it. */
  onHeightChange?: (px: number) => void;
}

/**
 * The chat on the back of the hero card: the visitor's questions on the left, her answers below
 * each one as speech bubbles pointing toward the avatar, and the input at the bottom.
 */
export function ChatView({ messages, status, error, onSend, onRetry, onClose, onHeightChange }: ChatViewProps) {
  const titleId = useId();
  const inputId = useId();
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const heightRef = useRef(onHeightChange);
  const busy = status !== "idle";
  const lastAnswer = [...messages].reverse().find((m) => m.role === "assistant");

  useEffect(() => {
    heightRef.current = onHeightChange;
  }, [onHeightChange]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Tell the card how tall the conversation is, whenever any part of it changes size.
  useEffect(() => {
    const parts = [headerRef.current, contentRef.current, formRef.current];
    if (parts.some((p) => !p)) return;
    const report = () => {
      const [header, content, form] = parts as HTMLElement[];
      // + 24: the conversation area's vertical padding.
      heightRef.current?.(Math.ceil(header.offsetHeight + content.offsetHeight + 24 + form.offsetHeight + 2));
    };
    const ro = new ResizeObserver(report);
    parts.forEach((p) => ro.observe(p!));
    report();
    return () => ro.disconnect();
  }, []);

  // Keep the latest question at the top of the view, with her answer flowing in below it
  // (scrolling to the very bottom would push the question out of sight on long answers).
  const latestQuestionId = [...messages].reverse().find((m) => m.role === "user")?.id;
  useEffect(() => {
    const scroller = scrollRef.current;
    const question = latestQuestionId
      ? scroller?.querySelector<HTMLElement>(`[data-question="${latestQuestionId}"]`)
      : null;
    // offsetTop is measured from the scroller (it is `relative`); 12 = its top padding.
    if (scroller && question) scroller.scrollTop = question.offsetTop - 12;
  }, [latestQuestionId, status, error]);

  // Grow the input with its content, up to about three lines.
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 88)}px`;
  }, [draft]);

  const submit = (text = draft) => {
    const value = text.trim();
    if (!value || busy || value.length > MAX_CHARS) return;
    onSend(value);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      className="flex h-full min-h-0 flex-col"
    >
      <div ref={headerRef}>
        <header className="grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <h2 id={titleId} className="justify-self-center whitespace-nowrap font-mono text-xs text-muted-foreground">
            <span aria-hidden="true">ask-irsha.ai</span>
            <span className="sr-only">Ask about {site.name.split(" ")[0]}, AI assistant</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close chat"
            className="flex size-7 items-center justify-center justify-self-end rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <XIcon className="size-4" />
          </button>
        </header>
        <div className="mx-4 border-t border-border/50" aria-hidden="true" />
      </div>

      <div
        ref={scrollRef}
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 [scrollbar-width:thin]"
      >
        <div ref={contentRef} className="space-y-3">
          {messages.length === 0 && (
            <>
              <SpeechBubble>
                <Typewriter text={GREETING} />
              </SpeechBubble>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => submit(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} data-question={m.id} className="flex justify-start">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-primary px-3.5 py-2 text-sm leading-relaxed text-primary-foreground">
                  {m.content}
                </p>
              </div>
            ) : (
              <SpeechBubble key={m.id}>{linkify(m.content)}</SpeechBubble>
            )
          )}

          {status === "waiting" && (
            <SpeechBubble>
              <TypingDots />
            </SpeechBubble>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-foreground">
              <p className="flex-1">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Retry
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {status === "waiting" ? "Assistant is thinking" : status === "idle" && lastAnswer ? "Answer received" : ""}
      </p>

      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="border-t border-border/60 p-3"
      >
        <div className="flex items-end gap-2 rounded-xl border border-input bg-background px-3 py-1.5 focus-within:border-primary focus-within:ring-3 focus-within:ring-ring/30">
          <label htmlFor={inputId} className="sr-only">
            Ask a question about Irsha
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            maxLength={MAX_CHARS}
            placeholder="Ask about Irsha's work…"
            className="max-h-22 flex-1 resize-none bg-transparent py-1 text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            aria-label="Send"
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity disabled:opacity-40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowUp className="size-4" />
          </button>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2 px-1 text-[11px] text-muted-foreground">
          <span>AI answers can be wrong. For anything important, email Irsha.</span>
          {draft.length > MAX_CHARS - 80 && (
            <span className="shrink-0 tabular-nums">
              {draft.length}/{MAX_CHARS}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
