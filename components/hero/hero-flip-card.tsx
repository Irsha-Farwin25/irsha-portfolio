"use client";

import { useCallback, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useChatContext } from "@/components/assistant/chat-context";
import { useT } from "@/components/i18n/locale-provider";
import { ChatView } from "@/components/assistant/chat-view";

/**
 * Wraps the hero card so it can flip over and become the chat. The front is the card as rendered
 * on the server and sets the full size; the back (the chat) shrinks to fit the conversation,
 * anchored at the bottom so it grows upward as it gets longer, up to the full card, then scrolls.
 */
export function HeroFlipCard({ children }: { children: ReactNode }) {
  const { chat, open, closeChat, registerCard } = useChatContext();
  const reduce = useReducedMotion();
  const flipped = open;
  const [chatHeight, setChatHeight] = useState<number | null>(null);
  const ref = useCallback((el: HTMLDivElement | null) => registerCard(el), [registerCard]);

  const face = "[backface-visibility:hidden]";

  return (
    <div ref={ref} className="w-full max-w-md [perspective:1800px]">
      <motion.div
        className="relative [transform-style:preserve-3d]"
        initial={false}
        animate={reduce ? undefined : { rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 110, damping: 17 }}
      >
        <div
          className={face}
          inert={flipped}
          style={reduce ? { opacity: flipped ? 0 : 1, transition: "opacity 200ms" } : undefined}
        >
          {children}
        </div>

        <div
          className={`${face} absolute inset-x-0 bottom-0 overflow-hidden rounded-2xl border border-black/5 bg-card shadow-xl shadow-foreground/10 dark:border-white/5`}
          inert={!flipped}
          style={{
            ...(reduce
              ? { opacity: flipped ? 1 : 0, pointerEvents: flipped ? ("auto" as const) : ("none" as const) }
              : { transform: "rotateY(180deg)" }),
            height: flipped && chatHeight ? `min(100%, ${chatHeight}px)` : "100%",
            transition: "height 350ms cubic-bezier(0.22, 1, 0.36, 1), opacity 200ms",
          }}
        >
          {flipped && (
            <ChatView
              messages={chat.messages}
              status={chat.status}
              error={chat.error}
              onSend={chat.send}
              onRetry={chat.retry}
              onClose={closeChat}
              onHeightChange={setChatHeight}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

/**
 * The card's call to the AI chat: an input-style button ("Ask my AI anything…") that flips the
 * card to the chat, plus a couple of suggested questions that open it already asking.
 */
export function AskAiPrompt() {
  const { chat, openChat } = useChatContext();
  const t = useT();
  const ask = (question?: string) => {
    openChat();
    if (question && chat.status === "idle") void chat.send(question);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={() => ask()}
        className="group flex w-full items-center gap-2.5 rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-start text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="flex-1 truncate">{t.hero.ask}</span>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">
          <ArrowRight className="size-3.5 rtl:-scale-x-100" aria-hidden />
        </span>
      </button>
      <div className="flex flex-wrap gap-1.5">
        {/* Questions offered on the card's front; picking one flips the card and asks it straight away. */}
        {t.hero.quickQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => ask(q)}
            className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Small "Ask AI" pill for the card's window bar — opens the chat right on the card. */
export function AskAiButton() {
  const { open, openChat } = useChatContext();
  const t = useT();
  return (
    <button
      type="button"
      onClick={openChat}
      aria-expanded={open}
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Sparkles className="size-3" aria-hidden />
      {t.hero.askAi}
    </button>
  );
}
