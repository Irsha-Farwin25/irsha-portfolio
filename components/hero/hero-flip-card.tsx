"use client";

import { useCallback, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useChatContext } from "@/components/assistant/chat-context";
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

/** Small "Ask AI" pill for the card's window bar — opens the chat right on the card. */
export function AskAiButton() {
  const { open, openChat } = useChatContext();
  return (
    <button
      type="button"
      onClick={openChat}
      aria-expanded={open}
      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Sparkles className="size-3" aria-hidden />
      Ask AI
    </button>
  );
}
